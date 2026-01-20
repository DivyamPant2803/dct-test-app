namespace CentralInventory.Core.DTOs.Requests;

/// <summary>
/// Request DTO for escalating a transfer
/// </summary>
public class EscalateTransferRequest
{
    /// <summary>
    /// Escalation target: "Legal", "Business", "DISO"
    /// </summary>
    public string EscalateTo { get; set; } = string.Empty;
    
    public string Reason { get; set; } = string.Empty;
    
    /// <summary>
    /// Optional: Tagged authorities like ["EDPB", "ICO"]
    /// </summary>
    public List<string>? TaggedAuthorities { get; set; }
}
