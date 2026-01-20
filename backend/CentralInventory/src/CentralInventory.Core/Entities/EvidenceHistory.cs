namespace CentralInventory.Core.Entities;

/// <summary>
/// Tracks the history of evidence state changes
/// </summary>
public class EvidenceHistory
{
    public Guid HistoryId { get; set; }
    
    public Guid EvidenceId { get; set; }
    
    public string Action { get; set; } = string.Empty;
    
    public string? PreviousStatus { get; set; }
    
    public string NewStatus { get; set; } = string.Empty;
    
    public Guid PerformedBy { get; set; }
    
    public DateTime PerformedAt { get; set; } = DateTime.UtcNow;
    
    public string? Notes { get; set; }
    
    // Navigation Properties
    public virtual Evidence Evidence { get; set; } = null!;
    
    public virtual User Performer { get; set; } = null!;
}
