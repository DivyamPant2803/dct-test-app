using CentralInventory.Core.DTOs.Requests;
using CentralInventory.Core.Entities;

namespace CentralInventory.Core.Interfaces;

/// <summary>
/// Core CRUD and transaction management for Transfers
/// </summary>
public interface ITransferService
{
    /// <summary>
    /// Creates a new transfer with MER data in a single atomic transaction
    /// Implements the Hybrid Data Strategy: relational + JSON
    /// </summary>
    Task<Transfer> CreateTransferAsync(CreateTransferRequest request, Guid userId);
    
    /// <summary>
    /// Gets a transfer by ID with all related data
    /// </summary>
    Task<Transfer?> GetTransferByIdAsync(Guid transferId);
    
    /// <summary>
    /// Gets transfers with filtering and pagination
    /// </summary>
    Task<(List<Transfer> Transfers, int TotalCount)> GetTransfersAsync(
        string? status = null,
        Guid? createdBy = null,
        string? jurisdiction = null,
        int page = 1,
        int pageSize = 20);
    
    /// <summary>
    /// Updates transfer status
    /// </summary>
    Task<Transfer> UpdateTransferStatusAsync(Guid transferId, string newStatus, Guid userId);
}
