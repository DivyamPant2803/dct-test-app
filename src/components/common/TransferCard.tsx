import React, { useState } from 'react';
import styled from 'styled-components';
import { Transfer } from '../../types/index';
import { StatusStepper, StatusStep } from './StatusStepper';
import { StatusBadge } from './StatusBadge';
import { FiChevronDown, FiEye, FiDownload, FiLayers } from 'react-icons/fi';
import { colors, borderRadius, shadows, spacing, transitions } from '../../styles/designTokens';

interface TransferCardProps {
  transfer: Transfer;
  onClick?: () => void;
  showTimeline?: boolean;
}

const Card = styled.div`
  background: ${colors.background.paper};
  border-radius: ${borderRadius.lg};
  box-shadow: ${shadows.base};
  padding: ${spacing.xl};
  margin-bottom: ${spacing.lg};
  transition: all ${transitions.base};
  cursor: pointer;
  border: 1px solid ${colors.neutral.gray300};
  
  &:hover {
    box-shadow: ${shadows.md};
    transform: translateY(-2px);
    border-color: ${colors.status.underReview};
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${spacing.lg};
`;

const TransferInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const TransferTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${colors.text.primary};
  margin-bottom: ${spacing.sm};
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
`;

const TransferIcon = styled.div`
  color: ${colors.status.underReview};
  flex-shrink: 0;
`;

const TransferMeta = styled.div`
  display: flex;
  gap: ${spacing.base};
  font-size: 0.85rem;
  color: ${colors.text.secondary};
  margin-top: ${spacing.sm};
  flex-wrap: wrap;
`;

const MetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const Actions = styled.div`
  display: flex;
  gap: ${spacing.sm};
  flex-shrink: 0;
`;

const ActionButton = styled.button`
  padding: ${spacing.sm};
  border: none;
  background: ${colors.background.hover};
  border-radius: ${borderRadius.base};
  cursor: pointer;
  transition: all ${transitions.base};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.text.secondary};
  
  &:hover {
    background: ${colors.neutral.gray300};
    color: ${colors.text.primary};
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:focus {
    outline: 2px solid ${colors.status.underReview};
    outline-offset: 2px;
  }
`;

const DetailsPanel = styled.div<{ $expanded: boolean }>`
  max-height: ${props => props.$expanded ? '500px' : '0'};
  overflow: hidden;
  transition: max-height ${transitions.slow} ease;
  margin-top: ${spacing.lg};
  padding-top: ${props => props.$expanded ? spacing.lg : '0'};
  border-top: ${props => props.$expanded ? `1px solid ${colors.neutral.gray300}` : 'none'};
  opacity: ${props => props.$expanded ? 1 : 0};
  transition: max-height ${transitions.slow}, opacity ${transitions.base}, padding-top ${transitions.slow};
`;

const TimelineWrapper = styled.div`
  margin-top: ${spacing.lg};
  padding-top: ${spacing.lg};
  border-top: 1px solid ${colors.neutral.gray300};
`;

export const TransferCard: React.FC<TransferCardProps> = ({ 
  transfer, 
  onClick,
  showTimeline = true
}) => {
  const [expanded, setExpanded] = useState(false);
  
  // Determine actual status from transfer requirements and evidence
  const getActualStatus = (): 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'ESCALATED' => {
    // Check if transfer is escalated
    if (transfer.escalatedTo || transfer.escalatedAt) {
      return 'ESCALATED';
    }
    
    // Check requirements status
    if (transfer.requirements && transfer.requirements.length > 0) {
      const allApproved = transfer.requirements.every(req => req.status === 'APPROVED');
      const hasRejected = transfer.requirements.some(req => req.status === 'REJECTED');
      const hasEscalated = transfer.requirements.some(req => req.status === 'ESCALATED');
      const hasUnderReview = transfer.requirements.some(req => req.status === 'UNDER_REVIEW');
      
      if (hasEscalated) return 'ESCALATED';
      if (hasRejected) return 'REJECTED';
      if (allApproved) return 'APPROVED';
      if (hasUnderReview) return 'UNDER_REVIEW';
      return 'PENDING';
    }
    
    // Fallback to transfer status
    if (transfer.status === 'COMPLETED') return 'APPROVED';
    if (transfer.status === 'ACTIVE') return 'UNDER_REVIEW';
    return 'PENDING';
  };
  
  // Determine status steps based on transfer status
  const getStatusSteps = (): StatusStep[] => {
    const actualStatus = getActualStatus();
    const steps: StatusStep[] = [
      {
        id: 'submitted',
        label: 'Submitted',
        completed: true,
        current: false,
        date: new Date(transfer.createdAt).toLocaleDateString(),
      },
    ];

    if (actualStatus === 'PENDING' || actualStatus === 'UNDER_REVIEW') {
      steps.push({
        id: 'review',
        label: 'Under Review',
        completed: actualStatus === 'UNDER_REVIEW',
        current: actualStatus === 'UNDER_REVIEW' || actualStatus === 'PENDING',
      });
    } else if (actualStatus === 'APPROVED') {
      steps.push({
        id: 'review',
        label: 'Under Review',
        completed: true,
        current: false,
      });
      steps.push({
        id: 'approved',
        label: 'Approved',
        completed: true,
        current: false,
      });
    } else if (actualStatus === 'REJECTED') {
      steps.push({
        id: 'review',
        label: 'Under Review',
        completed: true,
        current: false,
      });
      steps.push({
        id: 'rejected',
        label: 'Rejected',
        completed: true,
        current: false,
      });
    } else if (actualStatus === 'ESCALATED') {
      steps.push({
        id: 'review',
        label: 'Under Review',
        completed: true,
        current: false,
      });
      steps.push({
        id: 'escalated',
        label: 'Escalated',
        completed: true,
        current: false,
      });
    }

    return steps;
  };
  
  const statusSteps = getStatusSteps();
  const actualStatus = getActualStatus();
  
  return (
    <Card onClick={onClick}>
      <CardHeader>
        <TransferInfo>
          <TransferTitle>
            <TransferIcon>
              <FiLayers size={20} />
            </TransferIcon>
            {transfer.name}
          </TransferTitle>
          <div style={{ marginTop: spacing.sm }}>
            <StatusBadge 
              status={actualStatus} 
              showIcon 
            />
          </div>
          <TransferMeta>
            <MetaItem>ID: {transfer.id}</MetaItem>
            <MetaItem>•</MetaItem>
            <MetaItem>{transfer.jurisdiction}</MetaItem>
            <MetaItem>•</MetaItem>
            <MetaItem>{transfer.entity}</MetaItem>
            <MetaItem>•</MetaItem>
            <MetaItem>{new Date(transfer.createdAt).toLocaleDateString()}</MetaItem>
          </TransferMeta>
        </TransferInfo>
        <Actions>
          <ActionButton 
            title="View Details"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
          >
            <FiEye size={18} />
          </ActionButton>
          <ActionButton 
            title="Download"
            onClick={(e) => {
              e.stopPropagation();
              // Handle download
            }}
          >
            <FiDownload size={18} />
          </ActionButton>
          <ActionButton 
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            title={expanded ? 'Collapse' : 'Expand'}
          >
            <FiChevronDown 
              size={18} 
              style={{ 
                transform: expanded ? 'rotate(180deg)' : 'none', 
                transition: 'transform 0.2s' 
              }} 
            />
          </ActionButton>
        </Actions>
      </CardHeader>
      
      {showTimeline && statusSteps.length > 0 && (
        <TimelineWrapper>
          <StatusStepper steps={statusSteps} orientation="horizontal" />
        </TimelineWrapper>
      )}
      
      <DetailsPanel $expanded={expanded}>
        <div style={{ padding: spacing.base }}>
          <h4 style={{ marginBottom: spacing.sm, color: colors.text.primary }}>Transfer Details</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: spacing.base, fontSize: '0.875rem' }}>
            <div>
              <strong>Subject Type:</strong> {transfer.subjectType}
            </div>
            <div>
              <strong>Requirements:</strong> {transfer.requirements?.length || 0}
            </div>
            {transfer.escalatedAt && (
              <div>
                <strong>Escalated:</strong> {new Date(transfer.escalatedAt).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      </DetailsPanel>
    </Card>
  );
};

