using CentralInventory.Core.DTOs.Requests;
using CentralInventory.Core.Entities;
using CentralInventory.Core.Enums;
using CentralInventory.Core.Interfaces;
using CentralInventory.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace CentralInventory.Infrastructure.Services;

/// <summary>
/// Workflow service implementation
/// Handles approve/reject/escalate logic (State Machine)
/// </summary>
public class WorkflowService : IWorkflowService
{
    private readonly ApplicationDbContext _context;
    private readonly IAuditService _auditService;
    private readonly INotificationService _notificationService;
    
    public WorkflowService(
        ApplicationDbContext context,
        IAuditService auditService,
        INotificationService notificationService)
    {
        _context = context;
        _auditService = auditService;
        _notificationService = notificationService;
    }
    
    public async Task<Evidence> ReviewEvidenceAsync(
        Guid evidenceId,
        ReviewEvidenceRequest request,
        Guid reviewerId)
    {
        var evidence = await _context.Evidence
            .Include(e => e.Transfer)
            .FirstOrDefaultAsync(e => e.EvidenceId == evidenceId);
        
        if (evidence == null)
        {
            throw new InvalidOperationException($"Evidence {evidenceId} not found");
        }
        
        var previousStatus = evidence.Status;
        
        // State machine logic
        switch (request.Decision.ToUpper())
        {
            case "APPROVE":
                evidence.Status = nameof(EvidenceStatus.APPROVED);
                evidence.ReviewerId = reviewerId;
                evidence.ReviewerNote = request.Note;
                evidence.ReviewedAt = DateTime.UtcNow;
                break;
                
            case "REJECT":
                evidence.Status = nameof(EvidenceStatus.REJECTED);
                evidence.ReviewerId = reviewerId;
                evidence.ReviewerNote = request.Note;
                evidence.ReviewedAt = DateTime.UtcNow;
                break;
                
            case "ESCALATE":
                evidence.Status = nameof(EvidenceStatus.ESCALATED);
                evidence.EscalatedTo = request.EscalateTo;
                evidence.EscalatedBy = reviewerId;
                evidence.EscalatedAt = DateTime.UtcNow;
                evidence.EscalationReason = request.EscalationReason;
                
                if (request.TaggedAuthorities != null && request.TaggedAuthorities.Any())
                {
                    evidence.TaggedAuthorities = JsonSerializer.Serialize(request.TaggedAuthorities);
                }
                break;
                
            default:
                throw new ArgumentException($"Invalid decision: {request.Decision}");
        }
        
        await _context.SaveChangesAsync();
        
        // Log audit trail
        await _auditService.LogAuditAsync(
            entityType: "Evidence",
            entityId: evidenceId,
            action: $"REVIEWED_{request.Decision.ToUpper()}",
            previousStatus: previousStatus,
            newStatus: evidence.Status,
            performedBy: reviewerId,
            notes: request.Note);
        
        // Send notification to uploader
        await _notificationService.SendNotificationAsync(
            recipientUserId: evidence.UploadedBy,
            type: $"evidence_{request.Decision.ToLower()}",
            message: $"Your evidence '{evidence.FileName}' has been {request.Decision.ToLower()}d",
            evidenceId: evidenceId);
        
        // Check if all evidence for transfer is approved
        if (request.Decision.ToUpper() == "APPROVE")
        {
            await CheckAndCompleteTransferAsync(evidence.TransferId);
        }
        
        return evidence;
    }
    
    public async Task<Transfer> EscalateTransferAsync(
        Guid transferId,
        EscalateTransferRequest request,
        Guid escalatedBy)
    {
        var transfer = await _context.Transfers.FindAsync(transferId);
        
        if (transfer == null)
        {
            throw new InvalidOperationException($"Transfer {transferId} not found");
        }
        
        var previousStatus = transfer.Status;
        
        transfer.Status = nameof(TransferStatus.ESCALATED);
        transfer.EscalatedTo = request.EscalateTo;
        transfer.EscalatedBy = escalatedBy;
        transfer.EscalatedAt = DateTime.UtcNow;
        transfer.EscalationReason = request.Reason;
        transfer.UpdatedAt = DateTime.UtcNow;
        
        await _context.SaveChangesAsync();
        
        // Log audit trail
        await _auditService.LogAuditAsync(
            entityType: "Transfer",
            entityId: transferId,
            action: "ESCALATED",
            previousStatus: previousStatus,
            newStatus: transfer.Status,
            performedBy: escalatedBy,
            notes: request.Reason);
        
        // Send notification to escalation target role
        await _notificationService.SendRoleNotificationAsync(
            roleName: request.EscalateTo,
            type: "transfer_escalated",
            message: $"Transfer '{transfer.TransferName}' has been escalated to {request.EscalateTo}",
            transferId: transferId);
        
        return transfer;
    }
    
    public async Task<bool> CheckAndCompleteTransferAsync(Guid transferId)
    {
        var transfer = await _context.Transfers
            .Include(t => t.Requirements)
                .ThenInclude(r => r.Evidence)
            .FirstOrDefaultAsync(t => t.TransferId == transferId);
        
        if (transfer == null)
        {
            return false;
        }
        
        // Check if all requirements have approved evidence
        bool allRequirementsApproved = transfer.Requirements.All(r =>
            r.Evidence.Any(e => e.Status == nameof(EvidenceStatus.APPROVED)));
        
        if (allRequirementsApproved && transfer.Requirements.Any())
        {
            var previousStatus = transfer.Status;
            transfer.Status = nameof(TransferStatus.COMPLETED);
            transfer.CompletedAt = DateTime.UtcNow;
            transfer.UpdatedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            
            // Log audit trail
            await _auditService.LogAuditAsync(
                entityType: "Transfer",
                entityId: transferId,
                action: "AUTO_COMPLETED",
                previousStatus: previousStatus,
                newStatus: transfer.Status,
                performedBy: Guid.Empty, // System action
                notes: "All requirements approved");
            
            // Send notification to creator
            await _notificationService.SendNotificationAsync(
                recipientUserId: transfer.CreatedBy,
                type: "transfer_completed",
                message: $"Transfer '{transfer.TransferName}' has been completed",
                transferId: transferId);
            
            return true;
        }
        
        return false;
    }
}
