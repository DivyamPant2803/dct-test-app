using CentralInventory.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CentralInventory.API.Controllers;

/// <summary>
/// Analytics and Dashboard API Controller
/// </summary>
[ApiController]
[Route("api/v1/analytics")]
[Authorize]
public class AnalyticsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<AnalyticsController> _logger;
    
    public AnalyticsController(
        ApplicationDbContext context,
        ILogger<AnalyticsController> logger)
    {
        _context = context;
        _logger = logger;
    }
    
    /// <summary>
    /// Gets dashboard statistics
    /// GET /api/v1/analytics/dashboard?role=Admin
    /// </summary>
    [HttpGet("dashboard")]
    [Authorize(Roles = "Admin,Legal")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDashboard([FromQuery] string? role = null)
    {
        var now = DateTime.UtcNow;
        var startOfMonth = new DateTime(now.Year, now.Month, 1);
        
        var totalTransfers = await _context.Transfers.CountAsync();
        
        var pendingReviews = await _context.Evidence
            .Where(e => e.Status == "PENDING")
            .CountAsync();
        
        var approvedThisMonth = await _context.Transfers
            .Where(t => t.Status == "COMPLETED" && t.CompletedAt >= startOfMonth)
            .CountAsync();
        
        var rejectedThisMonth = await _context.Transfers
            .Where(t => t.Status == "REJECTED" && t.UpdatedAt >= startOfMonth)
            .CountAsync();
        
        var escalatedToLegal = await _context.Transfers
            .Where(t => t.Status == "ESCALATED" && t.EscalatedTo == "Legal")
            .CountAsync();
        
        var slaBreaches = await _context.SLATrackings
            .Where(s => s.Status == "BREACHED")
            .CountAsync();
        
        // Calculate average review time (simplified)
        var completedTransfers = await _context.Transfers
            .Where(t => t.Status == "COMPLETED" && t.CompletedAt.HasValue)
            .ToListAsync();
        
        var averageReviewTime = completedTransfers.Any()
            ? completedTransfers.Average(t => (t.CompletedAt!.Value - t.CreatedAt).TotalDays)
            : 0;
        
        return Ok(new
        {
            totalTransfers,
            pendingReviews,
            approvedThisMonth,
            rejectedThisMonth,
            escalatedToLegal,
            slaBreaches,
            averageReviewTime = $"{averageReviewTime:F1} days"
        });
    }
    
    /// <summary>
    /// Gets compliance report
    /// GET /api/v1/analytics/compliance-report?startDate=2026-01-01&endDate=2026-01-31
    /// </summary>
    [HttpGet("compliance-report")]
    [Authorize(Roles = "Admin,Legal")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetComplianceReport(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        var start = startDate ?? DateTime.UtcNow.AddMonths(-1);
        var end = endDate ?? DateTime.UtcNow;
        
        var transfers = await _context.Transfers
            .Where(t => t.CreatedAt >= start && t.CreatedAt <= end)
            .ToListAsync();
        
        var byJurisdiction = transfers
            .GroupBy(t => t.Jurisdiction ?? "Unknown")
            .ToDictionary(g => g.Key, g => g.Count());
        
        var byStatus = transfers
            .GroupBy(t => t.Status)
            .ToDictionary(g => g.Key, g => g.Count());
        
        var slaTracking = await _context.SLATrackings
            .Where(s => s.StartDate >= start && s.StartDate <= end)
            .ToListAsync();
        
        var slaCompliance = new
        {
            onTrack = slaTracking.Count(s => s.Status == "ON_TRACK" || s.Status == "COMPLETED"),
            breached = slaTracking.Count(s => s.Status == "BREACHED"),
            approaching = slaTracking.Count(s => s.Status == "APPROACHING")
        };
        
        return Ok(new
        {
            reportId = Guid.NewGuid(),
            period = $"{start:yyyy-MM-dd} to {end:yyyy-MM-dd}",
            totalTransfers = transfers.Count,
            byJurisdiction,
            byStatus,
            slaCompliance
        });
    }
}
