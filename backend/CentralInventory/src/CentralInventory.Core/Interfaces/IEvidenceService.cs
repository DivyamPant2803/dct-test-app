using CentralInventory.Core.Entities;
using Microsoft.AspNetCore.Http;

namespace CentralInventory.Core.Interfaces;

/// <summary>
/// Blob uploads, URL generation, metadata tracking
/// </summary>
public interface IEvidenceService
{
    /// <summary>
    /// Uploads evidence file to Azure Blob Storage and saves metadata to SQL
    /// </summary>
    Task<Evidence> UploadEvidenceAsync(
        Guid transferId,
        Guid? requirementId,
        IFormFile file,
        string? description,
        Guid uploadedBy);
    
    /// <summary>
    /// Gets evidence by ID
    /// </summary>
    Task<Evidence?> GetEvidenceByIdAsync(Guid evidenceId);
    
    /// <summary>
    /// Gets all evidence for a transfer
    /// </summary>
    Task<List<Evidence>> GetEvidenceForTransferAsync(Guid transferId);
    
    /// <summary>
    /// Gets evidence queue for admin/legal review
    /// </summary>
    Task<(List<Evidence> Evidence, int TotalCount)> GetEvidenceQueueAsync(
        string? status = null,
        string? escalatedTo = null,
        int page = 1,
        int pageSize = 20);
    
    /// <summary>
    /// Generates a SAS token URL for downloading evidence
    /// </summary>
    Task<string> GenerateDownloadUrlAsync(Guid evidenceId);
}
