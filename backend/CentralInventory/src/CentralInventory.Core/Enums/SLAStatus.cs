namespace CentralInventory.Core.Enums;

/// <summary>
/// Represents the SLA compliance status
/// </summary>
public enum SLAStatus
{
    /// <summary>
    /// Within SLA timeframe
    /// </summary>
    ON_TRACK,
    
    /// <summary>
    /// Approaching SLA deadline (warning threshold)
    /// </summary>
    APPROACHING,
    
    /// <summary>
    /// SLA deadline breached
    /// </summary>
    BREACHED,
    
    /// <summary>
    /// Transfer completed within SLA
    /// </summary>
    COMPLETED
}
