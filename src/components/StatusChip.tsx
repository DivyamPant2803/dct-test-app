import React from 'react';
import styled from 'styled-components';
import { RequirementStatus } from '../types/index';

const Chip = styled.span<{ $status: RequirementStatus }>`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-weight: 500;
  font-size: 0.8rem;
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  background-color: ${props => {
    switch (props.$status) {
      case 'PENDING':
        return '#FFA000';
      case 'UNDER_REVIEW':
        return '#2196F3';
      case 'APPROVED':
        return '#4CAF50';
      case 'REJECTED':
        return '#F44336';
      case 'ESCALATED':
        return '#9C27B0';
      default:
        return '#666666';
    }
  }};
  
  color: white;
`;

interface StatusChipProps {
  status: RequirementStatus;
}

const StatusChip: React.FC<StatusChipProps> = ({ status }) => {
  const getStatusLabel = (status: RequirementStatus): string => {
    switch (status) {
      case 'PENDING':
        return 'Pending';
      case 'UNDER_REVIEW':
        return 'Under Review';
      case 'APPROVED':
        return 'Approved';
      case 'REJECTED':
        return 'Rejected';
      case 'ESCALATED':
        return 'Escalated';
      default:
        return status;
    }
  };

  return (
    <Chip $status={status}>
      {getStatusLabel(status)}
    </Chip>
  );
};

export default StatusChip;
