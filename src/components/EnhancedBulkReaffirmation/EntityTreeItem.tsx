import React from 'react';
import styled from 'styled-components';
import { FiChevronRight } from 'react-icons/fi';
import { EntitySummary, RequirementVersion } from '../../types/requirements';

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

const ActionButton = styled.button`
  padding: 0.4rem 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
  color: #222;
  
  &:hover {
    background: #f5f5f5;
  }
`;


interface EntityTreeItemProps {
  entity: EntitySummary;
  versions: RequirementVersion[];
  isExpanded: boolean;
  selectedVersions: Set<string>;
  onToggle: () => void;
  onEntitySelect: (entityId: string, selectAll: boolean) => void;
  onEntityReaffirm: (entityId: string) => void;
}

const EntityTreeItem: React.FC<EntityTreeItemProps> = ({
  entity,
  versions,
  isExpanded,
  selectedVersions,
  onToggle,
  onEntitySelect,
  onEntityReaffirm
}) => {
  // Calculate if all versions are selected
  const allVersionsSelected = versions.length > 0 && 
    versions.every(version => selectedVersions.has(version.id));

  const someVersionsSelected = versions.some(version => 
    selectedVersions.has(version.id));

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
            checked={allVersionsSelected}
            ref={(input) => {
              if (input) {
                input.indeterminate = someVersionsSelected && !allVersionsSelected;
              }
            }}
            onChange={handleEntitySelectChange}
            disabled={versions.length === 0}
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
          <ActionButton onClick={(e) => {
            e.stopPropagation();
            onEntityReaffirm(entity.id);
          }}>
            Reaffirm All
          </ActionButton>
          <ActionButton onClick={(e) => {
            e.stopPropagation();
            // TODO: Implement view history
            console.log('View history for entity:', entity.id);
          }}>
            View History
          </ActionButton>
        </EntityActions>
      </EntityHeader>
      
      {/* Versions are now rendered by the virtualized list */}
    </EntityContainer>
  );
};

export default EntityTreeItem;
