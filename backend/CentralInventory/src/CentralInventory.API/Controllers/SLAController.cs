using CentralInventory.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CentralInventory.API.Controllers;

/// <summary>
/// SLA API Controller
/// </summary>
[ApiController]
[Route("api/v1/sla")]
[Authorize]
public class SLAController : ControllerBase
{
    private readonly ISLAService _slaService;
    private readonly ILogger<SLAController> _logger;
    
    public SLAController(
        ISLAService slaService,
        ILogger<SLAController> logger)
    {
        _slaService = slaService;
        _logger = logger;
    }
    
    /// <summary>
    /// Gets all SLA configurations
    /// GET /api/v1/sla/configurations
    /// </summary>
    [HttpGet("configurations")]
    [Authorize(Roles = "Admin,Legal")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetConfigurations()
    {
        var configurations = await _slaService.GetSLAConfigurationsAsync();
        
        return Ok(new { data = configurations });
    }
    
    /// <summary>
    /// Gets SLA breaches and approaching deadlines
    /// GET /api/v1/sla/breaches
    /// </summary>
    [HttpGet("breaches")]
    [Authorize(Roles = "Admin,Legal")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetBreaches()
    {
        var breaches = await _slaService.GetSLABreachesAsync();
        
        return Ok(new { data = breaches });
    }
    
    /// <summary>
    /// Gets SLA tracking for a specific transfer
    /// GET /api/v1/sla/tracking/{transferId}
    /// </summary>
    [HttpGet("tracking/{transferId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetTracking(Guid transferId)
    {
        var tracking = await _slaService.GetSLATrackingByTransferIdAsync(transferId);
        
        if (tracking == null)
        {
            return NotFound(new { error = $"SLA tracking not found for transfer {transferId}" });
        }
        
        return Ok(tracking);
    }
}
