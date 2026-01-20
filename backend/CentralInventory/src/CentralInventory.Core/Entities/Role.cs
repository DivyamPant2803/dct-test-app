namespace CentralInventory.Core.Entities;

/// <summary>
/// Role definition with permissions stored as JSON
/// </summary>
public class Role
{
    public int RoleId { get; set; }
    
    public string RoleName { get; set; } = string.Empty;
    
    public string? Description { get; set; }
    
    /// <summary>
    /// JSON array: ["submit_transfer", "review_evidence", "escalate"]
    /// </summary>
    public string? Permissions { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation Properties
    public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}
