import React from 'react';
import styled from 'styled-components';
import { Transfer } from '../../types/index';
import { colors, borderRadius, shadows, spacing } from '../../styles/designTokens';
import { FiX, FiCheckCircle, FiXCircle, FiClock, FiFileText } from 'react-icons/fi';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: ${spacing.xl};
`;

const Modal = styled.div`
  background: ${colors.background.paper};
  border-radius: ${borderRadius.lg};
  box-shadow: ${shadows.lg};
  width: 90%;
  max-width: 700px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Header = styled.div`
  padding: ${spacing.xl};
  border-bottom: 1px solid ${colors.neutral.gray200};
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${colors.text.primary};
  margin: 0;
`;

const Subtitle = styled.div`
  font-size: 0.9rem;
  color: ${colors.text.secondary};
  margin-top: ${spacing.xs};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${colors.text.secondary};
  cursor: pointer;
  padding: ${spacing.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${borderRadius.base};
  transition: all 0.2s ease;

  &:hover {
    background: ${colors.neutral.gray100};
    color: ${colors.text.primary};
  }
`;

const Content = styled.div`
  padding: ${spacing.xl};
  overflow-y: auto;
  flex: 1;
`;

const Section = styled.div`
  margin-bottom: ${spacing.xl};
`;

const SectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: ${colors.text.primary};
  margin: 0 0 ${spacing.md} 0;
`;

const StatusBadge = styled.div<{ $status: 'APPROVED' | 'REJECTED' | 'PENDING' | 'UNDER_REVIEW' }>`
  display: inline-flex;
  align-items: center;
  gap: ${spacing.xs};
  padding: ${spacing.sm} ${spacing.md};
  border-radius: ${borderRadius.full};
  font-size: 0.9rem;
  font-weight: 600;
  ${props => {
    switch (props.$status) {
      case 'APPROVED':
        return `
          background: ${colors.semantic.success}20;
          color: ${colors.semantic.success};
        `;
      case 'REJECTED':
        return `
          background: ${colors.semantic.error}20;
          color: ${colors.semantic.error};
        `;
      case 'UNDER_REVIEW':
        return `
          background: ${colors.status.underReview}20;
          color: ${colors.status.underReview};
        `;
      default:
        return `
          background: ${colors.neutral.gray200};
          color: ${colors.text.secondary};
        `;
    }
  }}
`;

const CommentsBox = styled.div`
  background: ${colors.neutral.gray50};
  border: 1px solid ${colors.neutral.gray200};
  border-radius: ${borderRadius.base};
  padding: ${spacing.md};
  font-size: 0.9rem;
  color: ${colors.text.primary};
  line-height: 1.5;
  white-space: pre-wrap;
`;

const AttachmentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.sm};
`;

const AttachmentItem = styled.div<{ $decision: 'APPROVED' | 'REJECTED' | 'PENDING' }>`
  background: ${props =>
    props.$decision === 'APPROVED' ? `${colors.semantic.success}10` :
    props.$decision === 'REJECTED' ? `${colors.semantic.error}10` :
    colors.background.paper
  };
  border: 1px solid ${props =>
    props.$decision === 'APPROVED' ? colors.semantic.success :
    props.$decision === 'REJECTED' ? colors.semantic.error :
    colors.neutral.gray200
  };
  border-radius: ${borderRadius.base};
  padding: ${spacing.md};
`;

const AttachmentHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${spacing.xs};
`;

const AttachmentName = styled.div`
  font-weight: 500;
  font-size: 0.9rem;
  color: ${colors.text.primary};
  display: flex;
  align-items: center;
  gap: ${spacing.xs};
`;

const AttachmentStatus = styled.div<{ $status: 'APPROVED' | 'REJECTED' | 'PENDING' }>`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  color: ${props =>
    props.$status === 'APPROVED' ? colors.semantic.success :
    props.$status === 'REJECTED' ? colors.semantic.error :
    colors.text.secondary
  };
`;

const AttachmentComment = styled.div`
  font-size: 0.8rem;
  color: ${colors.text.secondary};
  margin-top: ${spacing.xs};
  font-style: italic;
`;

const Timeline = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.md};
`;

const TimelineItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${spacing.md};
`;

const TimelineDot = styled.div<{ $completed: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.$completed ? colors.semantic.success : colors.neutral.gray300};
  margin-top: 4px;
  flex-shrink: 0;
`;

const TimelineContent = styled.div`
  flex: 1;
`;

const TimelineLabel = styled.div`
  font-weight: 500;
  font-size: 0.9rem;
  color: ${colors.text.primary};
`;

const TimelineDate = styled.div`
  font-size: 0.8rem;
  color: ${colors.text.secondary};
  margin-top: 2px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${spacing.xl};
  color: ${colors.text.secondary};
  font-size: 0.9rem;
`;

interface MERReviewDetailModalProps {
  transfer: Transfer;
  onClose: () => void;
}

const MERReviewDetailModal: React.FC<MERReviewDetailModalProps> = ({
  transfer,
  onClose,
}) => {
  const reviewData = transfer.reviewData;

  if (!reviewData) {
    return (
      <Overlay onClick={onClose}>
        <Modal onClick={(e) => e.stopPropagation()}>
          <Header>
            <div>
              <Title>Review Status</Title>
            </div>
            <CloseButton onClick={onClose}>
              <FiX size={24} />
            </CloseButton>
          </Header>
          <Content>
            <EmptyState>
              <FiClock size={48} style={{ marginBottom: spacing.md }} />
              <div>This MER submission is pending review.</div>
            </EmptyState>
          </Content>
        </Modal>
      </Overlay>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED': return <FiCheckCircle />;
      case 'REJECTED': return <FiXCircle />;
      case 'UNDER_REVIEW': return <FiClock />;
      default: return <FiFileText />;
    }
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <div>
            <Title>MER Review Status</Title>
            <Subtitle>Transfer ID: {transfer.id}</Subtitle>
          </div>
          <CloseButton onClick={onClose}>
            <FiX size={24} />
          </CloseButton>
        </Header>

        <Content>
          {/* Overall Status */}
          <Section>
            <SectionTitle>Overall Status</SectionTitle>
            <StatusBadge $status={reviewData.overallDecision}>
              {getStatusIcon(reviewData.overallDecision)}
              {reviewData.overallDecision.replace('_', ' ')}
            </StatusBadge>
          </Section>

          {/* Admin Comments */}
          {reviewData.adminComments && (
            <Section>
              <SectionTitle>Reviewer Comments</SectionTitle>
              <CommentsBox>{reviewData.adminComments}</CommentsBox>
            </Section>
          )}

          {/* Attachments Review */}
          {reviewData.attachmentDecisions && reviewData.attachmentDecisions.length > 0 && (
            <Section>
              <SectionTitle>Attachments Review ({reviewData.attachmentDecisions.length})</SectionTitle>
              <AttachmentList>
                {reviewData.attachmentDecisions.map((attachment, idx) => (
                  <AttachmentItem key={idx} $decision={attachment.decision}>
                    <AttachmentHeader>
                      <AttachmentName>
                        📄 {attachment.attachmentName}
                      </AttachmentName>
                      <AttachmentStatus $status={attachment.decision}>
                        {attachment.decision === 'APPROVED' && <><FiCheckCircle size={12} /> Approved</>}
                        {attachment.decision === 'REJECTED' && <><FiXCircle size={12} /> Rejected</>}
                        {attachment.decision === 'PENDING' && <><FiClock size={12} /> Pending</>}
                      </AttachmentStatus>
                    </AttachmentHeader>
                    {attachment.comments && (
                      <AttachmentComment>"{attachment.comments}"</AttachmentComment>
                    )}
                  </AttachmentItem>
                ))}
              </AttachmentList>
            </Section>
          )}

          {/* Timeline */}
          <Section>
            <SectionTitle>Review Timeline</SectionTitle>
            <Timeline>
              <TimelineItem>
                <TimelineDot $completed={true} />
                <TimelineContent>
                  <TimelineLabel>Submitted</TimelineLabel>
                  <TimelineDate>{new Date(transfer.createdAt).toLocaleString()}</TimelineDate>
                </TimelineContent>
              </TimelineItem>

              {reviewData.overallDecision !== 'PENDING' && reviewData.reviewedAt && (
                <>
                  <TimelineItem>
                    <TimelineDot $completed={true} />
                    <TimelineContent>
                      <TimelineLabel>Under Review</TimelineLabel>
                      <TimelineDate>Reviewed by {reviewData.reviewedBy || 'Admin'}</TimelineDate>
                    </TimelineContent>
                  </TimelineItem>

                  <TimelineItem>
                    <TimelineDot $completed={reviewData.overallDecision === 'APPROVED' || reviewData.overallDecision === 'REJECTED'} />
                    <TimelineContent>
                      <TimelineLabel>
                        {reviewData.overallDecision === 'APPROVED' ? 'Approved' : 'Completed'}
                      </TimelineLabel>
                      <TimelineDate>{new Date(reviewData.reviewedAt).toLocaleString()}</TimelineDate>
                    </TimelineContent>
                  </TimelineItem>
                </>
              )}
            </Timeline>
          </Section>
        </Content>
      </Modal>
    </Overlay>
  );
};

export default MERReviewDetailModal;
