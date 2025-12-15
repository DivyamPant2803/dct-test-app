import React from 'react';
import styled from 'styled-components';
import { RequirementStatus } from '../types/index';
import { colors, borderRadius, transitions } from '../styles/designTokens';

const Chip = styled.span<{ $status: RequirementStatus }>`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: ${borderRadius.base};
  font-weight: 500;
  font-size: 0.8rem;
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all ${transitions.base};
  
  background-color: ${props => {
    switch (props.$status) {
      case 'PENDING':
        return colors.status.pending;
      case 'UNDER_REVIEW':
        return colors.status.underReview;
      case 'APPROVED':
        return colors.status.approved;
      case 'REJECTED':
        return colors.status.rejected;
      case 'ESCALATED':
        return colors.status.escalated;
      default:
        return colors.neutral.gray500;
    }
  }};
  
  color: white;
  
  ${props => (props.$status === 'PENDING' || props.$status === 'UNDER_REVIEW') && `
    animation: subtlePulse 2s infinite;
  `}
  
  @keyframes subtlePulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.85; }
  }
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
