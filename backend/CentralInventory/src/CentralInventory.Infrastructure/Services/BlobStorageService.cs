using Azure;
using Azure.Storage.Blobs;
using Azure.Storage.Sas;
using CentralInventory.Core.Interfaces;

namespace CentralInventory.Infrastructure.Services;

/// <summary>
/// Azure Blob Storage service implementation
/// Uses Azure.Storage.Blobs SDK
/// </summary>
public class BlobStorageService : IBlobStorageService
{
    private readonly BlobServiceClient _blobServiceClient;
    
    public BlobStorageService(BlobServiceClient blobServiceClient)
    {
        _blobServiceClient = blobServiceClient;
    }
    
    public async Task<string> UploadFileAsync(
        string containerName,
        string blobName,
        Stream fileStream,
        string contentType)
    {
        var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
        
        // Create container if it doesn't exist
        await containerClient.CreateIfNotExistsAsync();
        
        var blobClient = containerClient.GetBlobClient(blobName);
        
        // Upload with content type
        await blobClient.UploadAsync(fileStream, new Azure.Storage.Blobs.Models.BlobHttpHeaders
        {
            ContentType = contentType
        });
        
        return blobClient.Uri.ToString();
    }
    
    public async Task<string> GenerateSasUrlAsync(
        string containerName,
        string blobName,
        TimeSpan expiresIn)
    {
        var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
        var blobClient = containerClient.GetBlobClient(blobName);
        
        // Check if blob exists
        if (!await blobClient.ExistsAsync())
        {
            throw new InvalidOperationException($"Blob {blobName} not found in container {containerName}");
        }
        
        // Generate SAS token
        var sasBuilder = new BlobSasBuilder
        {
            BlobContainerName = containerName,
            BlobName = blobName,
            Resource = "b", // b = blob
            StartsOn = DateTimeOffset.UtcNow.AddMinutes(-5), // Allow for clock skew
            ExpiresOn = DateTimeOffset.UtcNow.Add(expiresIn)
        };
        
        sasBuilder.SetPermissions(BlobSasPermissions.Read);
        
        var sasToken = blobClient.GenerateSasUri(sasBuilder);
        
        return sasToken.ToString();
    }
    
    public async Task DeleteFileAsync(string containerName, string blobName)
    {
        var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
        var blobClient = containerClient.GetBlobClient(blobName);
        
        await blobClient.DeleteIfExistsAsync();
    }
}
