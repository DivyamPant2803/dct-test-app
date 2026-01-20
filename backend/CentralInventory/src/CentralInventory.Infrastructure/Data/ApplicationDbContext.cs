using CentralInventory.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace CentralInventory.Infrastructure.Data;

/// <summary>
/// Application DbContext with Fluent API configurations
/// Implements the Hybrid Data Strategy: relational + JSON columns
/// </summary>
public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }
    
    // DbSets
    public DbSet<User> Users { get; set; }
    public DbSet<Role> Roles { get; set; }
    public DbSet<UserRole> UserRoles { get; set; }
    public DbSet<Transfer> Transfers { get; set; }
    public DbSet<TransferMERData> TransferMERData { get; set; }
    public DbSet<Requirement> Requirements { get; set; }
    public DbSet<Evidence> Evidence { get; set; }
    public DbSet<EvidenceHistory> EvidenceHistory { get; set; }
    public DbSet<AuditTrail> AuditTrail { get; set; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        ConfigureUsers(modelBuilder);
        ConfigureRoles(modelBuilder);
        ConfigureUserRoles(modelBuilder);
        ConfigureTransfers(modelBuilder);
        ConfigureTransferMERData(modelBuilder);
        ConfigureRequirements(modelBuilder);
        ConfigureEvidence(modelBuilder);
        ConfigureEvidenceHistory(modelBuilder);
        ConfigureAuditTrail(modelBuilder);
    }
    
    private void ConfigureUsers(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("Users");
            
            entity.HasKey(e => e.UserId);
            
            entity.Property(e => e.UserId)
                .HasDefaultValueSql("NEWID()");
            
            entity.Property(e => e.AzureADObjectId)
                .IsRequired()
                .HasMaxLength(100);
            
            entity.HasIndex(e => e.AzureADObjectId)
                .IsUnique()
                .HasDatabaseName("IX_Users_AzureADObjectId");
            
            entity.Property(e => e.Email)
                .IsRequired()
                .HasMaxLength(256);
            
            entity.HasIndex(e => e.Email)
                .IsUnique()
                .HasDatabaseName("IX_Users_Email");
            
            entity.Property(e => e.FullName)
                .IsRequired()
                .HasMaxLength(200);
            
            entity.Property(e => e.Department)
                .HasMaxLength(100);
            
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true);
            
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");
            
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("GETUTCDATE()");
        });
    }
    
    private void ConfigureRoles(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Role>(entity =>
        {
            entity.ToTable("Roles");
            
            entity.HasKey(e => e.RoleId);
            
            entity.Property(e => e.RoleName)
                .IsRequired()
                .HasMaxLength(50);
            
            entity.HasIndex(e => e.RoleName)
                .IsUnique()
                .HasDatabaseName("IX_Roles_RoleName");
            
            entity.Property(e => e.Description)
                .HasMaxLength(500);
            
            // JSON column for permissions
            entity.Property(e => e.Permissions)
                .HasColumnType("NVARCHAR(MAX)");
            
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");
        });
    }
    
    private void ConfigureUserRoles(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<UserRole>(entity =>
        {
            entity.ToTable("UserRoles");
            
            entity.HasKey(e => e.UserRoleId);
            
            entity.HasIndex(e => new { e.UserId, e.RoleId })
                .IsUnique()
                .HasDatabaseName("IX_UserRoles_UserId_RoleId");
            
            entity.HasIndex(e => e.UserId)
                .HasDatabaseName("IX_UserRoles_UserId");
            
            entity.Property(e => e.AssignedAt)
                .HasDefaultValueSql("GETUTCDATE()");
            
            // Relationships
            entity.HasOne(e => e.User)
                .WithMany(u => u.UserRoles)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasOne(e => e.Role)
                .WithMany(r => r.UserRoles)
                .HasForeignKey(e => e.RoleId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
    
    private void ConfigureTransfers(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Transfer>(entity =>
        {
            entity.ToTable("Transfers");
            
            entity.HasKey(e => e.TransferId);
            
            entity.Property(e => e.TransferId)
                .HasDefaultValueSql("NEWID()");
            
            entity.Property(e => e.TransferName)
                .IsRequired()
                .HasMaxLength(300);
            
            entity.Property(e => e.Status)
                .IsRequired()
                .HasMaxLength(50)
                .HasDefaultValue("PENDING");
            
            entity.HasIndex(e => e.Status)
                .HasDatabaseName("IX_Transfers_Status");
            
            entity.Property(e => e.Jurisdiction)
                .HasMaxLength(100);
            
            entity.Property(e => e.Entity)
                .HasMaxLength(200);
            
            entity.Property(e => e.SubjectType)
                .HasMaxLength(100);
            
            entity.Property(e => e.MERType)
                .HasMaxLength(50);
            
            entity.Property(e => e.EscalatedTo)
                .HasMaxLength(50);
            
            entity.HasIndex(e => e.EscalatedTo)
                .HasDatabaseName("IX_Transfers_EscalatedTo");
            
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");
            
            entity.HasIndex(e => e.CreatedAt)
                .HasDatabaseName("IX_Transfers_CreatedAt");
            
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("GETUTCDATE()");
            
            entity.HasIndex(e => e.CreatedBy)
                .HasDatabaseName("IX_Transfers_CreatedBy");
            
            // Relationships
            entity.HasOne(e => e.Creator)
                .WithMany()
                .HasForeignKey(e => e.CreatedBy)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
    
    private void ConfigureTransferMERData(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<TransferMERData>(entity =>
        {
            entity.ToTable("TransferMERData");
            
            // Primary key is TransferId (one-to-one with Transfer)
            entity.HasKey(e => e.TransferId);
            
            // CRITICAL: FormData is NVARCHAR(MAX) for JSON storage
            entity.Property(e => e.FormData)
                .IsRequired()
                .HasColumnType("NVARCHAR(MAX)");
            
            entity.Property(e => e.TemplateVersion)
                .HasMaxLength(20);
            
            entity.Property(e => e.LastSavedAt)
                .HasDefaultValueSql("GETUTCDATE()");
            
            // One-to-one relationship with Transfer
            entity.HasOne(e => e.Transfer)
                .WithOne(t => t.TransferMERData)
                .HasForeignKey<TransferMERData>(e => e.TransferId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
    
    private void ConfigureRequirements(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Requirement>(entity =>
        {
            entity.ToTable("Requirements");
            
            entity.HasKey(e => e.RequirementId);
            
            entity.Property(e => e.RequirementId)
                .HasDefaultValueSql("NEWID()");
            
            entity.Property(e => e.RequirementName)
                .IsRequired()
                .HasMaxLength(300);
            
            entity.Property(e => e.Jurisdiction)
                .HasMaxLength(100);
            
            entity.Property(e => e.Entity)
                .HasMaxLength(200);
            
            entity.Property(e => e.SubjectType)
                .HasMaxLength(100);
            
            entity.Property(e => e.Status)
                .IsRequired()
                .HasMaxLength(50)
                .HasDefaultValue("PENDING");
            
            entity.HasIndex(e => e.Status)
                .HasDatabaseName("IX_Requirements_Status");
            
            entity.HasIndex(e => e.TransferId)
                .HasDatabaseName("IX_Requirements_TransferId");
            
            entity.HasIndex(e => e.DueDate)
                .HasDatabaseName("IX_Requirements_DueDate");
            
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");
            
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("GETUTCDATE()");
            
            // Relationship
            entity.HasOne(e => e.Transfer)
                .WithMany(t => t.Requirements)
                .HasForeignKey(e => e.TransferId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
    
    private void ConfigureEvidence(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Evidence>(entity =>
        {
            entity.ToTable("Evidence");
            
            entity.HasKey(e => e.EvidenceId);
            
            entity.Property(e => e.EvidenceId)
                .HasDefaultValueSql("NEWID()");
            
            entity.Property(e => e.FileName)
                .IsRequired()
                .HasMaxLength(255);
            
            entity.Property(e => e.FileType)
                .IsRequired()
                .HasMaxLength(10);
            
            entity.Property(e => e.BlobStorageUrl)
                .IsRequired()
                .HasMaxLength(500);
            
            entity.Property(e => e.BlobStorageContainer)
                .HasMaxLength(100);
            
            entity.Property(e => e.Status)
                .IsRequired()
                .HasMaxLength(50)
                .HasDefaultValue("PENDING");
            
            entity.HasIndex(e => e.Status)
                .HasDatabaseName("IX_Evidence_Status");
            
            entity.HasIndex(e => e.TransferId)
                .HasDatabaseName("IX_Evidence_TransferId");
            
            entity.HasIndex(e => e.RequirementId)
                .HasDatabaseName("IX_Evidence_RequirementId");
            
            entity.HasIndex(e => e.ReviewerId)
                .HasDatabaseName("IX_Evidence_ReviewerId");
            
            entity.Property(e => e.EscalatedTo)
                .HasMaxLength(50);
            
            entity.Property(e => e.AssignedDeputyType)
                .HasMaxLength(50);
            
            // JSON column for tagged authorities
            entity.Property(e => e.TaggedAuthorities)
                .HasColumnType("NVARCHAR(MAX)");
            
            entity.Property(e => e.UploadedAt)
                .HasDefaultValueSql("GETUTCDATE()");
            
            entity.Property(e => e.IsMERVirtualEvidence)
                .HasDefaultValue(false);
            
            // Relationships
            entity.HasOne(e => e.Requirement)
                .WithMany(r => r.Evidence)
                .HasForeignKey(e => e.RequirementId)
                .OnDelete(DeleteBehavior.SetNull);
            
            entity.HasOne(e => e.Transfer)
                .WithMany(t => t.Evidence)
                .HasForeignKey(e => e.TransferId)
                .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasOne(e => e.Uploader)
                .WithMany()
                .HasForeignKey(e => e.UploadedBy)
                .OnDelete(DeleteBehavior.Restrict);
            
            entity.HasOne(e => e.Reviewer)
                .WithMany()
                .HasForeignKey(e => e.ReviewerId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
    
    private void ConfigureEvidenceHistory(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<EvidenceHistory>(entity =>
        {
            entity.ToTable("EvidenceHistory");
            
            entity.HasKey(e => e.HistoryId);
            
            entity.Property(e => e.HistoryId)
                .HasDefaultValueSql("NEWID()");
            
            entity.Property(e => e.Action)
                .IsRequired()
                .HasMaxLength(50);
            
            entity.Property(e => e.PreviousStatus)
                .HasMaxLength(50);
            
            entity.Property(e => e.NewStatus)
                .IsRequired()
                .HasMaxLength(50);
            
            entity.Property(e => e.PerformedAt)
                .HasDefaultValueSql("GETUTCDATE()");
            
            entity.HasIndex(e => e.EvidenceId)
                .HasDatabaseName("IX_EvidenceHistory_EvidenceId");
            
            entity.HasIndex(e => e.PerformedAt)
                .HasDatabaseName("IX_EvidenceHistory_PerformedAt");
            
            // Relationships
            entity.HasOne(e => e.Evidence)
                .WithMany(ev => ev.History)
                .HasForeignKey(e => e.EvidenceId)
                .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasOne(e => e.Performer)
                .WithMany()
                .HasForeignKey(e => e.PerformedBy)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
    
    private void ConfigureAuditTrail(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AuditTrail>(entity =>
        {
            entity.ToTable("AuditTrail");
            
            entity.HasKey(e => e.AuditId);
            
            entity.Property(e => e.AuditId)
                .HasDefaultValueSql("NEWID()");
            
            entity.Property(e => e.EntityType)
                .IsRequired()
                .HasMaxLength(50);
            
            entity.Property(e => e.Action)
                .IsRequired()
                .HasMaxLength(50);
            
            entity.Property(e => e.PreviousStatus)
                .HasMaxLength(50);
            
            entity.Property(e => e.NewStatus)
                .HasMaxLength(50);
            
            entity.Property(e => e.PerformedAt)
                .HasDefaultValueSql("GETUTCDATE()");
            
            // JSON column for change details
            entity.Property(e => e.ChangeDetails)
                .HasColumnType("NVARCHAR(MAX)");
            
            entity.Property(e => e.IPAddress)
                .HasMaxLength(45);
            
            entity.Property(e => e.UserAgent)
                .HasMaxLength(500);
            
            entity.HasIndex(e => new { e.EntityType, e.EntityId })
                .HasDatabaseName("IX_AuditTrail_EntityType_EntityId");
            
            entity.HasIndex(e => e.PerformedBy)
                .HasDatabaseName("IX_AuditTrail_PerformedBy");
            
            entity.HasIndex(e => e.PerformedAt)
                .HasDatabaseName("IX_AuditTrail_PerformedAt");
            
            // Relationship
            entity.HasOne(e => e.Performer)
                .WithMany()
                .HasForeignKey(e => e.PerformedBy)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
