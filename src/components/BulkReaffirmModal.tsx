import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Requirement } from '../types/index';

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
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  
  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
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
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #222;
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
  flex: 1;
  overflow-y: auto;
  min-height: 0; /* Allow flex shrinking */
  
  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
`;

const ModalFooter = styled.div`
  padding: 1.5rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-weight: 500;
  color: #333;
  margin-bottom: 0.5rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
  
  &:focus {
    outline: none;
    border-color: #222;
  }
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
    
    &:hover:not(:disabled) {
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
    
    &:hover:not(:disabled) {
      background: #f5f5f5;
    }
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `}
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 0.85rem;
  margin-top: 0.5rem;
`;

const RequirementsList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #eee;
  border-radius: 6px;
  margin-bottom: 1rem;
  
  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f8f9fa;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
`;

const RequirementItem = styled.div`
  padding: 0.75rem;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const RequirementTitle = styled.div`
  font-weight: 500;
  color: #333;
  margin-bottom: 0.25rem;
`;

const RequirementMeta = styled.div`
  font-size: 0.8rem;
  color: #666;
`;

const BatchInfo = styled.div`
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoLabel = styled.span`
  color: #666;
`;

const InfoValue = styled.span`
  font-weight: 500;
  color: #333;
`;

interface BulkReaffirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  requirements: Requirement[];
  onSubmit: (data: {
    requirementIds: string[];
    comment: string;
    action: 'REAFFIRMED_AS_IS' | 'REAFFIRMED_WITH_CHANGES';
  }) => Promise<void>;
}

const BulkReaffirmModal: React.FC<BulkReaffirmModalProps> = ({ 
  isOpen, 
  onClose, 
  requirements, 
  onSubmit 
}) => {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setComment('');
      setError('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleInputChange = (field: string, value: string) => {
    if (field === 'comment') {
      setComment(value);
    }
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      setError('Please provide a comment for the bulk reaffirmation');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onSubmit({
        requirementIds: requirements.map(req => req.id),
        comment: comment.trim(),
        action: 'REAFFIRMED_AS_IS' // Default action for bulk reaffirmation
      });
      
      onClose();
    } catch (error) {
      console.error('Error submitting bulk reaffirmation:', error);
      setError('Failed to submit bulk reaffirmation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay $isOpen={isOpen}>
      <ModalContainer>
        <ModalHeader>
          <ModalTitle>Bulk Reaffirm Requirements</ModalTitle>
          <CloseButton onClick={handleClose}>×</CloseButton>
        </ModalHeader>
        
        <form onSubmit={handleSubmit}>
          <ModalBody>
            {/* Section 1: Basic Information Summary */}
            <BatchInfo>
              <InfoRow>
                <InfoLabel>Total Requirements:</InfoLabel>
                <InfoValue>{requirements.length}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Jurisdictions:</InfoLabel>
                <InfoValue>{[...new Set(requirements.map(r => r.jurisdiction))].join(', ')}</InfoValue>
              </InfoRow>
              {requirements.some(r => r.status) && (
                <InfoRow>
                  <InfoLabel>Statuses:</InfoLabel>
                  <InfoValue>{[...new Set(requirements.filter(r => r.status).map(r => r.status))].join(', ')}</InfoValue>
                </InfoRow>
              )}
              <InfoRow>
                <InfoLabel>Entities:</InfoLabel>
                <InfoValue>{[...new Set(requirements.map(r => r.entity))].join(', ')}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Data Subject Types:</InfoLabel>
                <InfoValue>{[...new Set(requirements.map(r => r.subjectType))].join(', ')}</InfoValue>
              </InfoRow>
            </BatchInfo>

            {/* Section 2: Contact Persons */}
            {requirements.some(r => r.contactPersons && r.contactPersons.length > 0) && (
              <FormGroup>
                <Label>Contact Persons</Label>
                <BatchInfo>
                  <InfoRow>
                    <InfoValue>
                      {[...new Set(requirements.flatMap(r => r.contactPersons || []))].join(', ')}
                    </InfoValue>
                  </InfoRow>
                </BatchInfo>
              </FormGroup>
            )}

            {/* Section 3: Recipient Types */}
            {requirements.some(r => r.recipientTypes && r.recipientTypes.length > 0) && (
              <FormGroup>
                <Label>Recipient Types</Label>
                <BatchInfo>
                  <InfoRow>
                    <InfoValue>
                      {[...new Set(requirements.flatMap(r => r.recipientTypes || []))].join(', ')}
                    </InfoValue>
                  </InfoRow>
                </BatchInfo>
              </FormGroup>
            )}

            {/* Section 4: Data Subject Type Details */}
            {requirements.some(r => r.dataSubjectTypeDetails && r.dataSubjectTypeDetails.length > 0) && (
              <FormGroup>
                <Label>Data Subject Type Details</Label>
                <BatchInfo>
                  <InfoRow>
                    <InfoLabel>Transfer Locations:</InfoLabel>
                    <InfoValue>
                      {[...new Set(requirements.flatMap(r => 
                        (r.dataSubjectTypeDetails || []).map(d => d.transferLocation)
                      ))].join(', ')}
                    </InfoValue>
                  </InfoRow>
                  <InfoRow>
                    <InfoLabel>Categories of Data:</InfoLabel>
                    <InfoValue>
                      {[...new Set(requirements.flatMap(r => 
                        (r.dataSubjectTypeDetails || []).map(d => d.categoryOfData)
                      ))].join(', ')}
                    </InfoValue>
                  </InfoRow>
                  <InfoRow>
                    <InfoLabel>Data Transfer Purposes:</InfoLabel>
                    <InfoValue>
                      {[...new Set(requirements.flatMap(r => 
                        (r.dataSubjectTypeDetails || []).map(d => d.dataTransferPurpose)
                      ))].join(', ')}
                    </InfoValue>
                  </InfoRow>
                </BatchInfo>
              </FormGroup>
            )}

            {/* Section 5: Output */}
            {requirements.some(r => r.output) && (
              <FormGroup>
                <Label>Output (Common for all)</Label>
                <BatchInfo>
                  <InfoRow>
                    <InfoValue>
                      {[...new Set(requirements.filter(r => r.output).map(r => r.output))].join(', ')}
                    </InfoValue>
                  </InfoRow>
                </BatchInfo>
              </FormGroup>
            )}

            {/* Section 6: Remediation */}
            {requirements.some(r => r.remediation) && (
              <FormGroup>
                <Label>Remediation (Common for all)</Label>
                <BatchInfo>
                  <InfoRow>
                    <InfoValue>
                      {[...new Set(requirements.filter(r => r.remediation).map(r => r.remediation))].join(' | ')}
                    </InfoValue>
                  </InfoRow>
                </BatchInfo>
              </FormGroup>
            )}

            {/* Selected Requirements List */}
            <FormGroup>
              <Label>Selected Requirements</Label>
              <RequirementsList>
                {requirements.map((req) => (
                  <RequirementItem key={req.id}>
                    <RequirementTitle>{req.title}</RequirementTitle>
                    <RequirementMeta>
                      {req.jurisdiction} • {req.entity} • {req.subjectType}
                      {req.status && ` • ${req.status}`} • 
                      Last reaffirmed: {req.lastReaffirmedAt ? formatDate(req.lastReaffirmedAt) : 'Never'}
                    </RequirementMeta>
                  </RequirementItem>
                ))}
              </RequirementsList>
            </FormGroup>

            <FormGroup>
              <Label>Bulk Comment</Label>
              <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>
                This comment will be applied to all selected requirements. Individual requirements can be updated separately if needed.
              </div>
              <TextArea
                value={comment}
                onChange={(e) => handleInputChange('comment', e.target.value)}
                placeholder="Enter a comment for this bulk reaffirmation..."
                required
              />
            </FormGroup>

            {error && <ErrorMessage>{error}</ErrorMessage>}
          </ModalBody>
          
          <ModalFooter>
            <Button type="button" $variant="secondary" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" $variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : `Reaffirm ${requirements.length} Requirements`}
            </Button>
          </ModalFooter>
        </form>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default BulkReaffirmModal;
