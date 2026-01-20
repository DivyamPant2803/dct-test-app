namespace CentralInventory.Core.Enums;

/// <summary>
/// Represents the review status of Evidence
/// </summary>
public enum EvidenceStatus
{
    /// <summary>
    /// Evidence uploaded, awaiting review
    /// </summary>
    PENDING,
    
    /// <summary>
    /// Evidence is currently being reviewed
    /// </summary>
    UNDER_REVIEW,
    
    /// <summary>
    /// Evidence approved by reviewer
    /// </summary>
    APPROVED,
    
    /// <summary>
    /// Evidence rejected by reviewer
    /// </summary>
    REJECTED,
    
    /// <summary>
    /// Evidence escalated to higher authority
    /// </summary>
    ESCALATED
}
