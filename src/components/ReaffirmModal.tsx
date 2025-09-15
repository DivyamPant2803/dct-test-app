import React, { useState } from 'react';
import styled from 'styled-components';
import { Requirement, ReaffirmationRequest } from '../types/index';

interface ReaffirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  requirement: Requirement | null;
  requirements?: Requirement[];
  onSubmit: (data: ReaffirmationRequest) => Promise<void>;
}

const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #222;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0.25rem;
  
  &:hover {
    color: #222;
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
  resize: vertical;
  min-height: 100px;
  
  &:focus {
    outline: none;
    border-color: #222;
  }
`;

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const RadioOption = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f8f8f8;
  }
  
  input[type="radio"] {
    margin: 0;
    margin-top: 0.125rem;
  }
`;

const RadioText = styled.div`
  flex: 1;
`;

const RadioTitle = styled.div`
  font-weight: 500;
  color: #222;
  margin-bottom: 0.25rem;
`;

const RadioDescription = styled.div`
  font-size: 0.85rem;
  color: #666;
`;

const RequirementInfo = styled.div`
  background: #f8f8f8;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1.5rem;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoLabel = styled.span`
  font-weight: 500;
  color: #666;
`;

const InfoValue = styled.span`
  color: #222;
`;

const ModalFooter = styled.div`
  padding: 1.5rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => props.$variant === 'primary' ? `
    background: #222;
    color: white;
    
    &:hover {
      background: #444;
    }
    
    &:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
  ` : `
    background: white;
    color: #222;
    border: 1px solid #ccc;
    
    &:hover {
      background: #f5f5f5;
    }
  `}
`;

const ReaffirmModal: React.FC<ReaffirmModalProps> = ({ isOpen, onClose, requirement, requirements, onSubmit }) => {
  const [action, setAction] = useState<'REAFFIRMED_AS_IS' | 'REAFFIRMED_WITH_CHANGES'>('REAFFIRMED_AS_IS');
  const [comment, setComment] = useState('');
  const [proposedChanges, setProposedChanges] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get the current requirement data from the requirements list
  const currentRequirement = requirement && requirements 
    ? requirements.find(req => req.id === requirement.id) || requirement
    : requirement;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentRequirement) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit({
        requirementId: currentRequirement.id,
        action,
        comment: comment.trim() || undefined,
        proposedChanges: action === 'REAFFIRMED_WITH_CHANGES' ? proposedChanges.trim() : undefined
      });
      
      // Reset form
      setAction('REAFFIRMED_AS_IS');
      setComment('');
      setProposedChanges('');
      onClose();
    } catch (error) {
      console.error('Error submitting reaffirmation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!currentRequirement) return null;

  return (
    <ModalOverlay $isOpen={isOpen} onClick={onClose}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Reaffirm Requirement</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>
        
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <RequirementInfo>
              <InfoRow>
                <InfoLabel>Title:</InfoLabel>
                <InfoValue>{currentRequirement.title}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Jurisdiction:</InfoLabel>
                <InfoValue>{currentRequirement.jurisdiction}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Entity:</InfoLabel>
                <InfoValue>{currentRequirement.entity}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Subject Type:</InfoLabel>
                <InfoValue>{currentRequirement.subjectType}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Original Date:</InfoLabel>
                <InfoValue>{formatDate(currentRequirement.originalIngestionDate)}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Last Reaffirmed:</InfoLabel>
                <InfoValue>
                  {currentRequirement.lastReaffirmedAt ? formatDate(currentRequirement.lastReaffirmedAt) : 'Never'}
                </InfoValue>
              </InfoRow>
            </RequirementInfo>

            <FormGroup>
              <Label>Current Requirement Text</Label>
              <div style={{ 
                background: '#f8f8f8', 
                padding: '1rem', 
                borderRadius: '6px', 
                border: '1px solid #eee',
                fontSize: '0.9rem',
                lineHeight: '1.5',
                color: '#333',
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                {currentRequirement.text}
              </div>
            </FormGroup>

            <FormGroup>
              <Label>Reaffirmation Action</Label>
              <RadioGroup>
                <RadioOption>
                  <input
                    type="radio"
                    name="action"
                    value="REAFFIRMED_AS_IS"
                    checked={action === 'REAFFIRMED_AS_IS'}
                    onChange={(e) => setAction(e.target.value as 'REAFFIRMED_AS_IS')}
                  />
                  <RadioText>
                    <RadioTitle>Reaffirm as-is</RadioTitle>
                    <RadioDescription>
                      Confirm that this requirement remains current and accurate without any changes.
                    </RadioDescription>
                  </RadioText>
                </RadioOption>
                
                <RadioOption>
                  <input
                    type="radio"
                    name="action"
                    value="REAFFIRMED_WITH_CHANGES"
                    checked={action === 'REAFFIRMED_WITH_CHANGES'}
                    onChange={(e) => setAction(e.target.value as 'REAFFIRMED_WITH_CHANGES')}
                  />
                  <RadioText>
                    <RadioTitle>Reaffirm with changes</RadioTitle>
                    <RadioDescription>
                      Confirm the requirement but propose modifications to keep it current.
                    </RadioDescription>
                  </RadioText>
                </RadioOption>
              </RadioGroup>
            </FormGroup>

            <FormGroup>
              <Label>Comment (Optional)</Label>
              <TextArea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add any notes about this reaffirmation..."
              />
            </FormGroup>

            {action === 'REAFFIRMED_WITH_CHANGES' && (
              <FormGroup>
                <Label>Proposed Changes</Label>
                <TextArea
                  value={proposedChanges}
                  onChange={(e) => setProposedChanges(e.target.value)}
                  placeholder="Describe the changes you propose to make to this requirement..."
                  required
                />
              </FormGroup>
            )}
          </ModalBody>
          
          <ModalFooter>
            <Button type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" $variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Reaffirm'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default ReaffirmModal;
