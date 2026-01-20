using Microsoft.AspNetCore.Http;

namespace CentralInventory.Core.Interfaces;

/// <summary>
/// Azure Blob Storage operations
/// </summary>
public interface IBlobStorageService
{
    /// <summary>
    /// Uploads a file to Azure Blob Storage
    /// Returns the blob URL
    /// </summary>
    Task<string> UploadFileAsync(
        string containerName,
        string blobName,
        Stream fileStream,
        string contentType);
    
    /// <summary>
    /// Generates a SAS token URL for temporary access
    /// </summary>
    Task<string> GenerateSasUrlAsync(
        string containerName,
        string blobName,
        TimeSpan expiresIn);
    
    /// <summary>
    /// Deletes a blob
    /// </summary>
    Task DeleteFileAsync(string containerName, string blobName);
}
