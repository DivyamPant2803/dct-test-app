namespace CentralInventory.Core.Entities;

/// <summary>
/// Cache for external application data (SERA, iSAC, Cumulus)
/// </summary>
public class ApplicationMetadata
{
    /// <summary>
    /// Software Component ID (e.g., "SWC-12345")
    /// </summary>
    public string SwcId { get; set; } = string.Empty;
    
    public string AppName { get; set; } = string.Empty;
    
    public string? Owner { get; set; }
    
    public string? DataClassification { get; set; }
    
    public string? HostingProvider { get; set; }
    
    /// <summary>
    /// Store complete raw response from source system (JSON)
    /// </summary>
    public string? RawData { get; set; }
    
    public string? SourceSystem { get; set; }
    
    public DateTime LastSyncedAt { get; set; } = DateTime.UtcNow;
}
