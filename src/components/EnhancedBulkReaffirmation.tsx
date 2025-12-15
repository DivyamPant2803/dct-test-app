import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { 
  FilterCriteria, 
  ReaffirmationStatus 
} from '../types/index';
import { useVirtualizedRequirements } from '../hooks/useVirtualizedRequirements';
import StatsSection from './EnhancedBulkReaffirmation/StatsSection';
import FiltersSection from './EnhancedBulkReaffirmation/FiltersSection';
import EntityDataSection from './EnhancedBulkReaffirmation/EntityDataSection';
import ReaffirmModal from './ReaffirmModal';
import BulkReaffirmModal from './BulkReaffirmModal';
import { Requirement } from '../types/index';

// Styled Components
const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
`;

interface EnhancedBulkReaffirmationProps {
  // No props needed for the tree structure
}

const EnhancedBulkReaffirmation: React.FC<EnhancedBulkReaffirmationProps> = () => {
  // Use the virtualized requirements hook
  const {
    entities,
    loadingEntities,
    loadingVersions,
    expandedEntities,
    expandedVersions,
    selectedVersions,
    selectedCombinations,
    filters,
    setFilters,
    summary,
    handleEntityToggle,
    handleVersionToggle,
    handleVersionSelect,
    handleCombinationSelect,
    handleEntitySelect,
    handleClearSelection,
    handleBulkReaffirm: originalHandleBulkReaffirm
  } = useVirtualizedRequirements();

  // Modal State
  const [reaffirmModalOpen, setReaffirmModalOpen] = useState(false);
  const [bulkReaffirmModalOpen, setBulkReaffirmModalOpen] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<Requirement | null>(null);
  const [selectedRequirements, setSelectedRequirements] = useState<Requirement[]>([]);

  // Helper to find requirement from combination ID
  const findRequirement = (combinationId: string): Requirement | null => {
    for (const entity of entities) {
      // Check direct combinations
      const directCombo = entity.combinations?.find(c => c.id === combinationId);
      if (directCombo) return directCombo.requirement;

      // Check versions
      if (entity.versions) {
        for (const version of entity.versions) {
          const versionCombo = version.combinations?.find(c => c.id === combinationId);
          if (versionCombo) return versionCombo.requirement;
        }
      }
    }
    return null;
  };

  // Helper to find all requirements for an entity
  const findEntityRequirements = (entityId: string): Requirement[] => {
    const entity = entities.find(e => e.name === entityId || e.id === entityId); // Handle both name and ID usage
    if (!entity) return [];

    const reqs: Requirement[] = [];
    
    if (entity.versionsLoaded && entity.versions) {
      entity.versions.forEach(v => {
        v.combinations.forEach(c => {
          if (c.requirement) reqs.push(c.requirement);
        });
      });
    } else if (entity.combinations) {
      entity.combinations.forEach(c => {
        if (c.requirement) reqs.push(c.requirement);
      });
    }
    
    return reqs;
  };

  // Helper to find all requirements for a version
  const findVersionRequirements = (versionId: string): Requirement[] => {
    for (const entity of entities) {
      const version = entity.versions?.find(v => v.id === versionId);
      if (version) {
        return version.combinations.map(c => c.requirement).filter(Boolean);
      }
    }
    return [];
  };

  // Helper to find requirements from a list of combination IDs
  const findRequirementsFromCombinations = (combinationIds: string[]): Requirement[] => {
    const reqs: Requirement[] = [];
    const idSet = new Set(combinationIds);

    for (const entity of entities) {
      // Check direct combinations
      if (entity.combinations) {
        entity.combinations.forEach(c => {
          if (idSet.has(c.id) && c.requirement) {
            reqs.push(c.requirement);
          }
        });
      }

      // Check versions
      if (entity.versions) {
        entity.versions.forEach(v => {
          v.combinations.forEach(c => {
            if (idSet.has(c.id) && c.requirement) {
              // Avoid duplicates if same requirement is in multiple places (unlikely but safe)
              if (!reqs.find(r => r.id === c.requirement.id)) {
                reqs.push(c.requirement);
              }
            }
          });
        });
      }
    }
    return reqs;
  };

  // Intercepted Handlers
  const handleEntityReaffirmClick = async (entityId: string) => {
    const reqs = findEntityRequirements(entityId);
    if (reqs.length > 0) {
      setSelectedRequirements(reqs);
      setBulkReaffirmModalOpen(true);
    }
  };

  const handleVersionReaffirmClick = async (versionId: string) => {
    const reqs = findVersionRequirements(versionId);
    if (reqs.length > 0) {
      setSelectedRequirements(reqs);
      setBulkReaffirmModalOpen(true);
    }
  };

  const handleCombinationReaffirmClick = async (combinationId: string) => {
    const req = findRequirement(combinationId);
    if (req) {
      setSelectedRequirement(req);
      setReaffirmModalOpen(true);
    }
  };

  const handleBulkReaffirmClick = async (request: any) => {
    // If request comes from the button click in EntityDataSection, it has combinationIds
    if (request.combinationIds && request.combinationIds.length > 0) {
      const reqs = findRequirementsFromCombinations(request.combinationIds);
      if (reqs.length > 0) {
        setSelectedRequirements(reqs);
        setBulkReaffirmModalOpen(true);
      }
    }
  };

  // Modal Submit Handlers
  const handleSingleReaffirmSubmit = async (data: any) => {
    try {
      // We can use the bulk API for single items too, or implement a specific one
      // Since the hook exposes handleBulkReaffirm, let's use that for now
      // But we need to find the combination ID for this requirement
      // This is a bit tricky since we went from Combination -> Requirement
      // We need to map back or pass the combination ID.
      
      // Let's assume we can find the combination ID from the requirement ID if needed
      // Or better, modify the modal to pass back what we need.
      
      // For now, let's just use the original bulk handler with the requirement ID mapped back to combination ID?
      // Actually, the API expects combination IDs.
      // We need to store the combination ID when we open the modal.
      
      // Let's find the combination ID for the selected requirement
      // This is inefficient, but safe:
      let combinationId: string | undefined;
      
      // Search again...
      outerLoop:
      for (const entity of entities) {
        if (entity.combinations) {
          const found = entity.combinations.find(c => c.requirement.id === data.requirementId);
          if (found) { combinationId = found.id; break; }
        }
        if (entity.versions) {
          for (const v of entity.versions) {
            const found = v.combinations.find(c => c.requirement.id === data.requirementId);
            if (found) { combinationId = found.id; break outerLoop; }
          }
        }
      }

      if (combinationId) {
        await originalHandleBulkReaffirm({
          combinationIds: [combinationId],
          action: data.action,
          comment: data.comment,
          individualOverrides: data.proposedChanges ? {
            [combinationId]: {
              action: 'REAFFIRMED_WITH_CHANGES',
              comment: data.proposedChanges
            }
          } : undefined
        });
      }
      
      setReaffirmModalOpen(false);
      setSelectedRequirement(null);
    } catch (error) {
      console.error('Reaffirmation failed:', error);
    }
  };

  const handleBulkReaffirmSubmit = async (data: any) => {
    try {
      // Map requirement IDs back to combination IDs
      const combinationIds: string[] = [];
      const reqIdSet = new Set(data.requirementIds);
      
      for (const entity of entities) {
        if (entity.combinations) {
          entity.combinations.forEach(c => {
            if (reqIdSet.has(c.requirement.id)) combinationIds.push(c.id);
          });
        }
        if (entity.versions) {
          entity.versions.forEach(v => {
            v.combinations.forEach(c => {
              if (reqIdSet.has(c.requirement.id)) combinationIds.push(c.id);
            });
          });
        }
      }
      
      // Remove duplicates
      const uniqueCombinationIds = [...new Set(combinationIds)];

      await originalHandleBulkReaffirm({
        combinationIds: uniqueCombinationIds,
        action: data.action,
        comment: data.comment
      });
      
      setBulkReaffirmModalOpen(false);
      setSelectedRequirements([]);
    } catch (error) {
      console.error('Bulk reaffirmation failed:', error);
    }
  };

  // Get filter options from entities data
  const filterOptions = useMemo(() => {
    const entityNames = entities.map(e => e.name).sort();
    const dataSubjectTypes = ['Employee', 'Client', 'Candidate', 'Prospect'];
    const transferLocations = ['Germany', 'United States', 'Singapore', 'United Kingdom', 'Canada', 'Brazil'];
    const recipientTypes = ['Entity', 'Service Provider', 'Third Party', 'External Authorities'];
    const reviewDataTransferPurposes = [
      'Client Relationship Management',
      'Administration of Employment Contract', 
      'Monitoring',
      'Compliance with Legal or Regulatory Obligations',
      'Other Purposes'
    ];
    const reaffirmationStatuses: ReaffirmationStatus[] = ['CURRENT', 'DUE_SOON', 'OVERDUE'];

    return {
      entities: entityNames,
      dataSubjectTypes,
      transferLocations,
      recipientTypes,
      reviewDataTransferPurposes,
      reaffirmationStatuses
    };
  }, [entities]);



  const handleFilterChange = (filterType: keyof FilterCriteria, value: string) => {
    const newFilters = {
      ...filters,
      [filterType]: (filters[filterType] as string[]).includes(value)
        ? (filters[filterType] as string[]).filter(v => v !== value)
        : [...(filters[filterType] as string[]), value]
    };
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      entities: [],
      dataSubjectTypes: [],
      transferLocations: [],
      recipientTypes: [],
      reviewDataTransferPurposes: [],
      reaffirmationStatuses: []
    });
  };

  return (
    <Container>
      <StatsSection summary={summary} />
      
      <FiltersSection
        filters={filters}
        filterOptions={filterOptions}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />
      
      <EntityDataSection
        entities={entities}
        loadingEntities={loadingEntities}
        loadingVersions={loadingVersions}
        expandedEntities={expandedEntities}
        expandedVersions={expandedVersions}
        selectedVersions={selectedVersions}
        selectedCombinations={selectedCombinations}
        onEntityToggle={handleEntityToggle}
        onVersionToggle={handleVersionToggle}
        onEntitySelect={handleEntitySelect}
        onVersionSelect={handleVersionSelect}
        onCombinationSelect={handleCombinationSelect}
        onEntityReaffirm={handleEntityReaffirmClick}
        onVersionReaffirm={handleVersionReaffirmClick}
        onCombinationReaffirm={handleCombinationReaffirmClick}
        onClearSelection={handleClearSelection}
        onBulkReaffirm={handleBulkReaffirmClick}
      />

      <ReaffirmModal
        isOpen={reaffirmModalOpen}
        onClose={() => setReaffirmModalOpen(false)}
        requirement={selectedRequirement}
        onSubmit={handleSingleReaffirmSubmit}
      />

      <BulkReaffirmModal
        isOpen={bulkReaffirmModalOpen}
        onClose={() => setBulkReaffirmModalOpen(false)}
        requirements={selectedRequirements}
        onSubmit={handleBulkReaffirmSubmit}
      />
    </Container>
  );
};

export default EnhancedBulkReaffirmation;
