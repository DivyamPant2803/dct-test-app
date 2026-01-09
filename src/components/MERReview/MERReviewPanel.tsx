import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { colors, borderRadius, shadows, spacing } from '../../styles/designTokens';
import { AttachmentReviewDecision, Evidence, FileAttachment } from '../../types/index';
import { getMERSubmissionData, submitMERReview, MERSubmissionReview, deputizeMERSubmission, escalateMERSubmission } from '../../services/merReviewService';
import { useEvidenceApi } from '../../hooks/useEvidenceApi';
import TemplateDataDisplay from './TemplateDataDisplay';
import AttachmentReviewSection from './AttachmentReviewSection';
import DeputizeModal from './DeputizeModal';
import EscalateModal from './EscalateModal';
import { FiX, FiCheck, FiAlertCircle, FiUsers, FiExternalLink, FiAlertTriangle } from 'react-icons/fi';

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

const Panel = styled.div`
  background: ${colors.background.default};
  border-radius: ${borderRadius.lg};
  box-shadow: ${shadows.lg};
  width: 95%;
  max-width: 1400px;
  height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Header = styled.div`
  padding: ${spacing.lg} ${spacing.xl};
  border-bottom: 1px solid ${colors.neutral.gray200};
  background: ${colors.background.paper};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${colors.text.primary};
  margin: 0;
`;

const Subtitle = styled.div`
  font-size: 0.85rem;
  color: ${colors.text.secondary};
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: ${spacing.md};
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

const ComplexityBanner = styled.div`
  background: ${colors.status.underReview}15;
  border: 1px solid ${colors.status.underReview};
  border-radius: ${borderRadius.base};
  padding: ${spacing.md} ${spacing.lg};
  margin: ${spacing.md} ${spacing.xl};
  display: flex;
  align-items: center;
  gap: ${spacing.md};
  font-size: 0.9rem;
  color: ${colors.text.primary};
`;

const BannerButton = styled.button`
  margin-left: auto;
  padding: ${spacing.xs} ${spacing.md};
  background: ${colors.neutral.black};
  color: white;
  border: none;
  border-radius: ${borderRadius.base};
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${spacing.xs};
  transition: all 0.2s ease;

  &:hover {
    background: ${colors.neutral.gray800};
  }
`;

const EscalationBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${spacing.xs};
  padding: ${spacing.xs} ${spacing.sm};
  background: ${colors.neutral.gray100};
  border: 1px solid ${colors.neutral.gray300};
  border-radius: ${borderRadius.full};
  font-size: 0.75rem;
  color: ${colors.text.secondary};
  cursor: help;
  position: relative;
  transition: all 0.2s ease;

  &:hover {
    background: ${colors.neutral.gray200};
    border-color: ${colors.neutral.gray400};
  }
`;

const EscalationTooltip = styled.div<{ $show: boolean }>`
  position: absolute;
  top: calc(100% + ${spacing.xs});
  left: 0;
  min-width: 300px;
  background: white;
  border: 1px solid ${colors.neutral.gray300};
  border-radius: ${borderRadius.base};
  padding: ${spacing.md};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  display: ${props => props.$show ? 'block' : 'none'};
`;

const TooltipHeader = styled.div`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${colors.text.primary};
  margin-bottom: ${spacing.xs};
  padding-bottom: ${spacing.xs};
  border-bottom: 1px solid ${colors.neutral.gray200};
`;

const TooltipContent = styled.div`
  font-size: 0.75rem;
  color: ${colors.text.secondary};
  margin-bottom: ${spacing.sm};
`;

const TooltipTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing.xs};
  margin-top: ${spacing.sm};
`;

const TooltipTag = styled.span`
  padding: 2px ${spacing.xs};
  background: ${colors.neutral.gray100};
  border: 1px solid ${colors.neutral.gray300};
  border-radius: ${borderRadius.base};
  font-size: 0.7rem;
  color: ${colors.text.primary};
`;

const TabBar = styled.div`
  display: flex;
  gap: ${spacing.xs};
  padding: 0 ${spacing.xl};
  background: ${colors.background.paper};
  border-bottom: 2px solid ${colors.neutral.gray200};
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: ${spacing.md} ${spacing.lg};
  border: none;
  background: ${props => props.$active ? colors.background.default : 'transparent'};
  color: ${props => props.$active ? colors.text.primary : colors.text.secondary};
  font-weight: ${props => props.$active ? '600' : '500'};
  font-size: 0.95rem;
  cursor: pointer;
  border-bottom: 3px solid ${props => props.$active ? colors.neutral.black : 'transparent'};
  transition: all 0.2s ease;
  position: relative;
  top: 2px;

  &:hover {
    background: ${colors.neutral.gray50};
    color: ${colors.text.primary};
  }
`;

const TabBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: ${spacing.sm};
  padding: 2px 8px;
  background: ${colors.status.underReview};
  color: white;
  border-radius: ${borderRadius.full};
  font-size: 0.75rem;
  font-weight: 600;
`;

const Content = styled.div`
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const TabContent = styled.div`
  flex: 1;
  overflow-y: auto;
  background: ${colors.background.default};
`;

const Footer = styled.div`
  padding: ${spacing.lg} ${spacing.xl};
  border-top: 1px solid ${colors.neutral.gray200};
  background: ${colors.background.paper};
`;

const CommentSection = styled.div`
  margin-bottom: ${spacing.md};
`;

const Label = styled.label`
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: ${colors.text.primary};
  margin-bottom: ${spacing.sm};
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: ${spacing.md};
  border: 1px solid ${colors.neutral.gray300};
  border-radius: ${borderRadius.base};
  font-size: 0.9rem;
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${colors.status.underReview};
    box-shadow: 0 0 0 3px ${colors.status.underReview}15;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${spacing.md};
  justify-content: flex-end;
`;

const Button = styled.button<{ $variant?: 'approve' | 'reject' | 'secondary' | 'deputize' }>`
  padding: ${spacing.md} ${spacing.xl};
  border-radius: ${borderRadius.base};
  border: 1px solid ${props => {
    switch (props.$variant) {
      case 'approve': return colors.semantic.success;
      case 'reject': return colors.semantic.error;
      case 'deputize': return colors.status.escalated;
      default: return colors.neutral.gray300;
    }
  }};
  background: ${props => {
    switch (props.$variant) {
      case 'approve': return colors.semantic.success;
      case 'reject': return colors.semantic.error;
      case 'deputize': return colors.status.escalated;
      default: return colors.background.paper;
    }
  }};
  color: ${props => 
    props.$variant === 'approve' || props.$variant === 'reject' || props.$variant === 'deputize'
      ? colors.neutral.white
      : colors.text.primary
  };
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: ${shadows.sm};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 1rem;
  color: ${colors.text.secondary};
`;

interface MERReviewPanelProps {
  transferId: string;
  reviewerType: 'Admin' | 'Legal';
  onClose: () => void;
  onReviewComplete: () => void;
}

const MERReviewPanel: React.FC<MERReviewPanelProps> = ({
  transferId,
  reviewerType,
  onClose,
  onReviewComplete,
}) => {
  const [reviewData, setReviewData] = useState<MERSubmissionReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminComments, setAdminComments] = useState('');
  const [attachmentDecisions, setAttachmentDecisions] = useState<Map<string, AttachmentReviewDecision>>(new Map());
  const [submitting, setSubmitting] = useState(false);
  const [showDeputizeModal, setShowDeputizeModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'template' | 'attachments'>('template');
  const [showEscalationTooltip, setShowEscalationTooltip] = useState(false);
  const { previewEvidence } = useEvidenceApi();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await getMERSubmissionData(transferId);
      setReviewData(data);
      setLoading(false);
    };

    loadData();
  }, [transferId]);

  const shouldUseFullPage = useMemo(() => {
    if (!reviewData) return false;
    const sectionCount = reviewData.sections.length;
    const totalFields = reviewData.sections.reduce((sum, s) => sum + s.fields.length, 0);
    const totalAttachments = reviewData.templateAttachments.length + reviewData.supportingEvidence.length;

    return sectionCount > 10 || totalFields > 50 || totalAttachments > 15;
  }, [reviewData]);

  const handleAttachmentDecision = (attachmentId: string, decision: 'APPROVE' | 'REJECT' | null, note?: string) => {
    setAttachmentDecisions(prev => {
      const next = new Map(prev);
      if (decision === null) {
        next.delete(attachmentId);
      } else {
        // Determine attachment type
        const isTemplate = reviewData?.templateAttachments.some(a => a.id === attachmentId);
        next.set(attachmentId, {
          attachmentId,
          attachmentType: isTemplate ? 'template' : 'evidence',
          decision,
          note,
        });
      }
      return next;
    });
  };

  const handleSubmitReview = async (decision: 'APPROVE' | 'REJECT') => {
    if (!reviewData) return;

    setSubmitting(true);
    try {
      const decisions = Array.from(attachmentDecisions.values());
      await submitMERReview(transferId, decision, adminComments, decisions, reviewerType);
      
      onReviewComplete();
      onClose();
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeputize = async (deputyId: string, deputyName: string) => {
    setSubmitting(true);
    try {
      const deputyType = deputyId.includes('legal') ? 'Deputy-Legal' : 'Deputy-Business';
      await deputizeMERSubmission(transferId, deputyId, deputyType, reviewerType === 'Admin' ? 'current-admin' : 'current-legal');
      
      setShowDeputizeModal(false);
      onReviewComplete();
      onClose();
      alert(`Successfully deputized to ${deputyName}`);
    } catch (error) {
      console.error('Error deputizing:', error);
      alert('Failed to deputize submission. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEscalate = async (escalateTo: 'Legal' | 'Business', reason: string) => {
    setSubmitting(true);
    try {
      await escalateMERSubmission(transferId, escalateTo, reason, 'current-admin');
      
      setShowEscalateModal(false);
      onReviewComplete();
      onClose();
      alert(`Successfully escalated to ${escalateTo} team`);
    } catch (error) {
      console.error('Error escalating:', error);
      alert('Failed to escalate submission. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePreview = (attachment: FileAttachment | Evidence) => {
    // Check if it's an Evidence object
    if ('base64Data' in attachment && attachment.base64Data) {
      previewEvidence(attachment as Evidence);
    } else if ('base64Data' in attachment && (attachment as FileAttachment).base64Data) {
      // For FileAttachment, create a temporary preview
      const fileAttachment = attachment as FileAttachment;
      if (fileAttachment.base64Data) {
        const blob = dataURLtoBlob(fileAttachment.base64Data);
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      }
    }
  };

  const dataURLtoBlob = (dataURL: string): Blob => {
    const arr = dataURL.split(',');
    const match = arr[0].match(/:(.*?);/);
    const mime = match ? match[1] : 'application/octet-stream';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  if (loading) {
    return (
      <Overlay onClick={onClose}>
        <Panel onClick={(e) => e.stopPropagation()}>
          <LoadingState>Loading MER submission...</LoadingState>
        </Panel>
      </Overlay>
    );
  }

  if (!reviewData || !reviewData.template) {
    return (
      <Overlay onClick={onClose}>
        <Panel onClick={(e) => e.stopPropagation()}>
          <LoadingState>Failed to load MER submission data</LoadingState>
        </Panel>
      </Overlay>
    );
  }

  return (
    <>
      <Overlay onClick={onClose}>
        <Panel onClick={(e) => e.stopPropagation()}>
          <Header>
            <div>
              <Title>Review MER Submission: {reviewData.template.name}</Title>
              <Subtitle>
                Transfer ID: {reviewData.transfer.id} • {reviewData.transfer.jurisdiction}
                {reviewData.escalationInfo && (
                  <EscalationBadge
                    onMouseEnter={() => setShowEscalationTooltip(true)}
                    onMouseLeave={() => setShowEscalationTooltip(false)}
                  >
                    <FiAlertCircle size={12} />
                    Escalated by {reviewData.escalationInfo.escalatedBy}
                    <EscalationTooltip $show={showEscalationTooltip}>
                      <TooltipHeader>
                        Escalated on {new Date(reviewData.escalationInfo.escalatedAt).toLocaleDateString()}
                      </TooltipHeader>
                      <TooltipContent>
                        Escalated to {reviewData.escalationInfo.escalatedTo} Team
                      </TooltipContent>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>Reasons:</div>
                      <TooltipTags>
                        {reviewData.escalationInfo.reason.split('; ').map((tag, idx) => (
                          <TooltipTag key={idx}>{tag}</TooltipTag>
                        ))}
                      </TooltipTags>
                    </EscalationTooltip>
                  </EscalationBadge>
                )}
              </Subtitle>
            </div>
            <CloseButton onClick={onClose}>
              <FiX size={24} />
            </CloseButton>
          </Header>

          {shouldUseFullPage && (
            <ComplexityBanner>
              <FiAlertCircle size={20} />
              <span>This template is complex. For better experience, consider opening in full page view.</span>
              <BannerButton onClick={() => window.open(`/admin/mer-review/${transferId}`, '_blank')}>
                Open Full Page
                <FiExternalLink size={14} />
              </BannerButton>
            </ComplexityBanner>
          )}

          <TabBar>
            <Tab 
              $active={activeTab === 'template'}
              onClick={() => setActiveTab('template')}
            >
              Template Data
              <TabBadge>{reviewData.sections.length}</TabBadge>
            </Tab>
            <Tab 
              $active={activeTab === 'attachments'}
              onClick={() => setActiveTab('attachments')}
            >
              Attachments
              <TabBadge>{reviewData.templateAttachments.length + reviewData.supportingEvidence.length}</TabBadge>
            </Tab>
          </TabBar>

          <Content>
            {activeTab === 'template' ? (
              <TabContent>
                {(() => {
                  console.log('[MERReviewPanel] Rendering TemplateDataDisplay with:', {
                    sectionsCount: reviewData.sections.length,
                    filledDataKeys: Object.keys(reviewData.filledData),
                    tableDataKeys: reviewData.filledData.tableData ? Object.keys(reviewData.filledData.tableData) : [],
                    fileDataKeys: reviewData.filledData.fileData ? Object.keys(reviewData.filledData.fileData) : [],
                    sampleData: reviewData.filledData
                  });
                  return null;
                })()}
                <TemplateDataDisplay
                  sections={reviewData.sections}
                  filledData={reviewData.filledData}
                  tableData={reviewData.filledData.tableData}
                  fileData={reviewData.filledData.fileData}
                />
              </TabContent>
            ) : (
              <TabContent>
                <AttachmentReviewSection
                  templateAttachments={reviewData.templateAttachments}
                  supportingEvidence={reviewData.supportingEvidence}
                  attachmentDecisions={attachmentDecisions}
                  onDecisionChange={handleAttachmentDecision}
                  onPreview={handlePreview}
                />
              </TabContent>
            )}
          </Content>

          <Footer>
            <CommentSection>
              <Label>{reviewerType} Comments</Label>
              <TextArea
                placeholder="Add your review comments here..."
                value={adminComments}
                onChange={(e) => setAdminComments(e.target.value)}
              />
            </CommentSection>

            <ActionButtons>
              {reviewerType === 'Admin' && (
                <Button
                  $variant="deputize"
                  onClick={() => setShowEscalateModal(true)}
                  disabled={submitting}
                >
                  <FiAlertTriangle />
                  Escalate
                </Button>
              )}
              {reviewerType === 'Legal' && (
                <Button
                  $variant="deputize"
                  onClick={() => setShowDeputizeModal(true)}
                  disabled={submitting}
                >
                  <FiUsers />
                  Deputize
                </Button>
              )}
              <Button $variant="secondary" onClick={onClose} disabled={submitting}>
                Cancel
              </Button>
              <Button
                $variant="reject"
                onClick={() => handleSubmitReview('REJECT')}
                disabled={submitting}
              >
                <FiX />
                Reject
              </Button>
              <Button
                $variant="approve"
                onClick={() => handleSubmitReview('APPROVE')}
                disabled={submitting}
              >
                <FiCheck />
                Approve
              </Button>
            </ActionButtons>
          </Footer>
        </Panel>
      </Overlay>

      {showDeputizeModal && (
        <DeputizeModal
          transferId={transferId}
          onDeputize={handleDeputize}
          onClose={() => setShowDeputizeModal(false)}
        />
      )}

      {showEscalateModal && (
        <EscalateModal
          onEscalate={handleEscalate}
          onClose={() => setShowEscalateModal(false)}
        />
      )}
    </>
  );
};

export default MERReviewPanel;
