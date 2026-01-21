using CentralInventory.Core.Entities;
using CentralInventory.Core.Enums;
using CentralInventory.Core.Interfaces;
using CentralInventory.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CentralInventory.Infrastructure.Services;

/// <summary>
/// SLA tracking and monitoring service implementation
/// </summary>
public class SLAService : ISLAService
{
    private readonly ApplicationDbContext _context;
    
    public SLAService(ApplicationDbContext context)
    {
        _context = context;
    }
    
    public async Task<List<SLAConfiguration>> GetSLAConfigurationsAsync()
    {
        return await _context.SLAConfigurations
            .Include(s => s.Control)
            .Where(s => s.IsActive)
            .ToListAsync();
    }
    
    public async Task<SLATracking?> GetSLATrackingByTransferIdAsync(Guid transferId)
    {
        return await _context.SLATrackings
            .Include(s => s.SLAConfiguration)
            .FirstOrDefaultAsync(s => s.TransferId == transferId);
    }
    
    public async Task<List<SLATracking>> GetSLABreachesAsync()
    {
        return await _context.SLATrackings
            .Include(s => s.Transfer)
            .Include(s => s.SLAConfiguration)
            .Where(s => s.Status == nameof(SLAStatus.BREACHED) || 
                       s.Status == nameof(SLAStatus.APPROACHING))
            .OrderBy(s => s.TargetDate)
            .ToListAsync();
    }
    
    public async Task<SLATracking> CreateSLATrackingAsync(Guid transferId, int controlId)
    {
        // Get SLA configuration for the control
        var slaConfig = await _context.SLAConfigurations
            .FirstOrDefaultAsync(s => s.ControlId == controlId && s.IsActive);
        
        if (slaConfig == null)
        {
            throw new InvalidOperationException($"No active SLA configuration found for control {controlId}");
        }
        
        var startDate = DateTime.UtcNow;
        var targetDate = startDate.AddDays(slaConfig.TargetResponseDays);
        var warningDate = targetDate.AddDays(-slaConfig.WarningThresholdDays);
        
        var slaTracking = new SLATracking
        {
            SLATrackingId = Guid.NewGuid(),
            TransferId = transferId,
            SLAConfigId = slaConfig.SLAConfigId,
            StartDate = startDate,
            TargetDate = targetDate,
            WarningDate = warningDate,
            Status = nameof(SLAStatus.ON_TRACK),
            DaysRemaining = slaConfig.TargetResponseDays,
            LastCheckedAt = DateTime.UtcNow
        };
        
        _context.SLATrackings.Add(slaTracking);
        await _context.SaveChangesAsync();
        
        return slaTracking;
    }
    
    public async Task UpdateSLAStatusAsync(Guid slaTrackingId)
    {
        var slaTracking = await _context.SLATrackings.FindAsync(slaTrackingId);
        
        if (slaTracking == null)
        {
            return;
        }
        
        var now = DateTime.UtcNow;
        var daysRemaining = (slaTracking.TargetDate - now).Days;
        
        slaTracking.DaysRemaining = daysRemaining;
        slaTracking.LastCheckedAt = now;
        
        if (now > slaTracking.TargetDate)
        {
            slaTracking.Status = nameof(SLAStatus.BREACHED);
        }
        else if (now > slaTracking.WarningDate)
        {
            slaTracking.Status = nameof(SLAStatus.APPROACHING);
        }
        else
        {
            slaTracking.Status = nameof(SLAStatus.ON_TRACK);
        }
        
        await _context.SaveChangesAsync();
    }
}
