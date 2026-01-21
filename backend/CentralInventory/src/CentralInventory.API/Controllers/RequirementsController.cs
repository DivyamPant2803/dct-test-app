using CentralInventory.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CentralInventory.API.Controllers;

/// <summary>
/// Requirements API Controller
/// </summary>
[ApiController]
[Route("api/v1")]
[Authorize]
public class RequirementsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<RequirementsController> _logger;
    
    public RequirementsController(
        ApplicationDbContext context,
        ILogger<RequirementsController> logger)
    {
        _context = context;
        _logger = logger;
    }
    
    /// <summary>
    /// Gets requirements for a transfer
    /// GET /api/v1/transfers/{id}/requirements
    /// </summary>
    [HttpGet("transfers/{id}/requirements")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetRequirements(Guid id)
    {
        var requirements = await _context.Requirements
            .Where(r => r.TransferId == id)
            .Include(r => r.Evidence)
            .ToListAsync();
        
        return Ok(new { data = requirements });
    }
    
    /// <summary>
    /// Updates a requirement status
    /// PUT /api/v1/requirements/{id}
    /// </summary>
    [HttpPut("requirements/{id}")]
    [Authorize(Roles = "Admin,Legal")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateRequirement(
        Guid id,
        [FromBody] UpdateRequirementRequest request)
    {
        var requirement = await _context.Requirements.FindAsync(id);
        
        if (requirement == null)
        {
            return NotFound(new { error = $"Requirement {id} not found" });
        }
        
        requirement.Status = request.Status;
        requirement.UpdatedAt = DateTime.UtcNow;
        
        await _context.SaveChangesAsync();
        
        return Ok(new
        {
            message = "Requirement updated successfully",
            requirement
        });
    }
}

/// <summary>
/// Request DTO for updating requirement
/// </summary>
public class UpdateRequirementRequest
{
    public string Status { get; set; } = string.Empty;
}
