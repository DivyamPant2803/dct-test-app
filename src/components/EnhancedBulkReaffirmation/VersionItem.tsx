import React from 'react';
import styled from 'styled-components';
import { FiChevronRight } from 'react-icons/fi';
import { RequirementVersion } from '../../types/requirements';
import CombinationItem from './CombinationItem';

const VersionContainer = styled.div`
  margin-bottom: 0.5rem;
`;

const VersionHeader = styled.div<{ $isExpanded: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-left: 20px; /* Indent for version level */
  
  &:hover {
    background: #e9ecef;
  }
`;

const VersionInfo = styled.div`
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

const VersionName = styled.div`
  font-weight: 600;
  color: #222;
  font-size: 0.9rem;
`;

const VersionStats = styled.div`
  display: flex;
  gap: 0.75rem;
  font-size: 0.8rem;
  color: #666;
`;

const StatusBadge = styled.div<{ $status: 'CURRENT' | 'DUE_SOON' | 'OVERDUE' }>`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  
  ${props => {
    switch (props.$status) {
      case 'CURRENT':
        return 'background: #d4edda; color: #155724;';
      case 'DUE_SOON':
        return 'background: #fff3cd; color: #856404;';
      case 'OVERDUE':
        return 'background: #f8d7da; color: #721c24;';
      default:
        return 'background: #e9ecef; color: #495057;';
    }
  }}
`;

const VersionActions = styled.div`
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

const CombinationsList = styled.div<{ $isExpanded: boolean }>`
  display: ${props => props.$isExpanded ? 'block' : 'none'};
  margin-top: 0.5rem;
  margin-left: 20px; /* Indent for combinations */
`;

interface VersionItemProps {
  version: RequirementVersion;
  entityId: string;
  isExpanded: boolean;
  selectedCombinations: Set<string>;
  onToggle: () => void;
  onVersionSelect: (versionId: string, selectAll: boolean) => void;
  onCombinationSelect: (combinationId: string) => void;
  onCombinationReaffirm: (combinationId: string) => void;
  onVersionReaffirm: (versionId: string) => void;
}

const VersionItem: React.FC<VersionItemProps> = ({
  version,
  isExpanded,
  selectedCombinations,
  onToggle,
  onVersionSelect,
  onCombinationSelect,
  onCombinationReaffirm,
  onVersionReaffirm
}) => {
  const isAllCombinationsSelected = version.combinations.length > 0 && 
    version.combinations.every(combo => selectedCombinations.has(combo.id));

  const isSomeCombinationsSelected = version.combinations.some(combo => 
    selectedCombinations.has(combo.id));

  const handleVersionSelectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onVersionSelect(version.id, e.target.checked);
  };

  const handleToggle = (e: React.MouseEvent) => {
    // Don't toggle if clicking on checkbox
    if ((e.target as HTMLInputElement).type === 'checkbox') {
      return;
    }
    onToggle();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <VersionContainer>
      <VersionHeader $isExpanded={isExpanded} onClick={handleToggle}>
        <VersionInfo>
          <Checkbox
            type="checkbox"
            checked={isAllCombinationsSelected}
            ref={(input) => {
              if (input) {
                input.indeterminate = isSomeCombinationsSelected && !isAllCombinationsSelected;
              }
            }}
            onChange={handleVersionSelectChange}
            disabled={version.combinations.length === 0}
          />
          <ExpandIcon $isExpanded={isExpanded}>
            <FiChevronRight />
          </ExpandIcon>
          <VersionName>Version {version.versionNo}</VersionName>
          <StatusBadge $status={version.status}>{version.status}</StatusBadge>
          <VersionStats>
            <span>{version.totalCombinations} combinations</span>
            <span>Last: {formatDate(version.lastReaffirmedDate)}</span>
          </VersionStats>
        </VersionInfo>
        <VersionActions>
          <ActionButton onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}>
            {isExpanded ? 'Collapse' : 'Expand'}
          </ActionButton>
          <ActionButton onClick={(e) => {
            e.stopPropagation();
            onVersionReaffirm(version.id);
          }}>
            Reaffirm Version
          </ActionButton>
        </VersionActions>
      </VersionHeader>
      
      <CombinationsList $isExpanded={isExpanded}>
        {version.combinations.map(combo => (
          <CombinationItem
            key={combo.id}
            combination={combo}
            isSelected={selectedCombinations.has(combo.id)}
            onSelect={() => onCombinationSelect(combo.id)}
            onReaffirm={() => onCombinationReaffirm(combo.id)}
          />
        ))}
      </CombinationsList>
    </VersionContainer>
  );
};

export default VersionItem;
