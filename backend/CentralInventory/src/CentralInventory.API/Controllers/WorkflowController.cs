using CentralInventory.Core.DTOs.Requests;
using CentralInventory.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CentralInventory.API.Controllers;

/// <summary>
/// Workflow API Controller
/// Handles review, escalation, and workflow actions
/// </summary>
[ApiController]
[Route("api/v1")]
[Authorize]
public class WorkflowController : ControllerBase
{
    private readonly IWorkflowService _workflowService;
    private readonly ILogger<WorkflowController> _logger;
    
    public WorkflowController(
        IWorkflowService workflowService,
        ILogger<WorkflowController> logger)
    {
        _workflowService = workflowService;
        _logger = logger;
    }
    
    /// <summary>
    /// Reviews evidence (Approve/Reject/Escalate)
    /// POST /api/v1/evidence/{id}/review
    /// </summary>
    [HttpPost("evidence/{id}/review")]
    [Authorize(Roles = "Admin,Legal")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ReviewEvidence(
        Guid id,
        [FromBody] ReviewEvidenceRequest request)
    {
        try
        {
            // Get current user ID from claims
            var userIdClaim = User.FindFirst("sub") ?? User.FindFirst("oid");
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized("User ID not found in token");
            }
            
            var evidence = await _workflowService.ReviewEvidenceAsync(id, request, userId);
            
            return Ok(new
            {
                message = $"Evidence {request.Decision.ToLower()}d successfully",
                evidenceStatus = evidence.Status,
                evidenceId = evidence.EvidenceId
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reviewing evidence {EvidenceId}", id);
            return BadRequest(new { error = ex.Message });
        }
    }
    
    /// <summary>
    /// Escalates a transfer
    /// POST /api/v1/transfers/{id}/escalate
    /// </summary>
    [HttpPost("transfers/{id}/escalate")]
    [Authorize(Roles = "Admin,Legal")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> EscalateTransfer(
        Guid id,
        [FromBody] EscalateTransferRequest request)
    {
        try
        {
            // Get current user ID from claims
            var userIdClaim = User.FindFirst("sub") ?? User.FindFirst("oid");
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized("User ID not found in token");
            }
            
            var transfer = await _workflowService.EscalateTransferAsync(id, request, userId);
            
            return Ok(new
            {
                message = $"Transfer escalated to {request.EscalateTo}",
                transferStatus = transfer.Status,
                notificationSent = true
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error escalating transfer {TransferId}", id);
            return BadRequest(new { error = ex.Message });
        }
    }
}
