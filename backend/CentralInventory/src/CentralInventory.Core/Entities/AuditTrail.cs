namespace CentralInventory.Core.Entities;

/// <summary>
/// Comprehensive audit trail for all entity changes
/// Records every state change with full context
/// </summary>
public class AuditTrail
{
    public Guid AuditId { get; set; }
    
    // Entity tracking
    public string EntityType { get; set; } = string.Empty;
    
    public Guid EntityId { get; set; }
    
    // Action
    public string Action { get; set; } = string.Empty;
    
    public string? PreviousStatus { get; set; }
    
    public string? NewStatus { get; set; }
    
    // Details
    public Guid PerformedBy { get; set; }
    
    public DateTime PerformedAt { get; set; } = DateTime.UtcNow;
    
    public string? Notes { get; set; }
    
    /// <summary>
    /// JSON: detailed changes
    /// </summary>
    public string? ChangeDetails { get; set; }
    
    // Context
    public string? IPAddress { get; set; }
    
    public string? UserAgent { get; set; }
    
    // Navigation Property
    public virtual User Performer { get; set; } = null!;
}
