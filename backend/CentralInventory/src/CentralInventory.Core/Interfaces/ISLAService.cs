using CentralInventory.Core.Entities;

namespace CentralInventory.Core.Interfaces;

/// <summary>
/// SLA tracking and monitoring service
/// </summary>
public interface ISLAService
{
    /// <summary>
    /// Gets SLA configurations
    /// </summary>
    Task<List<SLAConfiguration>> GetSLAConfigurationsAsync();
    
    /// <summary>
    /// Gets SLA tracking for a transfer
    /// </summary>
    Task<SLATracking?> GetSLATrackingByTransferIdAsync(Guid transferId);
    
    /// <summary>
    /// Gets all SLA breaches
    /// </summary>
    Task<List<SLATracking>> GetSLABreachesAsync();
    
    /// <summary>
    /// Creates SLA tracking for a new transfer
    /// </summary>
    Task<SLATracking> CreateSLATrackingAsync(Guid transferId, int controlId);
    
    /// <summary>
    /// Updates SLA tracking status
    /// </summary>
    Task UpdateSLAStatusAsync(Guid slaTrackingId);
}
