using Microsoft.AspNetCore.Http;

namespace CentralInventory.Core.DTOs.Requests;

/// <summary>
/// Request DTO for uploading evidence files
/// </summary>
public class UploadEvidenceRequest
{
    public Guid TransferId { get; set; }
    
    public Guid? RequirementId { get; set; }
    
    public string? Description { get; set; }
    
    /// <summary>
    /// The uploaded file (multipart/form-data)
    /// </summary>
    public IFormFile File { get; set; } = null!;
}
