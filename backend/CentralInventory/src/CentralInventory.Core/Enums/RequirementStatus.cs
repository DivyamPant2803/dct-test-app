namespace CentralInventory.Core.Enums;

/// <summary>
/// Represents the status of a specific Requirement within a Transfer
/// </summary>
public enum RequirementStatus
{
    /// <summary>
    /// Requirement created, awaiting evidence
    /// </summary>
    PENDING,
    
    /// <summary>
    /// Requirement is under review
    /// </summary>
    UNDER_REVIEW,
    
    /// <summary>
    /// Requirement approved
    /// </summary>
    APPROVED,
    
    /// <summary>
    /// Requirement rejected
    /// </summary>
    REJECTED,
    
    /// <summary>
    /// Requirement escalated
    /// </summary>
    ESCALATED
}
