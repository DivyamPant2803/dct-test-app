namespace CentralInventory.Core.Entities;

/// <summary>
/// Control definition (MER-13, ROCC, EUC, etc.)
/// </summary>
public class Control
{
    public int ControlId { get; set; }
    
    public string ControlCode { get; set; } = string.Empty;
    
    public string ControlName { get; set; } = string.Empty;
    
    public string ControlType { get; set; } = string.Empty;
    
    public string? Description { get; set; }
    
    public string? ApplicationName { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public Guid? CreatedBy { get; set; }
    
    // Navigation Properties
    public virtual ICollection<Template> Templates { get; set; } = new List<Template>();
    
    public virtual ICollection<SLAConfiguration> SLAConfigurations { get; set; } = new List<SLAConfiguration>();
}
