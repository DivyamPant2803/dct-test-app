namespace CentralInventory.Core.DTOs.Responses;

/// <summary>
/// Generic paginated response wrapper
/// </summary>
public class PaginatedResponse<T>
{
    public List<T> Data { get; set; } = new();
    
    public PaginationMetadata Pagination { get; set; } = new();
}

public class PaginationMetadata
{
    public int Page { get; set; }
    
    public int PageSize { get; set; }
    
    public int TotalItems { get; set; }
    
    public int TotalPages { get; set; }
}
