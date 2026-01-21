using CentralInventory.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CentralInventory.API.Controllers;

/// <summary>
/// Audit Trail API Controller
/// </summary>
[ApiController]
[Route("api/v1")]
[Authorize]
public class AuditController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<AuditController> _logger;
    
    public AuditController(
        ApplicationDbContext context,
        ILogger<AuditController> logger)
    {
        _context = context;
        _logger = logger;
    }
    
    /// <summary>
    /// Gets audit trail for a transfer
    /// GET /api/v1/transfers/{id}/audit-trail
    /// </summary>
    [HttpGet("transfers/{id}/audit-trail")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTransferAuditTrail(Guid id)
    {
        var auditTrail = await _context.AuditTrail
            .Include(a => a.Performer)
            .Where(a => a.EntityType == "Transfer" && a.EntityId == id)
            .OrderByDescending(a => a.PerformedAt)
            .Select(a => new
            {
                a.AuditId,
                a.Action,
                a.PreviousStatus,
                a.NewStatus,
                a.PerformedBy,
                PerformedByName = a.Performer.FullName,
                a.PerformedAt,
                a.Notes
            })
            .ToListAsync();
        
        return Ok(new { data = auditTrail });
    }
    
    /// <summary>
    /// Gets audit trail for evidence
    /// GET /api/v1/evidence/{id}/audit-trail
    /// </summary>
    [HttpGet("evidence/{id}/audit-trail")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetEvidenceAuditTrail(Guid id)
    {
        var auditTrail = await _context.AuditTrail
            .Include(a => a.Performer)
            .Where(a => a.EntityType == "Evidence" && a.EntityId == id)
            .OrderByDescending(a => a.PerformedAt)
            .Select(a => new
            {
                a.AuditId,
                a.Action,
                a.PreviousStatus,
                a.NewStatus,
                a.PerformedBy,
                PerformedByName = a.Performer.FullName,
                a.PerformedAt,
                a.Notes
            })
            .ToListAsync();
        
        return Ok(new { data = auditTrail });
    }
}
