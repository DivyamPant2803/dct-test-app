namespace CentralInventory.Core.Interfaces;

/// <summary>
/// Logging changes to AuditTrail table
/// </summary>
public interface IAuditService
{
    /// <summary>
    /// Logs an audit trail entry
    /// </summary>
    Task LogAuditAsync(
        string entityType,
        Guid entityId,
        string action,
        string? previousStatus,
        string? newStatus,
        Guid performedBy,
        string? notes = null,
        string? changeDetails = null,
        string? ipAddress = null,
        string? userAgent = null);
}
