namespace CentralInventory.Core.Entities;

/// <summary>
/// Template entity with versioning support
/// Stores template structure as JSON
/// </summary>
public class Template
{
    public Guid TemplateId { get; set; }
    
    public int ControlId { get; set; }
    
    public string TemplateName { get; set; } = string.Empty;
    
    public string TemplateType { get; set; } = string.Empty;
    
    public string Version { get; set; } = "1.0.0";
    
    public string Status { get; set; } = "DRAFT";
    
    // File metadata
    public string? OriginalFileName { get; set; }
    
    public long? FileSize { get; set; }
    
    public string? DocumentType { get; set; }
    
    public string? BlobStorageUrl { get; set; }
    
    // Template structure (JSON)
    /// <summary>
    /// JSON: TemplateSection[]
    /// </summary>
    public string? Sections { get; set; }
    
    /// <summary>
    /// JSON: field ID -> app property mapping
    /// </summary>
    public string? FieldMappings { get; set; }
    
    // Tracking
    public Guid? PreviousVersionId { get; set; }
    
    public Guid UploadedBy { get; set; }
    
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? LastUsedAt { get; set; }
    
    public int UsageCount { get; set; }
    
    // Navigation Properties
    public virtual Control Control { get; set; } = null!;
    
    public virtual Template? PreviousVersion { get; set; }
    
    public virtual User Uploader { get; set; } = null!;
}
