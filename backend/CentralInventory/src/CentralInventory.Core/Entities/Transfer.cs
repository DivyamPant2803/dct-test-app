using CentralInventory.Core.Enums;

namespace CentralInventory.Core.Entities;

/// <summary>
/// Root aggregate for data transfer requests
/// Represents the main transfer entity with relational workflow data
/// </summary>
public class Transfer
{
    public Guid TransferId { get; set; }
    
    public string TransferName { get; set; } = string.Empty;
    
    public int ControlId { get; set; }
    
    public Guid? TemplateId { get; set; }
    
    // Status
    public string Status { get; set; } = nameof(TransferStatus.PENDING);
    
    // Context
    public string? Jurisdiction { get; set; }
    
    public string? Entity { get; set; }
    
    public string? SubjectType { get; set; }
    
    // MER-specific (nullable for non-MER transfers)
    public string? MERType { get; set; }
    
    // Escalation
    public string? EscalatedTo { get; set; }
    
    public Guid? EscalatedBy { get; set; }
    
    public DateTime? EscalatedAt { get; set; }
    
    public string? EscalationReason { get; set; }
    
    public bool IsHighPriority { get; set; }
    
    // Clarification
    public Guid? ClarificationRequestedBy { get; set; }
    
    public DateTime? ClarificationRequestedAt { get; set; }
    
    public string? ClarificationMessage { get; set; }
    
    public Guid? ClarificationRespondedBy { get; set; }
    
    public DateTime? ClarificationRespondedAt { get; set; }
    
    public string? ClarificationResponse { get; set; }
    
    // Tracking
    public Guid CreatedBy { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? CompletedAt { get; set; }
    
    // Navigation Properties
    public virtual ICollection<Requirement> Requirements { get; set; } = new List<Requirement>();
    
    public virtual ICollection<Evidence> Evidence { get; set; } = new List<Evidence>();
    
    public virtual TransferMERData? TransferMERData { get; set; }
    
    public virtual User? Creator { get; set; }
}
