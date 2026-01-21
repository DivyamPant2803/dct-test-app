namespace CentralInventory.Core.Entities;

/// <summary>
/// SLA configuration per control
/// </summary>
public class SLAConfiguration
{
    public int SLAConfigId { get; set; }
    
    public int ControlId { get; set; }
    
    // SLA Timing (in business days)
    public int TargetResponseDays { get; set; }
    
    public int WarningThresholdDays { get; set; }
    
    // Escalation
    public bool AutoEscalateOnBreach { get; set; }
    
    public string? EscalateToRole { get; set; }
    
    // Notifications
    public bool NotifyOnApproaching { get; set; } = true;
    
    public bool NotifyOnBreach { get; set; } = true;
    
    public bool IsActive { get; set; } = true;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation Properties
    public virtual Control Control { get; set; } = null!;
    
    public virtual ICollection<SLATracking> SLATrackings { get; set; } = new List<SLATracking>();
}
