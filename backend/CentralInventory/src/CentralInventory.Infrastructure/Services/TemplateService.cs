using CentralInventory.Core.Entities;
using CentralInventory.Core.Interfaces;
using CentralInventory.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CentralInventory.Infrastructure.Services;

/// <summary>
/// Template management service implementation
/// </summary>
public class TemplateService : ITemplateService
{
    private readonly ApplicationDbContext _context;
    
    public TemplateService(ApplicationDbContext context)
    {
        _context = context;
    }
    
    public async Task<List<Template>> GetTemplatesByControlIdAsync(int controlId, string? status = null)
    {
        var query = _context.Templates
            .Where(t => t.ControlId == controlId);
        
        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(t => t.Status == status);
        }
        
        return await query
            .OrderByDescending(t => t.UploadedAt)
            .ToListAsync();
    }
    
    public async Task<Template?> GetTemplateByIdAsync(Guid templateId)
    {
        return await _context.Templates
            .Include(t => t.Control)
            .Include(t => t.Uploader)
            .FirstOrDefaultAsync(t => t.TemplateId == templateId);
    }
    
    public async Task<List<Control>> GetActiveControlsAsync(string? controlType = null)
    {
        var query = _context.Controls
            .Where(c => c.IsActive);
        
        if (!string.IsNullOrEmpty(controlType))
        {
            query = query.Where(c => c.ControlType == controlType);
        }
        
        return await query
            .OrderBy(c => c.ControlCode)
            .ToListAsync();
    }
}
