using System.Text.Json;
using CentralInventory.Core.DTOs.Requests;
using CentralInventory.Core.Entities;
using CentralInventory.Core.Enums;
using CentralInventory.Core.Interfaces;
using CentralInventory.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CentralInventory.Infrastructure.Services;

/// <summary>
/// Implementation of ITransferService
/// Demonstrates the Hybrid Data Strategy: JSON serialization for dynamic data
/// </summary>
public class TransferService : ITransferService
{
    private readonly ApplicationDbContext _context;
    private readonly IAuditService _auditService;
    private readonly INotificationService _notificationService;
    
    public TransferService(
        ApplicationDbContext context,
        IAuditService auditService,
        INotificationService notificationService)
    {
        _context = context;
        _auditService = auditService;
        _notificationService = notificationService;
    }
    
    /// <summary>
    /// Creates a new transfer with MER data in a single atomic transaction
    /// CRITICAL IMPLEMENTATION: Serializes object to JSON string before storage
    /// </summary>
    public async Task<Transfer> CreateTransferAsync(CreateTransferRequest request, Guid userId)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        
        try
        {
            // 1. Create Transfer entity
            var transfer = new Transfer
            {
                TransferId = Guid.NewGuid(),
                TransferName = request.TransferName,
                ControlId = request.ControlId,
                TemplateId = request.TemplateId,
                Jurisdiction = request.Jurisdiction,
                Entity = request.Entity,
                SubjectType = request.SubjectType,
                MERType = request.MERType,
                Status = nameof(TransferStatus.PENDING),
                CreatedBy = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            
            _context.Transfers.Add(transfer);
            
            // 2. If MER data provided, serialize to JSON and create TransferMERData
            if (request.MerTemplateData != null)
            {
                // CRITICAL: Serialize object to JSON string
                string jsonString = JsonSerializer.Serialize(request.MerTemplateData);
                
                var merData = new TransferMERData
                {
                    TransferId = transfer.TransferId,
                    FormData = jsonString,
                    TemplateVersion = request.MERType,
                    LastSavedAt = DateTime.UtcNow
                };
                
                _context.TransferMERData.Add(merData);
            }
            
            // 3. Save all changes in transaction
            await _context.SaveChangesAsync();
            
            // 4. Log audit trail
            await _auditService.LogAuditAsync(
                entityType: "Transfer",
                entityId: transfer.TransferId,
                action: "CREATED",
                previousStatus: null,
                newStatus: nameof(TransferStatus.PENDING),
                performedBy: userId,
                notes: $"Transfer '{request.TransferName}' created");
            
            // 5. Send notification to admins
            await _notificationService.SendRoleNotificationAsync(
                roleName: "Admin",
                type: "submit_request",
                message: $"New transfer '{request.TransferName}' submitted for review",
                transferId: transfer.TransferId);
            
            await transaction.CommitAsync();
            
            return transfer;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }
    
    public async Task<Transfer?> GetTransferByIdAsync(Guid transferId)
    {
        return await _context.Transfers
            .Include(t => t.TransferMERData)
            .Include(t => t.Requirements)
            .Include(t => t.Evidence)
            .Include(t => t.Creator)
            .FirstOrDefaultAsync(t => t.TransferId == transferId);
    }
    
    public async Task<(List<Transfer> Transfers, int TotalCount)> GetTransfersAsync(
        string? status = null,
        Guid? createdBy = null,
        string? jurisdiction = null,
        int page = 1,
        int pageSize = 20)
    {
        var query = _context.Transfers
            .Include(t => t.Creator)
            .AsQueryable();
        
        // Apply filters
        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(t => t.Status == status);
        }
        
        if (createdBy.HasValue)
        {
            query = query.Where(t => t.CreatedBy == createdBy.Value);
        }
        
        if (!string.IsNullOrEmpty(jurisdiction))
        {
            query = query.Where(t => t.Jurisdiction == jurisdiction);
        }
        
        var totalCount = await query.CountAsync();
        
        var transfers = await query
            .OrderByDescending(t => t.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
        
        return (transfers, totalCount);
    }
    
    public async Task<Transfer> UpdateTransferStatusAsync(Guid transferId, string newStatus, Guid userId)
    {
        var transfer = await _context.Transfers.FindAsync(transferId);
        
        if (transfer == null)
        {
            throw new InvalidOperationException($"Transfer {transferId} not found");
        }
        
        var previousStatus = transfer.Status;
        transfer.Status = newStatus;
        transfer.UpdatedAt = DateTime.UtcNow;
        
        if (newStatus == nameof(TransferStatus.COMPLETED))
        {
            transfer.CompletedAt = DateTime.UtcNow;
        }
        
        await _context.SaveChangesAsync();
        
        // Log audit trail
        await _auditService.LogAuditAsync(
            entityType: "Transfer",
            entityId: transferId,
            action: "STATUS_UPDATED",
            previousStatus: previousStatus,
            newStatus: newStatus,
            performedBy: userId);
        
        return transfer;
    }
}
