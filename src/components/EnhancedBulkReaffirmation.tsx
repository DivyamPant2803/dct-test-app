import React, { useState, useMemo, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FilterCriteria, 
  ReaffirmationStatus 
} from '../types/index';
import { useVirtualizedRequirements } from '../hooks/useVirtualizedRequirements';
import StatsSection from './EnhancedBulkReaffirmation/StatsSection';
import FiltersSection from './EnhancedBulkReaffirmation/FiltersSection';
import EntityDataSection from './EnhancedBulkReaffirmation/EntityDataSection';

// Styled Components
const Container = styled.div`
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
`;

interface EnhancedBulkReaffirmationProps {
  // No props needed for the tree structure
}

const EnhancedBulkReaffirmation: React.FC<EnhancedBulkReaffirmationProps> = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(600);
  
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
    handleEntityReaffirm,
    handleVersionReaffirm,
    handleCombinationReaffirm,
    handleBulkReaffirm
  } = useVirtualizedRequirements();

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

  // Update container height when component mounts
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const availableHeight = window.innerHeight - rect.top - 100; // 100px buffer
        setContainerHeight(Math.max(400, availableHeight));
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

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
    <Container ref={containerRef}>
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
        containerHeight={containerHeight}
        onEntityToggle={handleEntityToggle}
        onVersionToggle={handleVersionToggle}
        onEntitySelect={handleEntitySelect}
        onVersionSelect={handleVersionSelect}
        onCombinationSelect={handleCombinationSelect}
        onEntityReaffirm={handleEntityReaffirm}
        onVersionReaffirm={handleVersionReaffirm}
        onCombinationReaffirm={handleCombinationReaffirm}
        onClearSelection={handleClearSelection}
        onBulkReaffirm={handleBulkReaffirm}
      />
    </Container>
  );
};

export default EnhancedBulkReaffirmation;
