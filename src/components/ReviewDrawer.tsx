import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Evidence, ReviewDecision } from '../types/index';
import StatusChip from './StatusChip';
import StyledSelect from './common/StyledSelect';
import { AUTHORITY_CONFIGS } from '../config/personaConfig';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const Drawer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #222;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0.5rem;
  border-radius: 4px;
  
  &:hover {
    background: #f0f0f0;
    color: #222;
  }
`;

const Content = styled.div`
  padding: 1.5rem;
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Section = styled.div`
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #e9ecef;
`;

const SectionTitle = styled.h4`
  margin: 0 0 0.75rem 0;
  color: #222;
  font-size: 1rem;
  font-weight: 600;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
`;

const InfoLabel = styled.span`
  color: #666;
  font-weight: 500;
`;

const InfoValue = styled.span`
  color: #222;
`;

const FilePreview = styled.div`
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 1rem;
  text-align: center;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const FileIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #666;
`;

const FileName = styled.div`
  font-weight: 500;
  color: #222;
  margin-bottom: 0.25rem;
`;

const FileSize = styled.div`
  font-size: 0.8rem;
  color: #666;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: #222;
  font-size: 0.9rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const AuthoritySelection = styled.div`
  margin-top: 1rem;
`;

const AuthorityChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const AuthorityChip = styled.button<{ $selected: boolean }>`
  padding: 0.375rem 0.75rem;
  border: 1px solid ${props => props.$selected ? '#222' : '#d1d5db'};
  background: ${props => props.$selected ? '#222' : 'white'};
  color: ${props => props.$selected ? 'white' : '#374151'};
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: #222;
    background: ${props => props.$selected ? '#222' : '#f9fafb'};
  }
`;



const DecisionButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
  justify-content: flex-end;
`;

const Button = styled.button<{ variant?: 'approve' | 'reject' | 'escalate' | 'secondary' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid ${props => {
    switch (props.variant) {
      case 'approve':
        return '#10b981';
      case 'reject':
        return '#ef4444';
      case 'escalate':
        return '#f59e0b';
      default:
        return '#d1d5db';
    }
  }};
  background: ${props => {
    switch (props.variant) {
      case 'approve':
        return '#10b981';
      case 'reject':
        return '#ef4444';
      case 'escalate':
        return '#f59e0b';
      default:
        return 'white';
    }
  }};
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  font-size: 0.85rem;
  min-width: 80px;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

interface ReviewDrawerProps {
  evidence: Evidence;
  onClose: () => void;
  onDecision: (decision: ReviewDecision) => void;
  hideEscalateButton?: boolean;
}

const ReviewDrawer: React.FC<ReviewDrawerProps> = ({
  evidence,
  onClose,
  onDecision,
  hideEscalateButton = false
}) => {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [escalationReason, setEscalationReason] = useState('');
  const [selectedAuthorities, setSelectedAuthorities] = useState<string[]>([]);
  const [canEscalate, setCanEscalate] = useState(false);

  // Check if escalation is allowed based on comment content and selected authorities
  useEffect(() => {
    const hasMinimumLength = comment.trim().length >= 10;
    const hasSelectedAuthorities = selectedAuthorities.length > 0;
    setCanEscalate(hasMinimumLength || hasSelectedAuthorities);
  }, [comment, selectedAuthorities]);

  // Toggle authority selection
  const toggleAuthority = (authority: string) => {
    try {
      setSelectedAuthorities(prev => 
        prev.includes(authority) 
          ? prev.filter(a => a !== authority)
          : [...prev, authority]
      );
    } catch (error) {
      console.error('Error toggling authority:', error);
    }
  };

  // Helper function to convert base64 to blob
  const base64ToBlob = (base64: string, mimeType: string): Blob => {
    const byteCharacters = atob(base64.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  };

  const handleDecision = async (decision: 'APPROVE' | 'REJECT' | 'ESCALATE') => {
    setIsSubmitting(true);
    try {
      await onDecision({
        evidenceId: evidence.id,
        decision,
        note: comment.trim() || undefined,
        // Add escalation metadata for ESCALATE decisions
        ...(decision === 'ESCALATE' && {
          escalationReason,
          taggedAuthorities: selectedAuthorities,
          escalatedTo: selectedAuthorities[0] || 'Legal' // Default to Legal if no selection
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
      case 'PDF':
        return '📄';
      case 'DOC':
      case 'DOCX':
        return '📝';
      case 'XLS':
      case 'XLSX':
        return '📊';
      default:
        return '📁';
    }
  };

  try {
    return (
      <Overlay onClick={onClose}>
        <Drawer onClick={(e) => e.stopPropagation()}>
          <Header>
            <Title>Review Evidence</Title>
            <CloseButton onClick={onClose}>&times;</CloseButton>
          </Header>
        
        <Content>
          <LeftColumn>
            <Section>
              <SectionTitle>Evidence Details</SectionTitle>
              <InfoRow>
                <InfoLabel>File Name:</InfoLabel>
                <InfoValue>{evidence.filename}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>File Type:</InfoLabel>
                <InfoValue>{evidence.fileType}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>File Size:</InfoLabel>
                <InfoValue>{formatFileSize(evidence.size)}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Uploaded By:</InfoLabel>
                <InfoValue>{evidence.uploadedBy}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Uploaded At:</InfoLabel>
                <InfoValue>{new Date(evidence.uploadedAt).toLocaleString()}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Current Status:</InfoLabel>
                <InfoValue><StatusChip status={evidence.status} /></InfoValue>
              </InfoRow>
              {evidence.description && (
                <InfoRow>
                  <InfoLabel>Description:</InfoLabel>
                  <InfoValue>{evidence.description}</InfoValue>
                </InfoRow>
              )}
            </Section>

            <Section>
              <SectionTitle>File Preview</SectionTitle>
              <FilePreview>
                {evidence.base64Data ? (
                  <div style={{ width: '100%', height: '100%' }}>
                    {evidence.fileType === 'PDF' ? (
                      <iframe
                        src={evidence.base64Data}
                        width="100%"
                        height="300px"
                        style={{ border: 'none', borderRadius: '4px' }}
                        title={`Preview of ${evidence.filename}`}
                      />
                    ) : (
                      <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <FileIcon>{getFileIcon(evidence.fileType)}</FileIcon>
                        <FileName>{evidence.filename}</FileName>
                        <FileSize>{formatFileSize(evidence.size)}</FileSize>
                        <div style={{ marginTop: '1rem' }}>
                          <button
                            onClick={() => {
                              const blob = base64ToBlob(evidence.base64Data!, `application/${evidence.fileType.toLowerCase()}`);
                              const url = URL.createObjectURL(blob);
                              window.open(url, '_blank');
                              setTimeout(() => URL.revokeObjectURL(url), 1000);
                            }}
                            style={{
                              padding: '0.5rem 1rem',
                              backgroundColor: '#222',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.9rem'
                            }}
                          >
                            Open File
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <FileIcon>{getFileIcon(evidence.fileType)}</FileIcon>
                    <FileName>{evidence.filename}</FileName>
                    <FileSize>{formatFileSize(evidence.size)}</FileSize>
                    <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#666' }}>
                      File preview not available
                    </div>
                  </div>
                )}
              </FilePreview>
            </Section>
          </LeftColumn>

          <RightColumn>
            <Section>
              <SectionTitle>Review Decision</SectionTitle>
              <Form onSubmit={(e) => e.preventDefault()}>
                <FormGroup>
                  <Label htmlFor="comment">Review Comments</Label>
                  <TextArea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add your review comments here..."
                  />
                </FormGroup>

                {!hideEscalateButton && (
                  <AuthoritySelection>
                    <Label>Select Authorities to Escalate To (Optional)</Label>
                    <AuthorityChips>
                      {Object.entries(AUTHORITY_CONFIGS).map(([key, config]) => {
                        if (!config || !config.name) {
                          console.warn(`Invalid authority config for key: ${key}`);
                          return null;
                        }
                        return (
                          <AuthorityChip
                            key={key}
                            $selected={selectedAuthorities.includes(key)}
                            onClick={() => toggleAuthority(key)}
                            type="button"
                          >
                            {config.name}
                          </AuthorityChip>
                        );
                      })}
                    </AuthorityChips>
                    {selectedAuthorities.length > 0 && (
                      <div style={{ 
                        fontSize: '0.8rem', 
                        color: '#666', 
                        marginTop: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <span>Selected authorities:</span>
                        {selectedAuthorities.map(authority => {
                          const config = AUTHORITY_CONFIGS[authority];
                          if (!config || !config.name) {
                            console.warn(`Invalid authority config for selected authority: ${authority}`);
                            return null;
                          }
                          return (
                            <span 
                              key={authority}
                              style={{ 
                                color: '#222',
                                fontWeight: '500',
                                fontSize: '0.75rem',
                                backgroundColor: '#f3f4f6',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px'
                              }}
                            >
                              {config.name}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </AuthoritySelection>
                )}

                {!hideEscalateButton && (
                  <FormGroup>
                    <Label htmlFor="escalation-reason">Escalation Reason (Required for Escalation)</Label>
                    <StyledSelect
                      value={escalationReason}
                      onChange={(value) => {
                        try {
                          console.log('Escalation reason changed to:', value);
                          setEscalationReason(value);
                        } catch (error) {
                          console.error('Error setting escalation reason:', error);
                        }
                      }}
                      options={[
                        { value: '', label: 'Select escalation reason...' },
                        { value: 'compliance', label: 'Compliance Review Required' },
                        { value: 'technical', label: 'Technical Security Assessment' },
                        { value: 'business', label: 'Business Process Approval' },
                        { value: 'budget', label: 'Budget/Contract Review' },
                        { value: 'privacy', label: 'Data Protection Analysis' },
                        { value: 'other', label: 'Other (specify in comments)' }
                      ]}
                      placeholder="Select escalation reason..."
                    />
                  </FormGroup>
                )}

                <DecisionButtons>
                  <Button
                    type="button"
                    variant="approve"
                    onClick={() => handleDecision('APPROVE')}
                    disabled={isSubmitting}
                  >
                    {isSubmitting && <LoadingSpinner />}
                    Approve
                  </Button>
                  <Button
                    type="button"
                    variant="reject"
                    onClick={() => handleDecision('REJECT')}
                    disabled={isSubmitting}
                  >
                    {isSubmitting && <LoadingSpinner />}
                    Reject
                  </Button>
                  {!hideEscalateButton && (
                    <Button
                      type="button"
                      variant="escalate"
                      onClick={() => handleDecision('ESCALATE')}
                      disabled={isSubmitting || !canEscalate || !escalationReason}
                      title={
                        !canEscalate 
                          ? "Add comments (10+ characters) or select authorities to enable escalation"
                          : !escalationReason
                          ? "Select an escalation reason to enable escalation"
                          : `Escalate to ${selectedAuthorities.map(a => {
                              const config = AUTHORITY_CONFIGS[a];
                              return config?.name || a;
                            }).join(', ') || 'selected authorities'}`
                      }
                    >
                      {isSubmitting && <LoadingSpinner />}
                      {canEscalate && escalationReason 
                        ? `Escalate${selectedAuthorities.length > 0 ? ` to ${selectedAuthorities.map(a => {
                            const config = AUTHORITY_CONFIGS[a];
                            return config?.name || a;
                          }).join(', ')}` : ''}`
                        : 'Escalate'
                      }
                    </Button>
                  )}
                </DecisionButtons>
              </Form>
            </Section>

            {evidence.reviewerNote && (
              <Section>
                <SectionTitle>Previous Review Notes</SectionTitle>
                <div style={{ 
                  background: 'white', 
                  padding: '1rem', 
                  borderRadius: '4px',
                  border: '1px solid #e9ecef',
                  fontSize: '0.9rem',
                  color: '#333'
                }}>
                  {evidence.reviewerNote}
                </div>
                {evidence.reviewedAt && (
                  <div style={{ 
                    fontSize: '0.8rem', 
                    color: '#666', 
                    marginTop: '0.5rem' 
                  }}>
                    Reviewed on {new Date(evidence.reviewedAt).toLocaleString()}
                  </div>
                )}
              </Section>
            )}
          </RightColumn>
        </Content>
      </Drawer>
    </Overlay>
  );
  } catch (error) {
    console.error('Error rendering ReviewDrawer:', error);
    return (
      <Overlay onClick={onClose}>
        <Drawer onClick={(e) => e.stopPropagation()}>
          <Header>
            <Title>Review Evidence</Title>
            <CloseButton onClick={onClose}>&times;</CloseButton>
          </Header>
          <Content>
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <p>An error occurred while loading the review form.</p>
              <button onClick={onClose} style={{ marginTop: '1rem', padding: '0.5rem 1rem', backgroundColor: '#222', color: 'white', border: 'none', borderRadius: '4px' }}>
                Close
              </button>
            </div>
          </Content>
        </Drawer>
      </Overlay>
    );
  }
};

export default ReviewDrawer;
