import React from 'react';
import styled from 'styled-components';
import { 
  FiClock, 
  FiRefreshCw, 
  FiCheckCircle, 
  FiXCircle, 
  FiAlertTriangle,
  FiEdit 
} from 'react-icons/fi';
import { RequirementStatus } from '../../types/index';
import { colors, transitions } from '../../styles/designTokens';

interface StatusBadgeProps {
  status: RequirementStatus | 'DRAFT';
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const Badge = styled.span<{ $status: string; $size: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: ${props => {
    switch (props.$size) {
      case 'sm': return '0.25rem 0.5rem';
      case 'lg': return '0.5rem 1rem';
      default: return '0.375rem 0.75rem';
    }
  }};
  border-radius: ${props => {
    switch (props.$size) {
      case 'sm': return '4px';
      case 'lg': return '8px';
      default: return '6px';
    }
  }};
  font-weight: 500;
  font-size: ${props => {
    switch (props.$size) {
      case 'sm': return '0.75rem';
      case 'lg': return '1rem';
      default: return '0.875rem';
    }
  }};
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
      case 'DRAFT':
        return colors.status.draft;
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

const IconWrapper = styled.span<{ $status: string }>`
  display: inline-flex;
  align-items: center;
  
  ${props => props.$status === 'UNDER_REVIEW' && `
    animation: spin 2s linear infinite;
  `}
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const getStatusIcon = (status: RequirementStatus | 'DRAFT', showIcon?: boolean) => {
  if (!showIcon) return null;
  
  const iconProps = { size: 16 };
  
  switch (status) {
    case 'PENDING':
      return <FiClock {...iconProps} />;
    case 'UNDER_REVIEW':
      return <FiRefreshCw {...iconProps} />;
    case 'APPROVED':
      return <FiCheckCircle {...iconProps} />;
    case 'REJECTED':
      return <FiXCircle {...iconProps} />;
    case 'ESCALATED':
      return <FiAlertTriangle {...iconProps} />;
    case 'DRAFT':
      return <FiEdit {...iconProps} />;
    default:
      return null;
  }
};

const getStatusLabel = (status: RequirementStatus | 'DRAFT'): string => {
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
    case 'DRAFT':
      return 'Draft';
    default:
      return status;
  }
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  showIcon = false,
  size = 'md'
}) => {
  const icon = getStatusIcon(status, showIcon);
  
  return (
    <Badge $status={status} $size={size}>
      {icon && (
        <IconWrapper $status={status}>
          {icon}
        </IconWrapper>
      )}
      <span>{getStatusLabel(status)}</span>
    </Badge>
  );
};


