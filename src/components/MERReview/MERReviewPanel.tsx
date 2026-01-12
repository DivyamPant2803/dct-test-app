import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { colors, borderRadius, shadows, spacing } from '../../styles/designTokens';
import { AttachmentReviewDecision, Evidence, FileAttachment } from '../../types/index';
import { getMERSubmissionData, submitMERReview, MERSubmissionReview, deputizeMERSubmission, escalateMERSubmission } from '../../services/merReviewService';
import TemplateDataDisplay from './TemplateDataDisplay';
import AttachmentReviewSection from './AttachmentReviewSection';
import DeputizeModal from './DeputizeModal';
import EscalateModal from './EscalateModal';
import FilePreviewModal from './FilePreviewModal';
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
  width: 98%;
  max-width: 1800px;
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

const SplitViewContainer = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 0;
  flex: 1;
  overflow: hidden;
  border-top: 1px solid ${colors.neutral.gray200};
`;

const LeftPanel = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-right: 1px solid ${colors.neutral.gray200};
`;

const RightPanel = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: ${colors.background.paper};
`;

const PanelHeader = styled.div`
  padding: ${spacing.md} ${spacing.lg};
  background: ${colors.background.paper};
  border-bottom: 1px solid ${colors.neutral.gray200};
  font-weight: 600;
  font-size: 0.95rem;
  color: ${colors.text.primary};
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
`;

const PanelBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 8px;
  background: ${colors.status.underReview};
  color: white;
  border-radius: ${borderRadius.full};
  font-size: 0.75rem;
  font-weight: 600;
`;

const PanelContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${spacing.lg};
`;

const Footer = styled.div<{ $expanded: boolean }>`
  padding: ${spacing.lg} ${spacing.xl};
  border-top: 1px solid ${colors.neutral.gray200};
  background: ${colors.background.paper};
  transition: all 0.3s ease;
  max-height: ${props => props.$expanded ? '320px' : '100px'};
  overflow: visible;
`;

const ExpandedFooterContent = styled.div`
  margin-bottom: ${spacing.md};
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const FooterHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  margin-bottom: ${spacing.md};
  font-size: 1.1rem;
  font-weight: 600;
  color: ${colors.text.primary};
`;

const FooterIcon = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.$color}15;
  color: ${props => props.$color};
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

const ValidationError = styled.div`
  color: ${colors.semantic.error};
  font-size: 0.85rem;
  margin-top: ${spacing.xs};
  display: flex;
  align-items: center;
  gap: ${spacing.xs};
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
  const [attachmentDecisions, setAttachmentDecisions] = useState<Map<string, AttachmentReviewDecision>>(new Map());
  const [submitting, setSubmitting] = useState(false);
  const [showDeputizeModal, setShowDeputizeModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [showEscalationTooltip, setShowEscalationTooltip] = useState(false);
  const [footerMode, setFooterMode] = useState<'actions' | 'approve' | 'reject'>('actions');
  const [actionComment, setActionComment] = useState('');
  const [validationError, setValidationError] = useState('');
  const [previewAttachment, setPreviewAttachment] = useState<FileAttachment | Evidence | null>(null);

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

  const handleActionClick = (action: 'approve' | 'reject') => {
    setFooterMode(action);
    setActionComment('');
    setValidationError('');
  };

  const handleBackToActions = () => {
    setFooterMode('actions');
    setActionComment('');
    setValidationError('');
  };

  const handleSubmitReview = async (decision: 'APPROVE' | 'REJECT') => {
    if (!reviewData) return;

    // Validate required comments for rejection
    if (decision === 'REJECT' && !actionComment.trim()) {
      setValidationError('Rejection reason is required');
      return;
    }

    setSubmitting(true);
    try {
      const decisions = Array.from(attachmentDecisions.values());
      await submitMERReview(transferId, decision, actionComment, decisions, reviewerType);
      
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
    setPreviewAttachment(attachment);
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

          <SplitViewContainer>
            <LeftPanel>
              <PanelHeader>
                Template Data
                <PanelBadge>{reviewData.sections.length}</PanelBadge>
              </PanelHeader>
              <PanelContent>
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
              </PanelContent>
            </LeftPanel>

            <RightPanel>
              <PanelHeader>
                Attachments
                <PanelBadge>{reviewData.templateAttachments.length + reviewData.supportingEvidence.length}</PanelBadge>
              </PanelHeader>
              <PanelContent>
                <AttachmentReviewSection
                  templateAttachments={reviewData.templateAttachments}
                  supportingEvidence={reviewData.supportingEvidence}
                  attachmentDecisions={attachmentDecisions}
                  onDecisionChange={handleAttachmentDecision}
                  onPreview={handlePreview}
                />
              </PanelContent>
            </RightPanel>
          </SplitViewContainer>

          <Footer $expanded={footerMode !== 'actions'}>
            {footerMode === 'actions' ? (
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
                  onClick={() => handleActionClick('reject')}
                  disabled={submitting}
                >
                  <FiX />
                  Reject
                </Button>
                <Button
                  $variant="approve"
                  onClick={() => handleActionClick('approve')}
                  disabled={submitting}
                >
                  <FiCheck />
                  Approve
                </Button>
              </ActionButtons>
            ) : footerMode === 'approve' ? (
              <ExpandedFooterContent>
                <FooterHeader>
                  <FooterIcon $color={colors.semantic.success}>
                    <FiCheck size={18} />
                  </FooterIcon>
                  Approve MER Submission
                </FooterHeader>
                <Label>Approval Comments (Optional)</Label>
                <TextArea
                  placeholder="Add any notes about your approval..."
                  value={actionComment}
                  onChange={(e) => setActionComment(e.target.value)}
                  rows={3}
                />
                <ActionButtons style={{ marginTop: spacing.md }}>
                  <Button $variant="secondary" onClick={handleBackToActions} disabled={submitting}>
                    ← Back
                  </Button>
                  <Button
                    $variant="approve"
                    onClick={() => handleSubmitReview('APPROVE')}
                    disabled={submitting}
                  >
                    <FiCheck />
                    Confirm Approval
                  </Button>
                </ActionButtons>
              </ExpandedFooterContent>
            ) : (
              <ExpandedFooterContent>
                <FooterHeader>
                  <FooterIcon $color={colors.semantic.error}>
                    <FiX size={18} />
                  </FooterIcon>
                  Reject MER Submission
                </FooterHeader>
                <Label>Rejection Reason (Required)*</Label>
                <TextArea
                  placeholder="Please explain why you're rejecting this submission..."
                  value={actionComment}
                  onChange={(e) => {
                    setActionComment(e.target.value);
                    setValidationError('');
                  }}
                  rows={3}
                  style={validationError ? { borderColor: colors.semantic.error } : {}}
                />
                {validationError && (
                  <ValidationError>
                    <FiAlertCircle size={14} />
                    {validationError}
                  </ValidationError>
                )}
                <ActionButtons style={{ marginTop: spacing.md }}>
                  <Button $variant="secondary" onClick={handleBackToActions} disabled={submitting}>
                    ← Back
                  </Button>
                  <Button
                    $variant="reject"
                    onClick={() => handleSubmitReview('REJECT')}
                    disabled={submitting}
                  >
                    <FiX />
                    Confirm Rejection
                  </Button>
                </ActionButtons>
              </ExpandedFooterContent>
            )}
          </Footer>
        </Panel>
      </Overlay>

      {showDeputizeModal && (
        <DeputizeModal
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

      {previewAttachment && (
        <FilePreviewModal
          attachment={previewAttachment}
          onClose={() => setPreviewAttachment(null)}
        />
      )}
    </>
  );
};

export default MERReviewPanel;
