namespace CentralInventory.Core.Enums;

/// <summary>
/// Represents the lifecycle status of a Transfer
/// </summary>
public enum TransferStatus
{
    /// <summary>
    /// Transfer created but not yet submitted for review
    /// </summary>
    PENDING,
    
    /// <summary>
    /// Transfer is under active review
    /// </summary>
    ACTIVE,
    
    /// <summary>
    /// Transfer has been escalated to Legal or Business team
    /// </summary>
    ESCALATED,
    
    /// <summary>
    /// All requirements approved, transfer completed
    /// </summary>
    COMPLETED,
    
    /// <summary>
    /// Transfer rejected by reviewer
    /// </summary>
    REJECTED
}
