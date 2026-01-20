using CentralInventory.Core.Entities;
using CentralInventory.Core.Interfaces;
using CentralInventory.Infrastructure.Data;

namespace CentralInventory.Infrastructure.Services;

/// <summary>
/// Audit service implementation
/// Logs all entity changes to AuditTrail table
/// </summary>
public class AuditService : IAuditService
{
    private readonly ApplicationDbContext _context;
    
    public AuditService(ApplicationDbContext context)
    {
        _context = context;
    }
    
    public async Task LogAuditAsync(
        string entityType,
        Guid entityId,
        string action,
        string? previousStatus,
        string? newStatus,
        Guid performedBy,
        string? notes = null,
        string? changeDetails = null,
        string? ipAddress = null,
        string? userAgent = null)
    {
        var auditEntry = new AuditTrail
        {
            AuditId = Guid.NewGuid(),
            EntityType = entityType,
            EntityId = entityId,
            Action = action,
            PreviousStatus = previousStatus,
            NewStatus = newStatus,
            PerformedBy = performedBy,
            PerformedAt = DateTime.UtcNow,
            Notes = notes,
            ChangeDetails = changeDetails,
            IPAddress = ipAddress,
            UserAgent = userAgent
        };
        
        _context.AuditTrail.Add(auditEntry);
        await _context.SaveChangesAsync();
    }
}
