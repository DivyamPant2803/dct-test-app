namespace CentralInventory.Core.Entities;

/// <summary>
/// Stores dynamic MER template form data as JSON
/// This implements the Hybrid Data Strategy: relational workflow + JSON form data
/// </summary>
public class TransferMERData
{
    /// <summary>
    /// Foreign key to Transfers table (one-to-one relationship)
    /// </summary>
    public Guid TransferId { get; set; }
    
    /// <summary>
    /// Dynamic form data stored as JSON string
    /// Structure: { "fieldValues": {...}, "tableData": {...}, "fileData": {...} }
    /// Type is string in Entity, but DTOs handle it as object/JsonElement
    /// </summary>
    public string FormData { get; set; } = string.Empty;
    
    /// <summary>
    /// Template version used (e.g., "MER-13", "MER-14")
    /// </summary>
    public string? TemplateVersion { get; set; }
    
    /// <summary>
    /// Last time the form data was saved
    /// </summary>
    public DateTime LastSavedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation Property
    public virtual Transfer Transfer { get; set; } = null!;
}
