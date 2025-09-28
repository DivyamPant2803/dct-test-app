import React from 'react';
import styled from 'styled-components';
import { FiCheck, FiX, FiRefreshCw } from 'react-icons/fi';
import { EntitySummary } from '../../types/requirements';
import { BulkReaffirmationRequest } from '../../types/index';
import VirtualizedEntityList from './VirtualizedEntityList';

const EntityDataContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  padding: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #666;
  font-size: 0.9rem;
`;

const LoadingSpinner = styled.div`
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const SelectionSummary = styled.div`
  position: sticky;
  bottom: 0;
  background: white;
  border-top: 1px solid #e9ecef;
  padding: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
`;

const SelectionInfo = styled.div`
  font-weight: 500;
  color: #222;
  font-size: 0.8rem;
`;

const SelectionActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  ${props => props.$variant === 'primary' ? `
    background: #222;
    color: white;
    
    &:hover {
      background: #444;
    }
    
    &:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
  ` : `
    background: white;
    color: #222;
    border: 1px solid #ccc;
    
    &:hover {
      background: #f5f5f5;
    }
  `}
`;

interface EntityDataSectionProps {
  entities: EntitySummary[];
  loadingEntities: boolean;
  loadingVersions: Set<string>;
  expandedEntities: Set<string>;
  expandedVersions: Set<string>;
  selectedVersions: Set<string>;
  selectedCombinations: Set<string>;
  containerHeight: number;
  onEntityToggle: (entityId: string) => Promise<void>;
  onVersionToggle: (versionId: string) => Promise<void>;
  onEntitySelect: (entityId: string, selectAll: boolean) => void;
  onVersionSelect: (versionId: string, selectAll: boolean) => void;
  onCombinationSelect: (combinationId: string) => void;
  onEntityReaffirm: (entityId: string) => Promise<void>;
  onVersionReaffirm: (versionId: string) => Promise<void>;
  onCombinationReaffirm: (combinationId: string) => Promise<void>;
  onClearSelection: () => void;
  onBulkReaffirm: (request: BulkReaffirmationRequest) => Promise<void>;
}

const EntityDataSection: React.FC<EntityDataSectionProps> = ({
  entities,
  loadingEntities,
  loadingVersions,
  expandedEntities,
  expandedVersions,
  selectedVersions,
  selectedCombinations,
  containerHeight,
  onEntityToggle,
  onVersionToggle,
  onEntitySelect,
  onVersionSelect,
  onCombinationSelect,
  onEntityReaffirm,
  onVersionReaffirm,
  onCombinationReaffirm,
  onClearSelection,
  onBulkReaffirm
}) => {
  const handleBulkReaffirmClick = async () => {
    if (selectedCombinations.size === 0) return;

    const request: BulkReaffirmationRequest = {
      combinationIds: Array.from(selectedCombinations),
      action: 'REAFFIRMED_AS_IS',
      comment: 'Bulk reaffirmation'
    };

    try {
      await onBulkReaffirm(request);
    } catch (error) {
      console.error('Bulk reaffirmation failed:', error);
    }
  };

  return (
    <EntityDataContainer>
      {loadingEntities ? (
        <LoadingContainer>
          <LoadingSpinner>
            <FiRefreshCw />
          </LoadingSpinner>
          Loading entities...
        </LoadingContainer>
      ) : (
        <VirtualizedEntityList
          entities={entities}
          expandedEntities={expandedEntities}
          expandedVersions={expandedVersions}
          selectedVersions={selectedVersions}
          selectedCombinations={selectedCombinations}
          loadingVersions={loadingVersions}
          onEntityToggle={onEntityToggle}
          onVersionToggle={onVersionToggle}
          onEntitySelect={onEntitySelect}
          onVersionSelect={onVersionSelect}
          onCombinationSelect={onCombinationSelect}
          onEntityReaffirm={onEntityReaffirm}
          onVersionReaffirm={onVersionReaffirm}
          onCombinationReaffirm={onCombinationReaffirm}
          height={containerHeight - 300} // Subtract header and filter heights
        />
      )}

      {selectedCombinations.size > 0 && (
        <SelectionSummary>
          <SelectionInfo>
            {selectedCombinations.size} requirement{selectedCombinations.size !== 1 ? 's' : ''} selected
          </SelectionInfo>
          <SelectionActions>
            <ActionButton onClick={onClearSelection}>
              <FiX />
              Clear Selection
            </ActionButton>
            <ActionButton $variant="primary" onClick={handleBulkReaffirmClick}>
              <FiCheck />
              Bulk Reaffirm ({selectedCombinations.size})
            </ActionButton>
          </SelectionActions>
        </SelectionSummary>
      )}
    </EntityDataContainer>
  );
};

export default EntityDataSection;
