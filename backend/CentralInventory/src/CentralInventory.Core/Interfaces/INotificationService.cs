namespace CentralInventory.Core.Interfaces;

/// <summary>
/// Logic for sending internal alerts and external notifications
/// </summary>
public interface INotificationService
{
    /// <summary>
    /// Sends notification to user
    /// </summary>
    Task SendNotificationAsync(
        Guid recipientUserId,
        string type,
        string message,
        Guid? transferId = null,
        Guid? evidenceId = null);
    
    /// <summary>
    /// Sends notification to all users with a specific role
    /// </summary>
    Task SendRoleNotificationAsync(
        string roleName,
        string type,
        string message,
        Guid? transferId = null);
}
