import { 
  EntitySummary, 
  EntitiesResponse, 
  EntityCombinationsResponse, 
  FilterCriteria 
} from '../types/requirements';
import { RequirementCombination } from '../types/index';
import { generateEntitySummaries, generateMockCombinations } from './mockData';

// In-memory storage for mock data
let mockEntities: EntitySummary[] = [];
let mockCombinationsCache: Map<string, RequirementCombination[]> = new Map();

// Initialize mock data
const initializeMockData = () => {
  if (mockEntities.length === 0) {
    mockEntities = generateEntitySummaries();
    console.log(`Generated ${mockEntities.length} mock entities`);
  }
};

// Simulate API delay
const simulateDelay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

export class RequirementsService {
  /**
   * Get all entities with summary data
   */
  async getEntities(filters?: FilterCriteria): Promise<EntitiesResponse> {
    await simulateDelay(500); // Simulate API call
    initializeMockData();
    
    let filteredEntities = [...mockEntities];
    
    // Apply filters if provided
    if (filters?.entities && filters.entities.length > 0) {
      filteredEntities = filteredEntities.filter(entity => 
        filters.entities.includes(entity.name)
      );
    }
    
    // Calculate summary statistics
    const totalRequirements = filteredEntities.reduce((sum, entity) => sum + entity.totalRequirements, 0);
    const currentCount = filteredEntities.reduce((sum, entity) => 
      sum + (entity.totalRequirements - entity.dueRequirements - entity.overdueRequirements), 0);
    const dueSoonCount = filteredEntities.reduce((sum, entity) => sum + entity.dueRequirements, 0);
    const overdueCount = filteredEntities.reduce((sum, entity) => sum + entity.overdueRequirements, 0);
    
    return {
      entities: filteredEntities,
      totalEntities: filteredEntities.length,
      summary: {
        totalRequirements,
        currentCount,
        dueSoonCount,
        overdueCount
      }
    };
  }

  /**
   * Get combinations for a specific entity
   */
  async getEntityCombinations(
    entityId: string, 
    offset: number = 0, 
    limit: number = 100,
    filters?: FilterCriteria
  ): Promise<EntityCombinationsResponse> {
    await simulateDelay(200); // Simulate API call
    initializeMockData();
    
    const entity = mockEntities.find(e => e.id === entityId);
    if (!entity) {
      throw new Error(`Entity not found: ${entityId}`);
    }
    
    // Generate combinations if not cached
    if (!mockCombinationsCache.has(entityId)) {
      const combinations = generateMockCombinations(entity.name, entity.totalCombinations);
      mockCombinationsCache.set(entityId, combinations);
    }
    
    let combinations = mockCombinationsCache.get(entityId) || [];
    
    // Apply filters
    if (filters) {
      combinations = combinations.filter(combo => {
        if (filters.dataSubjectTypes?.length && !filters.dataSubjectTypes.includes(combo.dataSubjectType)) return false;
        if (filters.transferLocations?.length && !filters.transferLocations.includes(combo.transferLocation)) return false;
        if (filters.recipientTypes?.length && !filters.recipientTypes.includes(combo.recipientType)) return false;
        if (filters.reviewDataTransferPurposes?.length && !filters.reviewDataTransferPurposes.includes(combo.reviewDataTransferPurpose)) return false;
        if (filters.reaffirmationStatuses?.length && !filters.reaffirmationStatuses.includes(combo.reaffirmationStatus)) return false;
        return true;
      });
    }
    
    // Apply pagination
    const paginatedCombinations = combinations.slice(offset, offset + limit);
    const hasMore = offset + limit < combinations.length;
    const nextOffset = hasMore ? offset + limit : undefined;
    
    return {
      combinations: paginatedCombinations,
      total: combinations.length,
      hasMore,
      nextOffset
    };
  }

  /**
   * Get filter options based on current data
   */
  async getFilterOptions(): Promise<{
    entities: Array<{value: string, label: string, count: number}>;
    dataSubjectTypes: Array<{value: string, label: string, count: number}>;
    transferLocations: Array<{value: string, label: string, count: number}>;
    recipientTypes: Array<{value: string, label: string, count: number}>;
    reviewDataTransferPurposes: Array<{value: string, label: string, count: number}>;
    reaffirmationStatuses: Array<{value: string, label: string, count: number}>;
  }> {
    await simulateDelay(100);
    initializeMockData();
    
    // For now, return static options with counts
    // In production, this would calculate based on actual data
    return {
      entities: mockEntities.map(entity => ({
        value: entity.name,
        label: entity.name,
        count: entity.totalRequirements
      })),
      dataSubjectTypes: [
        { value: 'Employee', label: 'Employee', count: 5000 },
        { value: 'Client', label: 'Client', count: 7000 },
        { value: 'Candidate', label: 'Candidate', count: 4000 },
        { value: 'Prospect', label: 'Prospect', count: 4000 }
      ],
      transferLocations: [
        { value: 'Germany', label: 'Germany', count: 3000 },
        { value: 'United States', label: 'United States', count: 4000 },
        { value: 'Singapore', label: 'Singapore', count: 2500 },
        { value: 'United Kingdom', label: 'United Kingdom', count: 2000 },
        { value: 'Canada', label: 'Canada', count: 1800 },
        { value: 'Brazil', label: 'Brazil', count: 1500 }
      ],
      recipientTypes: [
        { value: 'Entity', label: 'Entity', count: 8000 },
        { value: 'Service Provider', label: 'Service Provider', count: 6000 },
        { value: 'Third Party', label: 'Third Party', count: 4000 },
        { value: 'External Authorities', label: 'External Authorities', count: 2000 }
      ],
      reviewDataTransferPurposes: [
        { value: 'Client Relationship Management', label: 'Client Relationship Management', count: 5000 },
        { value: 'Administration of Employment Contract', label: 'Administration of Employment Contract', count: 4000 },
        { value: 'Monitoring', label: 'Monitoring', count: 3000 },
        { value: 'Compliance with Legal or Regulatory Obligations', label: 'Compliance with Legal or Regulatory Obligations', count: 4000 },
        { value: 'Other Purposes', label: 'Other Purposes', count: 4000 }
      ],
      reaffirmationStatuses: [
        { value: 'CURRENT', label: 'Current', count: 12000 },
        { value: 'DUE_SOON', label: 'Due Soon', count: 4000 },
        { value: 'OVERDUE', label: 'Overdue', count: 4000 }
      ]
    };
  }

  /**
   * Clear cache (useful for testing)
   */
  clearCache(): void {
    mockCombinationsCache.clear();
    mockEntities = [];
  }
}

// Export singleton instance
export const requirementsService = new RequirementsService();
