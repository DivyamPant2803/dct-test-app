import React from 'react';
import styled from 'styled-components';
import { Evidence } from '../../types/index';
import { colors, borderRadius, shadows, spacing } from '../../styles/designTokens';
import { FiUser, FiClock, FiAlertTriangle, FiFileText } from 'react-icons/fi';
import { StatusStepper, StatusStep } from './StatusStepper';

interface EscalationTimelineProps {
  evidence: Evidence;
}

const TimelineContainer = styled.div`
  background: ${colors.background.paper};
  border-radius: ${borderRadius.lg};
  padding: ${spacing.xl};
  box-shadow: ${shadows.base};
  margin-bottom: ${spacing.lg};
`;

const TimelineTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${colors.text.primary};
  margin-bottom: ${spacing.lg};
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
`;

const TimelineItem = styled.div`
  display: flex;
  gap: ${spacing.base};
  padding: ${spacing.base};
  border-left: 2px solid ${colors.neutral.gray300};
  margin-left: ${spacing.base};
  margin-bottom: ${spacing.base};
  position: relative;
  
  &:last-child {
    border-left: none;
  }
  
  &::before {
    content: '';
    position: absolute;
    left: -6px;
    top: ${spacing.base};
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: ${colors.status.escalated};
    border: 2px solid ${colors.background.paper};
  }
`;

const TimelineIcon = styled.div<{ $color: string }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.$color}20;
  color: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const TimelineContent = styled.div`
  flex: 1;
`;

const TimelineEvent = styled.div`
  font-weight: 600;
  color: ${colors.text.primary};
  margin-bottom: ${spacing.xs};
`;

const TimelineDetails = styled.div`
  font-size: 0.875rem;
  color: ${colors.text.secondary};
  margin-bottom: ${spacing.xs};
`;

const TimelineDate = styled.div`
  font-size: 0.75rem;
  color: ${colors.text.tertiary};
`;

const EscalationBanner = styled.div`
  background: ${colors.status.escalated}15;
  border-left: 4px solid ${colors.status.escalated};
  border-radius: ${borderRadius.base};
  padding: ${spacing.base};
  margin-bottom: ${spacing.lg};
`;

const EscalationTitle = styled.div`
  font-weight: 600;
  color: ${colors.status.escalated};
  margin-bottom: ${spacing.xs};
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
`;

const EscalationReason = styled.div`
  font-size: 0.875rem;
  color: ${colors.text.secondary};
  margin-top: ${spacing.xs};
`;

export const EscalationTimeline: React.FC<EscalationTimelineProps> = ({ evidence }) => {
  // Build timeline steps
  const timelineSteps: StatusStep[] = [
    {
      id: 'uploaded',
      label: 'Uploaded',
      completed: true,
      current: false,
      date: new Date(evidence.uploadedAt).toLocaleDateString(),
    },
  ];

  if (evidence.reviewedAt) {
    timelineSteps.push({
      id: 'reviewed',
      label: 'Admin Review',
      completed: true,
      current: false,
      date: new Date(evidence.reviewedAt).toLocaleDateString(),
    });
  }

  if (evidence.escalatedAt) {
    timelineSteps.push({
      id: 'escalated',
      label: 'Escalated',
      completed: true,
      current: false,
      date: new Date(evidence.escalatedAt).toLocaleDateString(),
    });
  }

  timelineSteps.push({
    id: 'legal',
    label: 'Legal Review',
    completed: evidence.status === 'APPROVED' || evidence.status === 'REJECTED',
    current: evidence.status === 'ESCALATED',
  });

  return (
    <TimelineContainer>
      {evidence.escalatedAt && (
        <EscalationBanner>
          <EscalationTitle>
            <FiAlertTriangle size={20} />
            Escalated to Legal Review
          </EscalationTitle>
          {evidence.escalationReason && (
            <EscalationReason>
              <strong>Reason:</strong> {evidence.escalationReason}
            </EscalationReason>
          )}
          {evidence.escalatedBy && (
            <EscalationReason>
              <strong>Escalated by:</strong> {evidence.escalatedBy} on {new Date(evidence.escalatedAt).toLocaleDateString()}
            </EscalationReason>
          )}
          {evidence.taggedAuthorities && evidence.taggedAuthorities.length > 0 && (
            <EscalationReason>
              <strong>Tagged Authorities:</strong> {evidence.taggedAuthorities.join(', ')}
            </EscalationReason>
          )}
        </EscalationBanner>
      )}

      <TimelineTitle>
        <FiClock />
        Escalation Timeline
      </TimelineTitle>

      <StatusStepper steps={timelineSteps} orientation="vertical" />

      {/* Detailed timeline events */}
      <div style={{ marginTop: spacing.lg }}>
        <TimelineItem>
          <TimelineIcon $color={colors.status.underReview}>
            <FiUser size={16} />
          </TimelineIcon>
          <TimelineContent>
            <TimelineEvent>Evidence Uploaded</TimelineEvent>
            <TimelineDetails>Uploaded by {evidence.uploadedBy}</TimelineDetails>
            <TimelineDate>{new Date(evidence.uploadedAt).toLocaleString()}</TimelineDate>
          </TimelineContent>
        </TimelineItem>

        {evidence.reviewedAt && (
          <TimelineItem>
            <TimelineIcon $color={colors.status.underReview}>
              <FiFileText size={16} />
            </TimelineIcon>
            <TimelineContent>
              <TimelineEvent>Admin Review</TimelineEvent>
              <TimelineDetails>
                Reviewed by {evidence.reviewerId || 'Admin'}
                {evidence.reviewerNote && ` - ${evidence.reviewerNote}`}
              </TimelineDetails>
              <TimelineDate>{new Date(evidence.reviewedAt).toLocaleString()}</TimelineDate>
            </TimelineContent>
          </TimelineItem>
        )}

        {evidence.escalatedAt && (
          <TimelineItem>
            <TimelineIcon $color={colors.status.escalated}>
              <FiAlertTriangle size={16} />
            </TimelineIcon>
            <TimelineContent>
              <TimelineEvent>Escalated to Legal</TimelineEvent>
              <TimelineDetails>
                Escalated by {evidence.escalatedBy || 'Admin'}
                {evidence.escalationReason && ` - ${evidence.escalationReason}`}
              </TimelineDetails>
              <TimelineDate>{new Date(evidence.escalatedAt).toLocaleString()}</TimelineDate>
            </TimelineContent>
          </TimelineItem>
        )}
      </div>
    </TimelineContainer>
  );
};


