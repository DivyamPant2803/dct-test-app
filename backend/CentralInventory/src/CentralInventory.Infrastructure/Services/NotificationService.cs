using CentralInventory.Core.Entities;
using CentralInventory.Core.Interfaces;
using CentralInventory.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CentralInventory.Infrastructure.Services;

/// <summary>
/// Notification service implementation
/// Handles in-app notifications (can be extended for Email/Teams)
/// </summary>
public class NotificationService : INotificationService
{
    private readonly ApplicationDbContext _context;
    
    public NotificationService(ApplicationDbContext context)
    {
        _context = context;
    }
    
    public async Task SendNotificationAsync(
        Guid recipientUserId,
        string type,
        string message,
        Guid? transferId = null,
        Guid? evidenceId = null)
    {
        var notification = new Notification
        {
            NotificationId = Guid.NewGuid(),
            RecipientUserId = recipientUserId,
            Type = type,
            Message = message,
            TransferId = transferId,
            EvidenceId = evidenceId,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };
        
        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();
        
        // TODO: Implement Azure Service Bus integration for Email/Teams notifications
    }
    
    public async Task SendRoleNotificationAsync(
        string roleName,
        string type,
        string message,
        Guid? transferId = null)
    {
        // Get all users with the specified role
        var userIds = await _context.UserRoles
            .Include(ur => ur.Role)
            .Where(ur => ur.Role.RoleName == roleName)
            .Select(ur => ur.UserId)
            .Distinct()
            .ToListAsync();
        
        // Send notification to each user
        foreach (var userId in userIds)
        {
            await SendNotificationAsync(userId, type, message, transferId);
        }
    }
}

/// <summary>
/// Notification entity (add to DbContext)
/// </summary>
public class Notification
{
    public Guid NotificationId { get; set; }
    public Guid RecipientUserId { get; set; }
    public string? RecipientRole { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public Guid? TransferId { get; set; }
    public Guid? EvidenceId { get; set; }
    public bool IsRead { get; set; }
    public DateTime? ReadAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
