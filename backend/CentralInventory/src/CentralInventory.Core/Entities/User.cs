namespace CentralInventory.Core.Entities;

/// <summary>
/// User entity integrated with Azure AD
/// </summary>
public class User
{
    public Guid UserId { get; set; }
    
    /// <summary>
    /// Azure AD Object ID for SSO integration
    /// </summary>
    public string AzureADObjectId { get; set; } = string.Empty;
    
    public string Email { get; set; } = string.Empty;
    
    public string FullName { get; set; } = string.Empty;
    
    public string? Department { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public Guid? CreatedBy { get; set; }
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    public Guid? UpdatedBy { get; set; }
    
    // Navigation Properties
    public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}
