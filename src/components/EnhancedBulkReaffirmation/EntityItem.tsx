import React from 'react';
import styled from 'styled-components';
import { FiChevronRight, FiLoader } from 'react-icons/fi';
import { EntitySummary } from '../../types/requirements';
import CombinationItem from './CombinationItem';

const EntityContainer = styled.div`
  margin-bottom: 0.75rem;
`;

const EntityHeader = styled.div<{ $isExpanded: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #e9ecef;
  }
`;

const EntityInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  cursor: pointer;
`;

const ExpandIcon = styled.div<{ $isExpanded: boolean }>`
  transform: ${props => props.$isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'};
  transition: transform 0.2s ease;
  display: flex;
  align-items: center;
`;

const EntityName = styled.div`
  font-weight: 600;
  color: #222;
  font-size: 0.9rem;
`;

const EntityStats = styled.div`
  display: flex;
  gap: 0.75rem;
  font-size: 0.8rem;
  color: #666;
`;

const EntityActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 0.4rem 0.75rem;
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

const CombinationsList = styled.div<{ $isExpanded: boolean }>`
  display: ${props => props.$isExpanded ? 'block' : 'none'};
  margin-top: 0.5rem;
  padding-left: 0.75rem;
  max-height: 400px;
  overflow-y: auto;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
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

interface EntityItemProps {
  entity: EntitySummary;
  isExpanded: boolean;
  isLoading: boolean;
  selectedCombinations: Set<string>;
  onToggle: () => void;
  onEntitySelect: (entityId: string, selectAll: boolean) => void;
  onCombinationSelect: (combinationId: string) => void;
  onIndividualReaffirm: (combinationId: string) => void;
}

const EntityItem: React.FC<EntityItemProps> = ({
  entity,
  isExpanded,
  isLoading,
  selectedCombinations,
  onToggle,
  onEntitySelect,
  onCombinationSelect,
  onIndividualReaffirm
}) => {
  const isAllCombinationsSelected = entity.combinationsLoaded && 
    entity.combinations.length > 0 && 
    entity.combinations.every(combo => selectedCombinations.has(combo.id));

  const isSomeCombinationsSelected = entity.combinationsLoaded &&
    entity.combinations.some(combo => selectedCombinations.has(combo.id));

  const handleEntitySelectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onEntitySelect(entity.id, e.target.checked);
  };

  const handleToggle = (e: React.MouseEvent) => {
    // Don't toggle if clicking on checkbox
    if ((e.target as HTMLInputElement).type === 'checkbox') {
      return;
    }
    onToggle();
  };

  return (
    <EntityContainer>
      <EntityHeader $isExpanded={isExpanded} onClick={handleToggle}>
        <EntityInfo>
          <Checkbox
            type="checkbox"
            checked={isAllCombinationsSelected}
            ref={(input) => {
              if (input) {
                input.indeterminate = isSomeCombinationsSelected && !isAllCombinationsSelected;
              }
            }}
            onChange={handleEntitySelectChange}
            disabled={!entity.combinationsLoaded || entity.combinations.length === 0}
          />
          <ExpandIcon $isExpanded={isExpanded}>
            <FiChevronRight />
          </ExpandIcon>
          <EntityName>{entity.name}</EntityName>
          <EntityStats>
            <span>{entity.totalRequirements} total</span>
            <span>{entity.dueRequirements} due</span>
            <span>{entity.overdueRequirements} overdue</span>
          </EntityStats>
        </EntityInfo>
        <EntityActions>
          <ActionButton onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}>
            {isExpanded ? 'Collapse' : 'Expand'}
          </ActionButton>
        </EntityActions>
      </EntityHeader>
      
      <CombinationsList $isExpanded={isExpanded}>
        {isLoading ? (
          <LoadingContainer>
            <LoadingSpinner>
              <FiLoader />
            </LoadingSpinner>
            Loading combinations...
          </LoadingContainer>
        ) : entity.combinationsLoaded ? (
          entity.combinations.map(combo => (
            <CombinationItem
              key={combo.id}
              combination={combo}
              isSelected={selectedCombinations.has(combo.id)}
              onSelect={() => onCombinationSelect(combo.id)}
              onReaffirm={() => onIndividualReaffirm(combo.id)}
            />
          ))
        ) : (
          <LoadingContainer>
            Click expand to load combinations
          </LoadingContainer>
        )}
      </CombinationsList>
    </EntityContainer>
  );
};

export default EntityItem;
