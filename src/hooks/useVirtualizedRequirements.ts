import { useState, useCallback, useEffect, useMemo } from 'react';
import { EntitySummary, FilterCriteria, VirtualizedEntityItem, RequirementVersion } from '../types/requirements';
import { BulkReaffirmationRequest } from '../types/index';
import { requirementsService } from '../services/requirementsService';

interface UseVirtualizedRequirementsReturn {
  // Data
  entities: EntitySummary[];
  virtualizedItems: VirtualizedEntityItem[];
  
  // Loading states
  loadingEntities: boolean;
  loadingVersions: Set<string>;
  
  // Tree management
  expandedEntities: Set<string>;
  expandedVersions: Set<string>;
  handleEntityToggle: (entityId: string) => Promise<void>;
  handleVersionToggle: (versionId: string) => Promise<void>;
  
  // Selection
  selectedVersions: Set<string>;
  selectedCombinations: Set<string>;
  handleVersionSelect: (versionId: string, selectAll: boolean) => void;
  handleCombinationSelect: (combinationId: string) => void;
  handleEntitySelect: (entityId: string, selectAll: boolean) => void;
  handleClearSelection: () => void;
  
  // Filtering
  filters: FilterCriteria;
  setFilters: (filters: FilterCriteria) => void;
  
  // Actions
  handleEntityReaffirm: (entityId: string) => Promise<void>;
  handleVersionReaffirm: (versionId: string) => Promise<void>;
  handleCombinationReaffirm: (combinationId: string) => Promise<void>;
  handleBulkReaffirm: (request: BulkReaffirmationRequest) => Promise<void>;
  refreshData: () => Promise<void>;
  
  // Summary
  summary: {
    totalRequirements: number;
    currentCount: number;
    dueSoonCount: number;
    overdueCount: number;
  };
}

export const useVirtualizedRequirements = (): UseVirtualizedRequirementsReturn => {
  // State
  const [entities, setEntities] = useState<EntitySummary[]>([]);
  const [loadingEntities, setLoadingEntities] = useState(false);
  const [loadingVersions, setLoadingVersions] = useState<Set<string>>(new Set());
  const [expandedEntities, setExpandedEntities] = useState<Set<string>>(new Set());
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set());
  const [selectedVersions, setSelectedVersions] = useState<Set<string>>(new Set());
  const [selectedCombinations, setSelectedCombinations] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<FilterCriteria>({
    entities: [],
    dataSubjectTypes: [],
    transferLocations: [],
    recipientTypes: [],
    reviewDataTransferPurposes: [],
    reaffirmationStatuses: []
  });
  const [summary, setSummary] = useState({
    totalRequirements: 0,
    currentCount: 0,
    dueSoonCount: 0,
    overdueCount: 0
  });

  // Load entities
  const loadEntities = useCallback(async () => {
    setLoadingEntities(true);
    try {
      const response = await requirementsService.getEntities(filters);
      setEntities(response.entities);
      setSummary(response.summary);
    } catch (error) {
      console.error('Failed to load entities:', error);
    } finally {
      setLoadingEntities(false);
    }
  }, [filters]);

  // Load versions for a specific entity
  const loadEntityVersions = useCallback(async (entityId: string) => {
    if (loadingVersions.has(entityId)) return;
    
    setLoadingVersions(prev => new Set(prev).add(entityId));
    
    try {
      // TODO: Update API call to get versions instead of combinations
      const response = await requirementsService.getEntityCombinations(entityId, 0, 1000, filters);
      
      // For now, create mock versions from combinations
      const mockVersions: RequirementVersion[] = [
        {
          id: `${entityId}-v1`,
          versionNo: 1,
          status: 'CURRENT',
          lastReaffirmedDate: '2024-01-15',
          nextReaffirmationDate: '2025-01-15',
          combinations: response.combinations.slice(0, Math.ceil(response.combinations.length / 2)),
          totalCombinations: Math.ceil(response.combinations.length / 2),
          dueCombinations: 0,
          overdueCombinations: 0,
          isActive: true,
          createdAt: '2024-01-15',
          createdBy: 'system'
        },
        {
          id: `${entityId}-v2`,
          versionNo: 2,
          status: 'DUE_SOON',
          lastReaffirmedDate: '2023-12-01',
          nextReaffirmationDate: '2024-12-01',
          combinations: response.combinations.slice(Math.ceil(response.combinations.length / 2)),
          totalCombinations: Math.floor(response.combinations.length / 2),
          dueCombinations: Math.floor(response.combinations.length / 2),
          overdueCombinations: 0,
          isActive: true,
          createdAt: '2023-12-01',
          createdBy: 'system'
        }
      ];
      
      setEntities(prev => prev.map(entity => 
        entity.id === entityId 
          ? { 
              ...entity, 
              versions: mockVersions,
              versionsLoaded: true,
              totalVersions: mockVersions.length,
              // Keep combinations for backward compatibility
              combinations: response.combinations, 
              combinationsLoaded: true,
              totalCombinations: response.total 
            }
          : entity
      ));
    } catch (error) {
      console.error(`Failed to load versions for entity ${entityId}:`, error);
    } finally {
      setLoadingVersions(prev => {
        const newSet = new Set(prev);
        newSet.delete(entityId);
        return newSet;
      });
    }
  }, [filters, loadingVersions]);

  // Handle entity expand/collapse
  const handleEntityToggle = useCallback(async (entityId: string) => {
    const isExpanding = !expandedEntities.has(entityId);
    
    if (isExpanding) {
      setExpandedEntities(prev => new Set(prev).add(entityId));
      
      // Load versions if not already loaded
      const entity = entities.find(e => e.id === entityId);
      if (entity && !entity.versionsLoaded) {
        await loadEntityVersions(entityId);
      }
    } else {
      setExpandedEntities(prev => {
        const newSet = new Set(prev);
        newSet.delete(entityId);
        return newSet;
      });
    }
  }, [expandedEntities, entities, loadEntityVersions]);

  // Handle version expand/collapse
  const handleVersionToggle = useCallback(async (versionId: string) => {
    const isExpanding = !expandedVersions.has(versionId);
    
    if (isExpanding) {
      setExpandedVersions(prev => new Set(prev).add(versionId));
    } else {
      setExpandedVersions(prev => {
        const newSet = new Set(prev);
        newSet.delete(versionId);
        return newSet;
      });
    }
  }, [expandedVersions]);

  // Handle version selection
  const handleVersionSelect = useCallback((versionId: string, selectAll: boolean) => {
    const version = entities
      .flatMap(e => e.versions || [])
      .find(v => v.id === versionId);
    
    if (!version) return;

    setSelectedCombinations(prev => {
      const newSet = new Set(prev);
      version.combinations.forEach(combo => {
        if (selectAll) {
          newSet.add(combo.id);
        } else {
          newSet.delete(combo.id);
        }
      });
      return newSet;
    });

    setSelectedVersions(prev => {
      const newSet = new Set(prev);
      if (selectAll) {
        newSet.add(versionId);
      } else {
        newSet.delete(versionId);
      }
      return newSet;
    });
  }, [entities]);

  // Handle combination selection
  const handleCombinationSelect = useCallback((combinationId: string) => {
    setSelectedCombinations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(combinationId)) {
        newSet.delete(combinationId);
      } else {
        newSet.add(combinationId);
      }
      return newSet;
    });
  }, []);

  // Handle entity selection (select all versions in entity)
  const handleEntitySelect = useCallback((entityId: string, selectAll: boolean) => {
    const entity = entities.find(e => e.id === entityId);
    if (!entity || !entity.versionsLoaded) return;

    setSelectedVersions(prev => {
      const newSet = new Set(prev);
      entity.versions.forEach(version => {
        if (selectAll) {
          newSet.add(version.id);
        } else {
          newSet.delete(version.id);
        }
      });
      return newSet;
    });

    setSelectedCombinations(prev => {
      const newSet = new Set(prev);
      entity.versions.forEach(version => {
        version.combinations.forEach(combo => {
          if (selectAll) {
            newSet.add(combo.id);
          } else {
            newSet.delete(combo.id);
          }
        });
      });
      return newSet;
    });
  }, [entities]);

  // Clear selection
  const handleClearSelection = useCallback(() => {
    setSelectedVersions(new Set());
    setSelectedCombinations(new Set());
  }, []);

  // Reaffirmation handlers
  const handleEntityReaffirm = useCallback(async (entityId: string) => {
    const entity = entities.find(e => e.id === entityId);
    if (!entity || !entity.versionsLoaded) return;

    try {
      // TODO: Implement entity-level reaffirmation
      console.log('Reaffirming all versions for entity:', entityId);
      // This would reaffirm all versions in the entity
    } catch (error) {
      console.error('Entity reaffirmation failed:', error);
    }
  }, [entities]);

  const handleVersionReaffirm = useCallback(async (versionId: string) => {
    try {
      // TODO: Implement version-level reaffirmation
      console.log('Reaffirming version:', versionId);
      // This would reaffirm all combinations in the version
    } catch (error) {
      console.error('Version reaffirmation failed:', error);
    }
  }, []);

  const handleCombinationReaffirm = useCallback(async (combinationId: string) => {
    try {
      // TODO: Implement combination-level reaffirmation
      console.log('Reaffirming combination:', combinationId);
      // This would create a new version with just this combination
    } catch (error) {
      console.error('Combination reaffirmation failed:', error);
    }
  }, []);

  // Handle bulk reaffirmation
  const handleBulkReaffirm = useCallback(async (request: BulkReaffirmationRequest) => {
    try {
      // In a real implementation, this would call the API
      console.log('Bulk reaffirmation request:', request);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state optimistically
      setEntities(prev => prev.map(entity => ({
        ...entity,
        combinations: entity.combinations.map(combo => 
          request.combinationIds.includes(combo.id)
            ? { ...combo, reaffirmationStatus: 'CURRENT' as const }
            : combo
        )
      })));
      
      // Clear selection
      setSelectedCombinations(new Set());
      
      // Refresh data to get updated counts
      await loadEntities();
      
    } catch (error) {
      console.error('Bulk reaffirmation failed:', error);
      throw error;
    }
  }, [loadEntities]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    await loadEntities();
    
    // Reload versions for expanded entities
    const expandedEntityIds = Array.from(expandedEntities);
    for (const entityId of expandedEntityIds) {
      await loadEntityVersions(entityId);
    }
  }, [loadEntities, expandedEntities, loadEntityVersions]);

  // Create virtualized items
  const virtualizedItems = useMemo(() => {
    return entities.map(entity => ({
      id: entity.id,
      type: 'entity' as const,
      entity,
      isExpanded: expandedEntities.has(entity.id)
    }));
  }, [entities, expandedEntities]);

  // Load entities on mount and filter changes
  useEffect(() => {
    loadEntities();
  }, [loadEntities]);

  // Clear expanded entities when filters change
  useEffect(() => {
    setExpandedEntities(new Set());
    setExpandedVersions(new Set());
    setSelectedVersions(new Set());
    setSelectedCombinations(new Set());
  }, [filters]);

  return {
    // Data
    entities,
    virtualizedItems,
    
    // Loading states
    loadingEntities,
    loadingVersions,
    
    // Tree management
    expandedEntities,
    expandedVersions,
    handleEntityToggle,
    handleVersionToggle,
    
    // Selection
    selectedVersions,
    selectedCombinations,
    handleVersionSelect,
    handleCombinationSelect,
    handleEntitySelect,
    handleClearSelection,
    
    // Filtering
    filters,
    setFilters,
    
    // Actions
    handleEntityReaffirm,
    handleVersionReaffirm,
    handleCombinationReaffirm,
    handleBulkReaffirm,
    refreshData,
    
    // Summary
    summary
  };
};
