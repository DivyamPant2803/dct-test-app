using CentralInventory.Core.DTOs.Requests;
using CentralInventory.Core.Entities;

namespace CentralInventory.Core.Interfaces;

/// <summary>
/// Approvals, rejections, escalations (State Machine)
/// </summary>
public interface IWorkflowService
{
    /// <summary>
    /// Reviews evidence (Approve/Reject/Escalate)
    /// Implements state machine logic
    /// </summary>
    Task<Evidence> ReviewEvidenceAsync(
        Guid evidenceId,
        ReviewEvidenceRequest request,
        Guid reviewerId);
    
    /// <summary>
    /// Escalates a transfer to Legal/Business team
    /// </summary>
    Task<Transfer> EscalateTransferAsync(
        Guid transferId,
        EscalateTransferRequest request,
        Guid escalatedBy);
    
    /// <summary>
    /// Checks if all requirements are approved and completes transfer
    /// </summary>
    Task<bool> CheckAndCompleteTransferAsync(Guid transferId);
}
