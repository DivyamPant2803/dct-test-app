namespace CentralInventory.Core.Entities;

/// <summary>
/// Represents uploaded evidence files with metadata and review status
/// </summary>
public class Evidence
{
    public Guid EvidenceId { get; set; }
    
    /// <summary>
    /// Nullable for MER virtual evidence (template submission)
    /// </summary>
    public Guid? RequirementId { get; set; }
    
    /// <summary>
    /// Direct link to Transfer for MER submissions
    /// </summary>
    public Guid TransferId { get; set; }
    
    // File metadata
    public string FileName { get; set; } = string.Empty;
    
    public long FileSize { get; set; }
    
    public string FileType { get; set; } = string.Empty;
    
    public string BlobStorageUrl { get; set; } = string.Empty;
    
    public string? BlobStorageContainer { get; set; }
    
    public string? Description { get; set; }
    
    // Status
    public string Status { get; set; } = nameof(EvidenceStatus.PENDING);
    
    // Review
    public Guid? ReviewerId { get; set; }
    
    public string? ReviewerNote { get; set; }
    
    public DateTime? ReviewedAt { get; set; }
    
    // Escalation
    public string? EscalatedTo { get; set; }
    
    public Guid? EscalatedBy { get; set; }
    
    public DateTime? EscalatedAt { get; set; }
    
    public string? EscalationReason { get; set; }
    
    /// <summary>
    /// JSON array: ['EDPB', 'ICO']
    /// </summary>
    public string? TaggedAuthorities { get; set; }
    
    // Deputy Assignment
    public Guid? AssignedDeputy { get; set; }
    
    public string? AssignedDeputyType { get; set; }
    
    public DateTime? DeputyAssignedAt { get; set; }
    
    public Guid? DeputyAssignedBy { get; set; }
    
    // Tracking
    public Guid UploadedBy { get; set; }
    
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    
    /// <summary>
    /// True for MER template submissions (virtual evidence)
    /// </summary>
    public bool IsMERVirtualEvidence { get; set; }
    
    // Navigation Properties
    public virtual Requirement? Requirement { get; set; }
    
    public virtual Transfer Transfer { get; set; } = null!;
    
    public virtual User Uploader { get; set; } = null!;
    
    public virtual User? Reviewer { get; set; }
    
    public virtual ICollection<EvidenceHistory> History { get; set; } = new List<EvidenceHistory>();
}
