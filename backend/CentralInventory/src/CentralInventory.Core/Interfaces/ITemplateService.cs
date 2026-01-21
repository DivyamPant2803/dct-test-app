using CentralInventory.Core.Entities;

namespace CentralInventory.Core.Interfaces;

/// <summary>
/// Template management service
/// </summary>
public interface ITemplateService
{
    /// <summary>
    /// Gets all templates for a control
    /// </summary>
    Task<List<Template>> GetTemplatesByControlIdAsync(int controlId, string? status = null);
    
    /// <summary>
    /// Gets a template by ID
    /// </summary>
    Task<Template?> GetTemplateByIdAsync(Guid templateId);
    
    /// <summary>
    /// Gets all active controls
    /// </summary>
    Task<List<Control>> GetActiveControlsAsync(string? controlType = null);
}
