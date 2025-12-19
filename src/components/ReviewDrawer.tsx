import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Evidence, ReviewDecision } from '../types/index';
import StatusChip from './StatusChip';
import StyledSelect from './common/StyledSelect';
import { AUTHORITY_CONFIGS } from '../config/personaConfig';
import { colors, borderRadius, shadows, spacing, transitions, typography } from '../styles/designTokens';
import { FiX, FiCheck, FiXCircle, FiArrowUp, FiFileText, FiInfo } from 'react-icons/fi';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${spacing.lg};
  animation: fadeIn 0.2s ease;
  backdrop-filter: blur(4px);
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const Drawer = styled.div`
  background: ${colors.background.paper};
  border-radius: ${borderRadius.lg};
  box-shadow: ${shadows.lg};
  width: 100%;
  max-width: 1400px;
  height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  
  @keyframes slideUp {
    from {
      transform: translateY(40px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const Header = styled.div`
  padding: ${spacing.md} ${spacing.xl};
  border-bottom: 1px solid ${colors.neutral.gray300};
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${colors.background.paper};
  flex-shrink: 0;
  height: 70px;
`;

const TitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.md};
`;

const Title = styled.h2`
  font-size: ${typography.fontSize.lg};
  font-weight: 600;
  color: ${colors.text.primary};
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${colors.text.secondary};
  padding: ${spacing.sm};
  border-radius: ${borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${transitions.base};
  
  &:hover {
    background: ${colors.neutral.gray100};
    color: ${colors.text.primary};
  }
`;

const Content = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  flex: 1;
  overflow: hidden;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr 350px;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr auto;
  }
`;

const PreviewColumn = styled.div`
  background: ${colors.neutral.gray50};
  position: relative;
  display: flex;
  flex-direction: column;
  border-right: 1px solid ${colors.neutral.gray300};
  overflow: hidden;
`;

const PreviewHeader = styled.div`
  padding: ${spacing.sm} ${spacing.lg};
  background: ${colors.background.paper};
  border-bottom: 1px solid ${colors.neutral.gray200};
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: ${typography.fontSize.sm};
  color: ${colors.text.secondary};
`;

const PreviewContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${spacing.xl};
  display: flex;
  align-items: center;
  justify-content: center;
  
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: ${colors.neutral.gray300};
    border-radius: 4px;
  }
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  background: ${colors.background.paper};
  height: 100%;
  overflow: hidden;
`;

const SidebarScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${spacing.lg};

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${colors.neutral.gray300};
    border-radius: 3px;
  }
`;

const SidebarFooter = styled.div`
  padding: ${spacing.lg};
  border-top: 1px solid ${colors.neutral.gray200};
  background: ${colors.background.paper};
  display: flex;
  flex-direction: column;
  gap: ${spacing.md};
  box-shadow: 0 -4px 12px rgba(0,0,0,0.02);
`;

const SectionTitle = styled.h4`
  margin: 0 0 ${spacing.md} 0;
  color: ${colors.text.primary};
  font-size: ${typography.fontSize.sm};
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
`;

const MetadataGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${spacing.md} ${spacing.lg};
  background: ${colors.neutral.gray50};
  padding: ${spacing.md};
  border-radius: ${borderRadius.base};
  border: 1px solid ${colors.neutral.gray200};
`;

const MetaItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const MetaLabel = styled.span`
  font-size: 0.7rem;
  color: ${colors.text.secondary};
  font-weight: 600;
  text-transform: uppercase;
`;

const MetaValue = styled.span`
  font-size: ${typography.fontSize.sm};
  color: ${colors.text.primary};
  font-weight: 500;
  word-break: break-word;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: ${spacing.md};
  border: 1px solid ${colors.neutral.gray300};
  border-radius: ${borderRadius.base};
  font-size: ${typography.fontSize.sm};
  font-family: inherit;
  resize: vertical;
  transition: all ${transitions.base};
  background: ${colors.background.paper};
  color: ${colors.text.primary};
  line-height: 1.5;

  &:focus {
    outline: none;
    border-color: ${colors.status.underReview};
    box-shadow: 0 0 0 3px ${colors.status.underReview}15;
  }

  &::placeholder {
    color: ${colors.text.tertiary};
  }
`;

const AuthoritySection = styled.div`
  border: 1px solid ${colors.neutral.gray200};
  border-radius: ${borderRadius.base};
  padding: ${spacing.md};
  background: ${colors.neutral.gray50};
`;

const AuthorityChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing.xs};
  margin-top: ${spacing.sm};
`;

const AuthorityChip = styled.button<{ $selected: boolean }>`
  padding: 4px 10px;
  border: 1px solid ${props => props.$selected ? colors.text.primary : colors.neutral.gray300};
  background: ${props => props.$selected ? colors.text.primary : colors.background.paper};
  color: ${props => props.$selected ? colors.neutral.white : colors.text.secondary};
  border-radius: ${borderRadius.full};
  font-size: ${typography.fontSize.xs};
  font-weight: 500;
  cursor: pointer;
  transition: all ${transitions.fast};

  &:hover {
    border-color: ${colors.text.primary};
    background: ${props => props.$selected ? colors.text.primary : colors.neutral.gray100};
  }
`;

const ButtonGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${spacing.md};
`;

const Button = styled.button<{ variant?: 'approve' | 'reject' | 'escalate' | 'secondary', fullWidth?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing.sm};
  padding: ${spacing.md};
  border-radius: ${borderRadius.base};
  width: ${props => props.fullWidth ? '100%' : 'auto'};
  border: 1px solid transparent;
  font-weight: 600;
  font-size: ${typography.fontSize.sm};
  cursor: pointer;
  transition: all ${transitions.base};
  
  ${props => {
    switch (props.variant) {
      case 'approve':
        return `
          background: ${colors.status.approved};
          color: white;
          &:hover:not(:disabled) { background: #43A047; }
        `;
      case 'reject':
        return `
          background: ${colors.status.rejected};
          color: white;
          &:hover:not(:disabled) { background: #E53935; }
        `;
      case 'escalate':
        return `
          background: ${colors.status.escalated};
          color: white;
          &:hover:not(:disabled) { background: #8E24AA; }
        `;
      default:
        return `
          background: ${colors.neutral.gray200};
          color: ${colors.text.primary};
          &:hover:not(:disabled) { background: ${colors.neutral.gray300}; }
        `;
    }
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const FileIcon = styled.div`
  font-size: 4rem;
  color: ${colors.neutral.gray400};
  margin-bottom: ${spacing.md};
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const EvidenceFilesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.sm};
`;

const EvidenceFileItem = styled.div<{ $isSelected: boolean }>`
  padding: ${spacing.md};
  background: ${props => props.$isSelected ? colors.status.underReview + '15' : colors.neutral.gray50};
  border: 1px solid ${props => props.$isSelected ? colors.status.underReview : colors.neutral.gray200};
  border-radius: ${borderRadius.base};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${spacing.sm};
  transition: all ${transitions.base};
  
  &:hover {
    border-color: ${colors.status.underReview};
    background: ${colors.status.underReview}10;
  }
`;

const FileItemInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const FileItemName = styled.div`
  font-size: ${typography.fontSize.sm};
  font-weight: 500;
  color: ${colors.text.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const FileItemMeta = styled.div`
  font-size: 0.75rem;
  color: ${colors.text.secondary};
  margin-top: 2px;
`;

const PreviewButton = styled.button`
  padding: ${spacing.xs} ${spacing.sm};
  background: ${colors.neutral.black};
  color: white;
  border: none;
  border-radius: ${borderRadius.sm};
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all ${transitions.base};
  white-space: nowrap;
  
  &:hover {
    background: ${colors.neutral.gray800};
  }
`;

interface ReviewDrawerProps {
  evidence: Evidence;
  allEvidence?: Evidence[]; // All evidence files for this transfer
  onClose: () => void;
  onDecision: (decision: ReviewDecision) => void;
  hideEscalateButton?: boolean;
}

const ReviewDrawer: React.FC<ReviewDrawerProps> = ({
  evidence,
  allEvidence,
  onClose,
  onDecision,
  hideEscalateButton = false
}) => {
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence>(evidence);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [escalationReason, setEscalationReason] = useState('');
  const [selectedAuthorities, setSelectedAuthorities] = useState<string[]>([]);
  const [canEscalate, setCanEscalate] = useState(false);

  // Update selected evidence when evidence prop changes
  useEffect(() => {
    setSelectedEvidence(evidence);
  }, [evidence]);

  useEffect(() => {
    const hasMinimumLength = comment.trim().length >= 10;
    const hasSelectedAuthorities = selectedAuthorities.length > 0;
    setCanEscalate(hasMinimumLength || hasSelectedAuthorities);
  }, [comment, selectedAuthorities]);

  const toggleAuthority = (authority: string) => {
    setSelectedAuthorities(prev => 
      prev.includes(authority) 
        ? prev.filter(a => a !== authority)
        : [...prev, authority]
    );
  };

  const handleDecision = async (decision: 'APPROVE' | 'REJECT' | 'ESCALATE') => {
    setIsSubmitting(true);
    try {
      await onDecision({
        evidenceId: selectedEvidence.id,
        decision,
        note: comment.trim() || undefined,
        ...(decision === 'ESCALATE' && {
          escalationReason,
          taggedAuthorities: selectedAuthorities,
          escalatedTo: selectedAuthorities[0] || 'Legal'
        })
      });
    } catch (error) {
      console.error('Failed to submit decision:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string): string => {
    switch (fileType) {
      case 'PDF': return '📄';
      case 'DOC': case 'DOCX': return '📝';
      case 'XLS': case 'XLSX': return '📊';
      default: return '📁';
    }
  };

  const base64ToBlob = (base64: string, mimeType: string): Blob => {
    const byteCharacters = atob(base64.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  };

  return (
    <Overlay onClick={onClose}>
      <Drawer onClick={(e) => e.stopPropagation()}>
        <Header>
          <TitleGroup>
            <Title>Review Evidence</Title>
            <StatusChip status={selectedEvidence.status} />
          </TitleGroup>
          <CloseButton onClick={onClose}>
            <FiX size={24} />
          </CloseButton>
        </Header>
        
        <Content>
          <PreviewColumn>
            <PreviewHeader>
              <span>{selectedEvidence.filename}</span>
              <div style={{ display: 'flex', gap: spacing.sm }}>
                {allEvidence && allEvidence.length > 1 && (
                  <span style={{ fontSize: '0.85rem', color: colors.text.secondary }}>
                    {allEvidence.findIndex(e => e.id === selectedEvidence.id) + 1} of {allEvidence.length}
                  </span>
                )}
              </div>
            </PreviewHeader>
            <PreviewContent>
              {selectedEvidence.base64Data ? (
                selectedEvidence.fileType === 'PDF' ? (
                  <iframe
                    src={evidence.base64Data}
                    width="100%"
                    height="100%"
                    style={{ border: 'none', background: 'white', borderRadius: '4px', boxShadow: shadows.sm }}
                    title={`Preview of ${evidence.filename}`}
                  />
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <FileIcon>{getFileIcon(evidence.fileType)}</FileIcon>
                    <div style={{ marginBottom: spacing.md, fontWeight: 500 }}>{evidence.filename}</div>
                    <Button 
                      variant="secondary"
                      onClick={() => {
                        const blob = base64ToBlob(evidence.base64Data!, `application/${evidence.fileType.toLowerCase()}`);
                        const url = URL.createObjectURL(blob);
                        window.open(url, '_blank');
                        setTimeout(() => URL.revokeObjectURL(url), 1000);
                      }}
                    >
                      Open File in New Tab
                    </Button>
                  </div>
                )
              ) : (
                <div style={{ textAlign: 'center', color: colors.text.secondary }}>
                  <FileIcon>{getFileIcon(evidence.fileType)}</FileIcon>
                  <p>Preview not available</p>
                </div>
              )}
            </PreviewContent>
          </PreviewColumn>

          <Sidebar>
            <SidebarScrollArea>
              {/* Evidence Files List - Show if multiple files */}
              {allEvidence && allEvidence.length > 1 && (
                <div>
                  <SectionTitle><FiFileText size={14} /> All Evidence Files ({allEvidence.length})</SectionTitle>
                  <EvidenceFilesList>
                    {allEvidence.map((ev) => (
                      <EvidenceFileItem 
                        key={ev.id}
                        $isSelected={ev.id === selectedEvidence.id}
                      >
                        <FileItemInfo>
                          <FileItemName title={ev.filename}>{ev.filename}</FileItemName>
                          <FileItemMeta>
                            {ev.fileType} • {formatFileSize(ev.size)}
                          </FileItemMeta>
                        </FileItemInfo>
                        <PreviewButton 
                          onClick={() => setSelectedEvidence(ev)}
                          disabled={ev.id === selectedEvidence.id}
                        >
                          {ev.id === selectedEvidence.id ? 'Viewing' : 'Preview'}
                        </PreviewButton>
                      </EvidenceFileItem>
                    ))}
                  </EvidenceFilesList>
                </div>
              )}

              <div>
                <SectionTitle><FiInfo size={14} /> Evidence Details</SectionTitle>
                <MetadataGrid>
                  <MetaItem>
                    <MetaLabel>File Type</MetaLabel>
                    <MetaValue>{evidence.fileType}</MetaValue>
                  </MetaItem>
                  <MetaItem>
                    <MetaLabel>Size</MetaLabel>
                    <MetaValue>{formatFileSize(evidence.size)}</MetaValue>
                  </MetaItem>
                  <MetaItem>
                    <MetaLabel>Uploaded By</MetaLabel>
                    <MetaValue>{evidence.uploadedBy}</MetaValue>
                  </MetaItem>
                  <MetaItem>
                    <MetaLabel>Date</MetaLabel>
                    <MetaValue>{new Date(evidence.uploadedAt).toLocaleDateString()}</MetaValue>
                  </MetaItem>
                </MetadataGrid>
                {evidence.description && (
                  <div style={{ marginTop: spacing.md, fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                    <MetaLabel>Description</MetaLabel>
                    <p style={{ margin: '4px 0 0 0', color: colors.text.primary }}>{evidence.description}</p>
                  </div>
                )}
              </div>

              <div>
                <SectionTitle><FiFileText size={14} /> Review Decision</SectionTitle>
                <TextArea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add your review comments here..."
                />
              </div>

              {!hideEscalateButton && (
                <div>
                  <SectionTitle><FiArrowUp size={14} /> Escalation (Optional)</SectionTitle>
                  <AuthoritySection>
                    <div style={{ marginBottom: spacing.sm }}>
                      <MetaLabel>Reason</MetaLabel>
                      <StyledSelect
                        value={escalationReason}
                        onChange={setEscalationReason}
                        options={[
                          { value: '', label: 'Select reason...' },
                          { value: 'compliance', label: 'Compliance Review' },
                          { value: 'technical', label: 'Technical Assessment' },
                          { value: 'business', label: 'Business Approval' },
                          { value: 'budget', label: 'Budget Review' },
                          { value: 'privacy', label: 'Privacy Analysis' },
                          { value: 'other', label: 'Other' }
                        ]}
                        placeholder="Select reason..."
                      />
                    </div>
                    <div>
                      <MetaLabel>Tag Authorities</MetaLabel>
                      <AuthorityChips>
                        {Object.entries(AUTHORITY_CONFIGS).map(([key, config]) => (
                          config?.name && (
                            <AuthorityChip
                              key={key}
                              $selected={selectedAuthorities.includes(key)}
                              onClick={() => toggleAuthority(key)}
                              type="button"
                            >
                              {config.name}
                            </AuthorityChip>
                          )
                        ))}
                      </AuthorityChips>
                    </div>
                  </AuthoritySection>
                </div>
              )}

              {evidence.reviewerNote && (
                <div style={{ padding: spacing.md, background: colors.neutral.gray50, borderRadius: borderRadius.base }}>
                  <MetaLabel>Previous Note</MetaLabel>
                  <p style={{ margin: '4px 0 0 0', fontSize: typography.fontSize.sm }}>{evidence.reviewerNote}</p>
                  <div style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary, marginTop: spacing.xs }}>
                    {new Date(evidence.reviewedAt!).toLocaleString()}
                  </div>
                </div>
              )}
            </SidebarScrollArea>

            <SidebarFooter>
              <ButtonGroup>
                <Button
                  variant="approve"
                  onClick={() => handleDecision('APPROVE')}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <LoadingSpinner /> : <FiCheck size={18} />}
                  Approve
                </Button>
                <Button
                  variant="reject"
                  onClick={() => handleDecision('REJECT')}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <LoadingSpinner /> : <FiXCircle size={18} />}
                  Reject
                </Button>
              </ButtonGroup>
              
              {!hideEscalateButton && (
                <Button
                  variant="escalate"
                  fullWidth
                  onClick={() => handleDecision('ESCALATE')}
                  disabled={isSubmitting || !canEscalate || !escalationReason}
                >
                  {isSubmitting ? <LoadingSpinner /> : <FiArrowUp size={18} />}
                  Escalate Review
                </Button>
              )}
            </SidebarFooter>
          </Sidebar>
        </Content>
      </Drawer>
    </Overlay>
  );
};

export default ReviewDrawer;
