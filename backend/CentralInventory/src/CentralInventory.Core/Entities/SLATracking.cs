using CentralInventory.Core.Enums;

namespace CentralInventory.Core.Entities;

/// <summary>
/// SLA tracking per transfer
/// </summary>
public class SLATracking
{
    public Guid SLATrackingId { get; set; }
    
    public Guid TransferId { get; set; }
    
    public int SLAConfigId { get; set; }
    
    // Dates
    public DateTime StartDate { get; set; }
    
    public DateTime TargetDate { get; set; }
    
    public DateTime WarningDate { get; set; }
    
    public DateTime? CompletedDate { get; set; }
    
    // Status
    public string Status { get; set; } = nameof(SLAStatus.ON_TRACK);
    
    public int? DaysRemaining { get; set; }
    
    // Tracking
    public DateTime LastCheckedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation Properties
    public virtual Transfer Transfer { get; set; } = null!;
    
    public virtual SLAConfiguration SLAConfiguration { get; set; } = null!;
}
