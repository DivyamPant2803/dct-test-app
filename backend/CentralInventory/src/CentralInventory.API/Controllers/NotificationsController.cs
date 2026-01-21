using CentralInventory.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CentralInventory.API.Controllers;

/// <summary>
/// Notifications API Controller
/// </summary>
[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<NotificationsController> _logger;
    
    public NotificationsController(
        ApplicationDbContext context,
        ILogger<NotificationsController> logger)
    {
        _context = context;
        _logger = logger;
    }
    
    /// <summary>
    /// Gets notifications for the current user
    /// GET /api/v1/notifications?isRead=false&page=1&pageSize=20
    /// </summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetNotifications(
        [FromQuery] bool? isRead = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        // Get current user ID from claims
        var userIdClaim = User.FindFirst("sub") ?? User.FindFirst("oid");
        if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
        {
            return Unauthorized("User ID not found in token");
        }
        
        var query = _context.Notifications
            .Where(n => n.RecipientUserId == userId);
        
        if (isRead.HasValue)
        {
            query = query.Where(n => n.IsRead == isRead.Value);
        }
        
        var totalCount = await query.CountAsync();
        var unreadCount = await _context.Notifications
            .Where(n => n.RecipientUserId == userId && !n.IsRead)
            .CountAsync();
        
        var notifications = await query
            .OrderByDescending(n => n.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
        
        return Ok(new
        {
            data = notifications,
            unreadCount,
            pagination = new
            {
                page,
                pageSize,
                totalItems = totalCount,
                totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            }
        });
    }
    
    /// <summary>
    /// Marks a notification as read
    /// PUT /api/v1/notifications/{id}/read
    /// </summary>
    [HttpPut("{id}/read")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> MarkAsRead(Guid id)
    {
        var notification = await _context.Notifications.FindAsync(id);
        
        if (notification == null)
        {
            return NotFound(new { error = $"Notification {id} not found" });
        }
        
        notification.IsRead = true;
        notification.ReadAt = DateTime.UtcNow;
        
        await _context.SaveChangesAsync();
        
        return Ok(new { message = "Notification marked as read" });
    }
    
    /// <summary>
    /// Marks all notifications as read for the current user
    /// PUT /api/v1/notifications/mark-all-read
    /// </summary>
    [HttpPut("mark-all-read")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> MarkAllAsRead()
    {
        // Get current user ID from claims
        var userIdClaim = User.FindFirst("sub") ?? User.FindFirst("oid");
        if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
        {
            return Unauthorized("User ID not found in token");
        }
        
        var unreadNotifications = await _context.Notifications
            .Where(n => n.RecipientUserId == userId && !n.IsRead)
            .ToListAsync();
        
        foreach (var notification in unreadNotifications)
        {
            notification.IsRead = true;
            notification.ReadAt = DateTime.UtcNow;
        }
        
        await _context.SaveChangesAsync();
        
        return Ok(new
        {
            message = "All notifications marked as read",
            count = unreadNotifications.Count
        });
    }
}
