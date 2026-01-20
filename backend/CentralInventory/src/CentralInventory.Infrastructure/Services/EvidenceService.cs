using CentralInventory.Core.Entities;
using CentralInventory.Core.Enums;
using CentralInventory.Core.Interfaces;
using CentralInventory.Infrastructure.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace CentralInventory.Infrastructure.Services;

/// <summary>
/// Evidence service implementation
/// Handles file uploads to Blob Storage and metadata tracking in SQL
/// </summary>
public class EvidenceService : IEvidenceService
{
    private readonly ApplicationDbContext _context;
    private readonly IBlobStorageService _blobStorageService;
    private readonly IAuditService _auditService;
    private const string EvidenceContainerName = "evidence-files";
    
    public EvidenceService(
        ApplicationDbContext context,
        IBlobStorageService blobStorageService,
        IAuditService auditService)
    {
        _context = context;
        _blobStorageService = blobStorageService;
        _auditService = auditService;
    }
    
    public async Task<Evidence> UploadEvidenceAsync(
        Guid transferId,
        Guid? requirementId,
        IFormFile file,
        string? description,
        Guid uploadedBy)
    {
        // Validate file
        if (file == null || file.Length == 0)
        {
            throw new ArgumentException("File is required");
        }
        
        var evidenceId = Guid.NewGuid();
        
        // Generate blob name: {transferId}/{evidenceId}/{filename}
        var blobName = $"{transferId}/{evidenceId}/{file.FileName}";
        
        // Upload to Blob Storage
        string blobUrl;
        using (var stream = file.OpenReadStream())
        {
            blobUrl = await _blobStorageService.UploadFileAsync(
                EvidenceContainerName,
                blobName,
                stream,
                file.ContentType);
        }
        
        // Create Evidence metadata
        var evidence = new Evidence
        {
            EvidenceId = evidenceId,
            TransferId = transferId,
            RequirementId = requirementId,
            FileName = file.FileName,
            FileSize = file.Length,
            FileType = Path.GetExtension(file.FileName).TrimStart('.').ToUpper(),
            BlobStorageUrl = blobUrl,
            BlobStorageContainer = EvidenceContainerName,
            Description = description,
            Status = nameof(EvidenceStatus.PENDING),
            UploadedBy = uploadedBy,
            UploadedAt = DateTime.UtcNow
        };
        
        _context.Evidence.Add(evidence);
        await _context.SaveChangesAsync();
        
        // Log audit trail
        await _auditService.LogAuditAsync(
            entityType: "Evidence",
            entityId: evidenceId,
            action: "UPLOADED",
            previousStatus: null,
            newStatus: nameof(EvidenceStatus.PENDING),
            performedBy: uploadedBy,
            notes: $"Evidence '{file.FileName}' uploaded");
        
        return evidence;
    }
    
    public async Task<Evidence?> GetEvidenceByIdAsync(Guid evidenceId)
    {
        return await _context.Evidence
            .Include(e => e.Transfer)
            .Include(e => e.Requirement)
            .Include(e => e.Uploader)
            .Include(e => e.Reviewer)
            .FirstOrDefaultAsync(e => e.EvidenceId == evidenceId);
    }
    
    public async Task<List<Evidence>> GetEvidenceForTransferAsync(Guid transferId)
    {
        return await _context.Evidence
            .Where(e => e.TransferId == transferId)
            .Include(e => e.Uploader)
            .Include(e => e.Reviewer)
            .OrderByDescending(e => e.UploadedAt)
            .ToListAsync();
    }
    
    public async Task<(List<Evidence> Evidence, int TotalCount)> GetEvidenceQueueAsync(
        string? status = null,
        string? escalatedTo = null,
        int page = 1,
        int pageSize = 20)
    {
        var query = _context.Evidence
            .Include(e => e.Transfer)
            .Include(e => e.Uploader)
            .AsQueryable();
        
        // Apply filters
        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(e => e.Status == status);
        }
        
        if (!string.IsNullOrEmpty(escalatedTo))
        {
            query = query.Where(e => e.EscalatedTo == escalatedTo);
        }
        
        var totalCount = await query.CountAsync();
        
        var evidence = await query
            .OrderByDescending(e => e.UploadedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
        
        return (evidence, totalCount);
    }
    
    public async Task<string> GenerateDownloadUrlAsync(Guid evidenceId)
    {
        var evidence = await _context.Evidence.FindAsync(evidenceId);
        
        if (evidence == null)
        {
            throw new InvalidOperationException($"Evidence {evidenceId} not found");
        }
        
        // Extract blob name from URL
        var uri = new Uri(evidence.BlobStorageUrl);
        var blobName = uri.AbsolutePath.TrimStart('/').Substring(EvidenceContainerName.Length + 1);
        
        // Generate SAS URL valid for 1 hour
        return await _blobStorageService.GenerateSasUrlAsync(
            EvidenceContainerName,
            blobName,
            TimeSpan.FromHours(1));
    }
}
