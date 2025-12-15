import React from 'react';
import styled from 'styled-components';
import { RequirementCombination, ReaffirmationStatus } from '../../types/index';

const CombinationContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  
  &:hover {
    background: #f8f9fa;
  }
`;

const CombinationInfo = styled.div`
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

const CombinationDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
`;

const CombinationTitle = styled.div`
  font-weight: 400;
  color: #222;
  font-size: 0.8rem;
`;

const CombinationMeta = styled.div`
  font-size: 0.7rem;
  color: #666;
  display: flex;
  gap: 0.75rem;
`;

const StatusBadge = styled.span<{ $status: ReaffirmationStatus }>`
  padding: 0.15rem 0.4rem;
  border-radius: 3px;
  font-size: 0.65rem;
  font-weight: 500;
  white-space: nowrap;
  
  ${props => {
    switch (props.$status) {
      case 'CURRENT':
        return `
          background: #d1fae5;
          color: #065f46;
        `;
      case 'DUE_SOON':
        return `
          background: #fef3c7;
          color: #92400e;
        `;
      case 'OVERDUE':
        return `
          background: #fee2e2;
          color: #991b1b;
        `;
    }
  }}
`;

const CombinationActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  padding: 0.3rem 0.6rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
  color: #222;
  font-size: 0.7rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f5f5f5;
  }
`;

interface CombinationItemProps {
  combination: RequirementCombination;
  isSelected: boolean;
  onSelect: () => void;
  onReaffirm: () => void;
}

const CombinationItem: React.FC<CombinationItemProps> = ({
  combination,
  isSelected,
  onSelect,
  onReaffirm
}) => {
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onSelect();
  };

  const handleReaffirmClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onReaffirm();
  };

  return (
    <CombinationContainer>
      <CombinationInfo>
        <Checkbox
          type="checkbox"
          checked={isSelected}
          onChange={handleCheckboxChange}
        />
        <CombinationDetails>
          <CombinationTitle>{combination.requirement.title}</CombinationTitle>
          <CombinationMeta>
            <span>{combination.dataSubjectType}</span>
            <span>•</span>
            <span>{combination.transferLocation}</span>
            <span>•</span>
            <span>{combination.recipientType}</span>
            <span>•</span>
            <span>{combination.reviewDataTransferPurpose}</span>
          </CombinationMeta>
        </CombinationDetails>
      </CombinationInfo>
      <CombinationActions>
        <StatusBadge $status={combination.reaffirmationStatus}>
          {combination.reaffirmationStatus.replace('_', ' ')}
        </StatusBadge>
        <ActionButton onClick={handleReaffirmClick}>
          Reaffirm
        </ActionButton>
      </CombinationActions>
    </CombinationContainer>
  );
};

export default CombinationItem;
