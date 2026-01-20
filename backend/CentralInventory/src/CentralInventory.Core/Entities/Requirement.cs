namespace CentralInventory.Core.Entities;

/// <summary>
/// Represents a specific compliance requirement within a Transfer
/// Allows granular tracking: one transfer can have multiple requirements
/// </summary>
public class Requirement
{
    public Guid RequirementId { get; set; }
    
    public Guid TransferId { get; set; }
    
    public string RequirementName { get; set; } = string.Empty;
    
    public string? Description { get; set; }
    
    public string? Jurisdiction { get; set; }
    
    public string? Entity { get; set; }
    
    public string? SubjectType { get; set; }
    
    public string Status { get; set; } = nameof(RequirementStatus.PENDING);
    
    public DateTime? DueDate { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation Properties
    public virtual Transfer Transfer { get; set; } = null!;
    
    public virtual ICollection<Evidence> Evidence { get; set; } = new List<Evidence>();
}
