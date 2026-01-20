namespace CentralInventory.Core.DTOs.Requests;

/// <summary>
/// Request DTO for reviewing evidence
/// </summary>
public class ReviewEvidenceRequest
{
    /// <summary>
    /// Decision: APPROVE, REJECT, ESCALATE
    /// </summary>
    public string Decision { get; set; } = string.Empty;
    
    public string? Note { get; set; }
    
    /// <summary>
    /// Required if Decision = ESCALATE
    /// Values: "Legal", "Business"
    /// </summary>
    public string? EscalateTo { get; set; }
    
    /// <summary>
    /// Required if Decision = ESCALATE
    /// </summary>
    public string? EscalationReason { get; set; }
    
    /// <summary>
    /// Optional: Tagged authorities like ["EDPB", "ICO"]
    /// </summary>
    public List<string>? TaggedAuthorities { get; set; }
}
