namespace CentralInventory.Core.DTOs.Requests;

/// <summary>
/// Request DTO for creating a new Transfer
/// Accepts generic JSON object for MER template data
/// </summary>
public class CreateTransferRequest
{
    public string TransferName { get; set; } = string.Empty;
    
    public int ControlId { get; set; }
    
    public Guid? TemplateId { get; set; }
    
    public string? Jurisdiction { get; set; }
    
    public string? Entity { get; set; }
    
    public string? SubjectType { get; set; }
    
    public string? MERType { get; set; }
    
    /// <summary>
    /// Accepts any JSON structure from the frontend
    /// Will be serialized to string before storage
    /// Structure: { "fieldValues": {...}, "tableData": {...}, "fileData": {...} }
    /// </summary>
    public object? MerTemplateData { get; set; }
}
