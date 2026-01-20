using CentralInventory.Core.DTOs.Requests;
using CentralInventory.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CentralInventory.API.Controllers;

/// <summary>
/// Evidence API Controller
/// Handles file uploads and evidence management
/// </summary>
[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class EvidenceController : ControllerBase
{
    private readonly IEvidenceService _evidenceService;
    private readonly ILogger<EvidenceController> _logger;
    
    public EvidenceController(
        IEvidenceService evidenceService,
        ILogger<EvidenceController> logger)
    {
        _evidenceService = evidenceService;
        _logger = logger;
    }
    
    /// <summary>
    /// Uploads evidence file to Azure Blob Storage
    /// POST /api/v1/evidence
    /// Content-Type: multipart/form-data
    /// </summary>
    /// <remarks>
    /// CRITICAL: Accepts IFormFile for file upload
    /// Uploads to Azure Blob Storage and saves metadata to SQL
    /// 
    /// Form fields:
    /// - transferId: GUID (required)
    /// - requirementId: GUID (optional, null for MER)
    /// - description: string (optional)
    /// - file: binary (required)
    /// </remarks>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [RequestSizeLimit(52428800)] // 50 MB limit
    public async Task<IActionResult> UploadEvidence([FromForm] UploadEvidenceRequest request)
    {
        try
        {
            // Get current user ID from claims
            var userIdClaim = User.FindFirst("sub") ?? User.FindFirst("oid");
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized("User ID not found in token");
            }
            
            var evidence = await _evidenceService.UploadEvidenceAsync(
                request.TransferId,
                request.RequirementId,
                request.File,
                request.Description,
                userId);
            
            return CreatedAtAction(
                nameof(GetEvidence),
                new { id = evidence.EvidenceId },
                new
                {
                    evidenceId = evidence.EvidenceId,
                    fileName = evidence.FileName,
                    fileSize = evidence.FileSize,
                    blobStorageUrl = evidence.BlobStorageUrl,
                    uploadedAt = evidence.UploadedAt,
                    message = "Evidence uploaded successfully"
                });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading evidence");
            return BadRequest(new { error = ex.Message });
        }
    }
    
    /// <summary>
    /// Gets evidence by ID
    /// GET /api/v1/evidence/{id}
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetEvidence(Guid id)
    {
        var evidence = await _evidenceService.GetEvidenceByIdAsync(id);
        
        if (evidence == null)
        {
            return NotFound(new { error = $"Evidence {id} not found" });
        }
        
        return Ok(evidence);
    }
    
    /// <summary>
    /// Gets all evidence for a transfer
    /// GET /api/v1/evidence/transfer/{transferId}
    /// </summary>
    [HttpGet("transfer/{transferId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetEvidenceForTransfer(Guid transferId)
    {
        var evidence = await _evidenceService.GetEvidenceForTransferAsync(transferId);
        
        return Ok(new { data = evidence });
    }
    
    /// <summary>
    /// Gets evidence queue for admin/legal review
    /// GET /api/v1/evidence/queue?status=PENDING&page=1&pageSize=20
    /// </summary>
    [HttpGet("queue")]
    [Authorize(Roles = "Admin,Legal")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetEvidenceQueue(
        [FromQuery] string? status = null,
        [FromQuery] string? escalatedTo = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var (evidence, totalCount) = await _evidenceService.GetEvidenceQueueAsync(
            status,
            escalatedTo,
            page,
            pageSize);
        
        return Ok(new
        {
            data = evidence,
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
    /// Generates a download URL with SAS token
    /// GET /api/v1/evidence/{id}/download
    /// </summary>
    [HttpGet("{id}/download")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DownloadEvidence(Guid id)
    {
        try
        {
            var downloadUrl = await _evidenceService.GenerateDownloadUrlAsync(id);
            
            return Ok(new
            {
                downloadUrl,
                expiresIn = "1 hour"
            });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }
}
