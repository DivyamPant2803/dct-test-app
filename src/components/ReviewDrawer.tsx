import React, { useState } from 'react';
import styled from 'styled-components';
import { Evidence, ReviewDecision } from '../types/index';
import StatusChip from './StatusChip';

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
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #222;
  }
`;

const DecisionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button<{ variant?: 'approve' | 'reject' | 'escalate' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  border: 1px solid ${props => {
    switch (props.variant) {
      case 'approve':
        return '#4CAF50';
      case 'reject':
        return '#F44336';
      case 'escalate':
        return '#9C27B0';
      default:
        return '#ccc';
    }
  }};
  background: ${props => {
    switch (props.variant) {
      case 'approve':
        return '#4CAF50';
      case 'reject':
        return '#F44336';
      case 'escalate':
        return '#9C27B0';
      default:
        return 'white';
    }
  }};
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
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
        note: comment.trim() || undefined
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
              <Form>
                <FormGroup>
                  <Label htmlFor="comment">Review Comments</Label>
                  <TextArea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add your review comments here..."
                  />
                </FormGroup>

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
                      disabled={isSubmitting}
                    >
                      {isSubmitting && <LoadingSpinner />}
                      Escalate to Legal
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
};

export default ReviewDrawer;
