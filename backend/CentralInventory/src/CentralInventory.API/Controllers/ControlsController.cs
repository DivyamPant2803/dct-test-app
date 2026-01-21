using CentralInventory.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CentralInventory.API.Controllers;

/// <summary>
/// Controls and Templates API Controller
/// </summary>
[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class ControlsController : ControllerBase
{
    private readonly ITemplateService _templateService;
    private readonly ILogger<ControlsController> _logger;
    
    public ControlsController(
        ITemplateService templateService,
        ILogger<ControlsController> logger)
    {
        _templateService = templateService;
        _logger = logger;
    }
    
    /// <summary>
    /// Gets all active controls
    /// GET /api/v1/controls?type=MER
    /// </summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetControls([FromQuery] string? type = null)
    {
        var controls = await _templateService.GetActiveControlsAsync(type);
        
        return Ok(new { data = controls });
    }
    
    /// <summary>
    /// Gets templates for a control
    /// GET /api/v1/controls/templates?controlId=1&status=ACTIVE
    /// </summary>
    [HttpGet("templates")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTemplates(
        [FromQuery] int controlId,
        [FromQuery] string? status = null)
    {
        var templates = await _templateService.GetTemplatesByControlIdAsync(controlId, status);
        
        return Ok(new { data = templates });
    }
    
    /// <summary>
    /// Gets a specific template by ID
    /// GET /api/v1/controls/templates/{id}
    /// </summary>
    [HttpGet("templates/{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetTemplate(Guid id)
    {
        var template = await _templateService.GetTemplateByIdAsync(id);
        
        if (template == null)
        {
            return NotFound(new { error = $"Template {id} not found" });
        }
        
        return Ok(template);
    }
}
