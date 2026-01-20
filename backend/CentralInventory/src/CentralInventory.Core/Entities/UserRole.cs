namespace CentralInventory.Core.Entities;

/// <summary>
/// Many-to-many relationship between Users and Roles
/// </summary>
public class UserRole
{
    public int UserRoleId { get; set; }
    
    public Guid UserId { get; set; }
    
    public int RoleId { get; set; }
    
    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
    
    public Guid? AssignedBy { get; set; }
    
    /// <summary>
    /// Optional: role expiration for temporary assignments
    /// </summary>
    public DateTime? ExpiresAt { get; set; }
    
    // Navigation Properties
    public virtual User User { get; set; } = null!;
    
    public virtual Role Role { get; set; } = null!;
}
