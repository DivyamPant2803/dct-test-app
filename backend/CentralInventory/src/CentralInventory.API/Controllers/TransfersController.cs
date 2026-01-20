using CentralInventory.Core.DTOs.Requests;
using CentralInventory.Core.DTOs.Responses;
using CentralInventory.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CentralInventory.API.Controllers;

/// <summary>
/// Transfers API Controller
/// Handles CRUD operations for data transfers
/// </summary>
[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class TransfersController : ControllerBase
{
    private readonly ITransferService _transferService;
    private readonly ILogger<TransfersController> _logger;
    
    public TransfersController(
        ITransferService transferService,
        ILogger<TransfersController> logger)
    {
        _transferService = transferService;
        _logger = logger;
    }
    
    /// <summary>
    /// Creates a new transfer with optional MER template data
    /// POST /api/v1/transfers
    /// </summary>
    /// <remarks>
    /// CRITICAL: Accepts generic JSON object in MerTemplateData
    /// The service will serialize it to a JSON string before storage
    /// 
    /// Sample request:
    /// 
    ///     POST /api/v1/transfers
    ///     {
    ///         "transferName": "Data Transfer - App X",
    ///         "controlId": 1,
    ///         "templateId": "uuid",
    ///         "jurisdiction": "US",
    ///         "entity": "Entity Name",
    ///         "subjectType": "Client",
    ///         "merType": "MER-13",
    ///         "merTemplateData": {
    ///             "fieldValues": { "question1": "answer1" },
    ///             "tableData": [ ... ],
    ///             "fileData": { ... }
    ///         }
    ///     }
    /// 
    /// </remarks>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateTransfer([FromBody] CreateTransferRequest request)
    {
        try
        {
            // Get current user ID from claims (Azure AD integration)
            var userIdClaim = User.FindFirst("sub") ?? User.FindFirst("oid");
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized("User ID not found in token");
            }
            
            var transfer = await _transferService.CreateTransferAsync(request, userId);
            
            return CreatedAtAction(
                nameof(GetTransfer),
                new { id = transfer.TransferId },
                new
                {
                    transferId = transfer.TransferId,
                    message = "Transfer created successfully",
                    status = transfer.Status
                });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating transfer");
            return BadRequest(new { error = ex.Message });
        }
    }
    
    /// <summary>
    /// Gets a transfer by ID with all related data
    /// GET /api/v1/transfers/{id}
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetTransfer(Guid id)
    {
        var transfer = await _transferService.GetTransferByIdAsync(id);
        
        if (transfer == null)
        {
            return NotFound(new { error = $"Transfer {id} not found" });
        }
        
        return Ok(transfer);
    }
    
    /// <summary>
    /// Gets transfers with filtering and pagination
    /// GET /api/v1/transfers?status=ACTIVE&page=1&pageSize=20
    /// </summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTransfers(
        [FromQuery] string? status = null,
        [FromQuery] string? createdBy = null,
        [FromQuery] string? jurisdiction = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        Guid? createdByGuid = null;
        
        // Handle "me" keyword for createdBy
        if (createdBy == "me")
        {
            var userIdClaim = User.FindFirst("sub") ?? User.FindFirst("oid");
            if (userIdClaim != null && Guid.TryParse(userIdClaim.Value, out var userId))
            {
                createdByGuid = userId;
            }
        }
        else if (!string.IsNullOrEmpty(createdBy) && Guid.TryParse(createdBy, out var parsedGuid))
        {
            createdByGuid = parsedGuid;
        }
        
        var (transfers, totalCount) = await _transferService.GetTransfersAsync(
            status,
            createdByGuid,
            jurisdiction,
            page,
            pageSize);
        
        var response = new PaginatedResponse<object>
        {
            Data = transfers.Select(t => new
            {
                t.TransferId,
                t.TransferName,
                t.Status,
                t.Jurisdiction,
                t.Entity,
                t.MERType,
                t.CreatedBy,
                t.CreatedAt,
                Creator = new
                {
                    t.Creator?.UserId,
                    t.Creator?.FullName,
                    t.Creator?.Email
                }
            }).ToList<object>(),
            Pagination = new PaginationMetadata
            {
                Page = page,
                PageSize = pageSize,
                TotalItems = totalCount,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            }
        };
        
        return Ok(response);
    }
}
