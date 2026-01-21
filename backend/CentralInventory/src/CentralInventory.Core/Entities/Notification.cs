namespace CentralInventory.Core.Entities;

/// <summary>
/// In-app notification entity
/// Moved from NotificationService to proper entity
/// </summary>
public class Notification
{
    public Guid NotificationId { get; set; }
    
    public Guid RecipientUserId { get; set; }
    
    public string? RecipientRole { get; set; }
    
    public string Type { get; set; } = string.Empty;
    
    public string Message { get; set; } = string.Empty;
    
    // Links
    public Guid? TransferId { get; set; }
    
    public Guid? EvidenceId { get; set; }
    
    // Status
    public bool IsRead { get; set; }
    
    public DateTime? ReadAt { get; set; }
    
    // Channels
    public bool SentToEmail { get; set; }
    
    public bool SentToTeams { get; set; }
    
    // Tracking
    public Guid? SenderUserId { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation Properties
    public virtual User Recipient { get; set; } = null!;
    
    public virtual Transfer? Transfer { get; set; }
    
    public virtual Evidence? Evidence { get; set; }
}
