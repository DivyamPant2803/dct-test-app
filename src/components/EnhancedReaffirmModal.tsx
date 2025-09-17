import React, { useState } from 'react';
import styled from 'styled-components';
import { RequirementCombination, BulkReaffirmationRequest } from '../types/index';
import { FiX, FiSave, FiInfo, FiPlus, FiTrash2 } from 'react-icons/fi';

interface EnhancedReaffirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  combination?: RequirementCombination;
  combinations?: RequirementCombination[];
  onSubmit: (data: BulkReaffirmationRequest) => Promise<void>;
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
  max-width: 1000px;
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
  font-size: 1.5rem;
  font-weight: 600;
  color: #222;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background 0.2s ease;
  
  &:hover {
    background: #f5f5f5;
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
`;

const CombinationContext = styled.div`
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
`;

const ContextTitle = styled.h3`
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #222;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ContextGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const ContextItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const ContextLabel = styled.div`
  font-size: 0.8rem;
  font-weight: 500;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ContextValue = styled.div`
  font-size: 0.9rem;
  color: #222;
  font-weight: 500;
`;

const RequirementSection = styled.div`
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h3`
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #222;
`;

const RequirementText = styled.div`
  background: #f8f8f8;
  border: 1px solid #eee;
  border-radius: 6px;
  padding: 1rem;
  font-size: 0.9rem;
  line-height: 1.5;
  color: #333;
  max-height: 200px;
  overflow-y: auto;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: #333;
  font-size: 0.9rem;
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

const RadioOption = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
`;

const RadioInput = styled.input`
  width: 16px;
  height: 16px;
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #222;
  }
`;

const NewRequirementsSection = styled.div`
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
`;

const RequirementInput = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const RequirementTitleInput = styled.input`
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #222;
  }
`;

const RequirementTextInput = styled.textarea`
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

const AddRequirementButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid #222;
  border-radius: 6px;
  background: white;
  color: #222;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: #222;
    color: white;
  }
`;

const RequirementsList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  background: white;
`;

const RequirementItem = styled.div`
  padding: 0.75rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  
  &:last-child {
    border-bottom: none;
  }
`;

const RequirementContent = styled.div`
  flex: 1;
`;

const RequirementItemTitle = styled.div`
  font-weight: 500;
  color: #222;
  margin-bottom: 0.25rem;
`;

const RequirementItemText = styled.div`
  font-size: 0.9rem;
  color: #666;
  line-height: 1.4;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #dc2626;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background 0.2s ease;
  
  &:hover {
    background: #fee2e2;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid #eee;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
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

const ErrorMessage = styled.div`
  color: #dc2626;
  font-size: 0.9rem;
  margin-top: 0.5rem;
`;

const CombinationsList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e9ecef;
  border-radius: 6px;
`;

const CombinationItem = styled.div`
  padding: 0.75rem;
  border-bottom: 1px solid #e9ecef;
  
  &:last-child {
    border-bottom: none;
  }
`;

const CombinationTitle = styled.div`
  font-weight: 500;
  color: #222;
  margin-bottom: 0.25rem;
`;

const CombinationMeta = styled.div`
  font-size: 0.8rem;
  color: #666;
  display: flex;
  gap: 1rem;
`;

const EnhancedReaffirmModal: React.FC<EnhancedReaffirmModalProps> = ({
  isOpen,
  onClose,
  combination,
  combinations,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    action: 'REAFFIRMED_AS_IS' as 'REAFFIRMED_AS_IS' | 'REAFFIRMED_WITH_CHANGES',
    comment: ''
  });
  const [newRequirements, setNewRequirements] = useState<Array<{id: string, title: string, text: string}>>([]);
  const [currentRequirement, setCurrentRequirement] = useState({title: '', text: ''});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isBulk = combinations && combinations.length > 1;
  const currentCombination = combination || (combinations && combinations[0]);
  
  console.log('EnhancedReaffirmModal props:', {
    isOpen,
    combination,
    combinations,
    isBulk,
    currentCombination
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleRequirementInputChange = (field: 'title' | 'text', value: string) => {
    setCurrentRequirement(prev => ({ ...prev, [field]: value }));
  };

  const handleAddRequirement = () => {
    if (!currentRequirement.title.trim() || !currentRequirement.text.trim()) {
      setError('Both title and text are required for new requirements');
      return;
    }

    const newRequirement = {
      id: `new-${Date.now()}`,
      title: currentRequirement.title.trim(),
      text: currentRequirement.text.trim()
    };

    setNewRequirements(prev => [...prev, newRequirement]);
    setCurrentRequirement({title: '', text: ''});
    setError('');
  };

  const handleRemoveRequirement = (id: string) => {
    setNewRequirements(prev => prev.filter(req => req.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentCombination) return;
    
    // Validation
    if (formData.action === 'REAFFIRMED_AS_IS' && !formData.comment.trim()) {
      setError('Comment is required');
      return;
    }
    
    if (formData.action === 'REAFFIRMED_WITH_CHANGES' && newRequirements.length === 0) {
      setError('At least one new requirement must be added when reaffirming with changes');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const request: BulkReaffirmationRequest = {
        combinationIds: isBulk ? combinations!.map(c => c.id) : [currentCombination.id],
        action: formData.action,
        comment: formData.comment,
        newRequirements: formData.action === 'REAFFIRMED_WITH_CHANGES' ? newRequirements : undefined
      };

      console.log('Submitting reaffirmation request:', request);
      await onSubmit(request);
      
      onClose();
      setFormData({
        action: 'REAFFIRMED_AS_IS',
        comment: ''
      });
      setNewRequirements([]);
      setCurrentRequirement({title: '', text: ''});
    } catch (err) {
      setError('Failed to submit reaffirmation. Please try again.');
      console.error('Error submitting reaffirmation:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setError('');
      setNewRequirements([]);
      setCurrentRequirement({title: '', text: ''});
    }
  };

  if (!currentCombination) return null;

  return (
    <ModalOverlay $isOpen={isOpen}>
      <ModalContainer>
        <ModalHeader>
          <ModalTitle>
            {isBulk ? `Bulk Reaffirm ${combinations!.length} Requirements` : 'Reaffirm Requirement'}
          </ModalTitle>
          <CloseButton onClick={handleClose}>
            <FiX />
          </CloseButton>
        </ModalHeader>
        
        <ModalBody>
          <CombinationContext>
            <ContextTitle>
              <FiInfo />
              Combination Context
            </ContextTitle>
            <ContextGrid>
              <ContextItem>
                <ContextLabel>Entity</ContextLabel>
                <ContextValue>{currentCombination.entity}</ContextValue>
              </ContextItem>
              <ContextItem>
                <ContextLabel>Data Subject Type</ContextLabel>
                <ContextValue>{currentCombination.dataSubjectType}</ContextValue>
              </ContextItem>
              <ContextItem>
                <ContextLabel>Transfer Location</ContextLabel>
                <ContextValue>{currentCombination.transferLocation}</ContextValue>
              </ContextItem>
              <ContextItem>
                <ContextLabel>Recipient Type</ContextLabel>
                <ContextValue>{currentCombination.recipientType}</ContextValue>
              </ContextItem>
              <ContextItem>
                <ContextLabel>Review Data Transfer Purpose</ContextLabel>
                <ContextValue>{currentCombination.reviewDataTransferPurpose}</ContextValue>
              </ContextItem>
              <ContextItem>
                <ContextLabel>Current Status</ContextLabel>
                <ContextValue>{currentCombination.reaffirmationStatus}</ContextValue>
              </ContextItem>
            </ContextGrid>
          </CombinationContext>

          <RequirementSection>
            <SectionTitle>Current Requirement Text</SectionTitle>
            <RequirementText>
              {currentCombination.requirement.text}
            </RequirementText>
          </RequirementSection>

          {isBulk && (
            <RequirementSection>
              <SectionTitle>Requirements to be Reaffirmed ({combinations!.length})</SectionTitle>
              <CombinationsList>
                {combinations!.map(combo => (
                  <CombinationItem key={combo.id}>
                    <CombinationTitle>{combo.requirement.title}</CombinationTitle>
                    <CombinationMeta>
                      <span>{combo.dataSubjectType}</span>
                      <span>•</span>
                      <span>{combo.transferLocation}</span>
                      <span>•</span>
                      <span>{combo.recipientType}</span>
                      <span>•</span>
                      <span>{combo.reviewDataTransferPurpose}</span>
                    </CombinationMeta>
                  </CombinationItem>
                ))}
              </CombinationsList>
            </RequirementSection>
          )}

          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>Reaffirmation Action</Label>
              <RadioGroup>
                <RadioOption>
                  <RadioInput
                    type="radio"
                    name="action"
                    value="REAFFIRMED_AS_IS"
                    checked={formData.action === 'REAFFIRMED_AS_IS'}
                    onChange={(e) => handleInputChange('action', e.target.value)}
                  />
                  Reaffirm as-is (no changes)
                </RadioOption>
                <RadioOption>
                  <RadioInput
                    type="radio"
                    name="action"
                    value="REAFFIRMED_WITH_CHANGES"
                    checked={formData.action === 'REAFFIRMED_WITH_CHANGES'}
                    onChange={(e) => handleInputChange('action', e.target.value)}
                  />
                  Reaffirm with changes
                </RadioOption>
              </RadioGroup>
            </FormGroup>

            {formData.action === 'REAFFIRMED_AS_IS' ? (
              <FormGroup>
                <Label>Comment</Label>
                <TextArea
                  value={formData.comment}
                  onChange={(e) => handleInputChange('comment', e.target.value)}
                  placeholder="Enter your comment about this reaffirmation..."
                  required
                />
              </FormGroup>
            ) : (
              <FormGroup>
                <Label>New Requirements</Label>
                <NewRequirementsSection>
                  <RequirementInput>
                    <RequirementTitleInput
                      value={currentRequirement.title}
                      onChange={(e) => handleRequirementInputChange('title', e.target.value)}
                      placeholder="Enter requirement title..."
                    />
                    <RequirementTextInput
                      value={currentRequirement.text}
                      onChange={(e) => handleRequirementInputChange('text', e.target.value)}
                      placeholder="Enter requirement text..."
                    />
                    <AddRequirementButton type="button" onClick={handleAddRequirement}>
                      <FiPlus />
                      Add Requirement
                    </AddRequirementButton>
                  </RequirementInput>
                  
                  {newRequirements.length > 0 && (
                    <RequirementsList>
                      {newRequirements.map(req => (
                        <RequirementItem key={req.id}>
                          <RequirementContent>
                            <RequirementItemTitle>{req.title}</RequirementItemTitle>
                            <RequirementItemText>{req.text}</RequirementItemText>
                          </RequirementContent>
                          <RemoveButton type="button" onClick={() => handleRemoveRequirement(req.id)}>
                            <FiTrash2 />
                          </RemoveButton>
                        </RequirementItem>
                      ))}
                    </RequirementsList>
                  )}
                </NewRequirementsSection>
              </FormGroup>
            )}

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <ButtonGroup>
              <Button type="button" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" $variant="primary" disabled={isSubmitting}>
                <FiSave />
                {isSubmitting ? 'Submitting...' : `${isBulk ? 'Bulk ' : ''}Reaffirm`}
              </Button>
            </ButtonGroup>
          </Form>
        </ModalBody>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default EnhancedReaffirmModal;
