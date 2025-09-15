import React, { useState } from 'react';
import styled from 'styled-components';
import { Requirement } from '../types/index';
import { FiX, FiSave, FiUser } from 'react-icons/fi';

interface ProposeEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  requirement: Requirement | null;
  onSubmit: (data: {
    requirementId: string;
    proposedText: string;
    impact: string;
    approver: string;
    title: string;
    jurisdiction: string;
    entity: string;
    subjectType: string;
  }) => Promise<void>;
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
  max-width: 800px;
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

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #222;
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  background: white;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #222;
  }
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

const RichTextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  min-height: 200px;
  resize: vertical;
  font-family: inherit;
  line-height: 1.5;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #222;
  }
`;

const ApproverGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
`;

const ApproverIcon = styled.div`
  color: #666;
  font-size: 1.2rem;
`;

const ApproverInfo = styled.div`
  flex: 1;
`;

const ApproverLabel = styled.div`
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 0.25rem;
`;

const ApproverSelect = styled.select`
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.9rem;
  background: white;
  width: 100%;
  
  &:focus {
    outline: none;
    border-color: #222;
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

const ProposeEditModal: React.FC<ProposeEditModalProps> = ({
  isOpen,
  onClose,
  requirement,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    title: '',
    jurisdiction: '',
    entity: '',
    subjectType: '',
    proposedText: '',
    impact: '',
    approver: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Initialize form data when requirement changes
  React.useEffect(() => {
    if (requirement) {
      setFormData({
        title: requirement.title,
        jurisdiction: requirement.jurisdiction,
        entity: requirement.entity,
        subjectType: requirement.subjectType,
        proposedText: '', // Start with empty text so users must make changes
        impact: '',
        approver: ''
      });
    }
  }, [requirement]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!requirement) return;
    
    // Validation
    if (!formData.proposedText.trim()) {
      setError('Proposed text is required');
      return;
    }
    
    if (!formData.impact.trim()) {
      setError('Impact summary is required');
      return;
    }
    
    if (!formData.approver) {
      setError('Please select an approver');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onSubmit({
        requirementId: requirement.id,
        proposedText: formData.proposedText,
        impact: formData.impact,
        approver: formData.approver,
        title: formData.title,
        jurisdiction: formData.jurisdiction,
        entity: formData.entity,
        subjectType: formData.subjectType
      });
      
      onClose();
      setFormData({
        title: '',
        jurisdiction: '',
        entity: '',
        subjectType: '',
        proposedText: '',
        impact: '',
        approver: ''
      });
    } catch (err) {
      setError('Failed to submit change request. Please try again.');
      console.error('Error submitting change request:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setError('');
    }
  };

  if (!requirement) return null;

  return (
    <ModalOverlay $isOpen={isOpen}>
      <ModalContainer>
        <ModalHeader>
          <ModalTitle>Propose Requirement Edit</ModalTitle>
          <CloseButton onClick={handleClose}>
            <FiX />
          </CloseButton>
        </ModalHeader>
        
        <ModalBody>
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>Title</Label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Jurisdiction</Label>
              <Input
                type="text"
                value={formData.jurisdiction}
                onChange={(e) => handleInputChange('jurisdiction', e.target.value)}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Entity</Label>
              <Input
                type="text"
                value={formData.entity}
                onChange={(e) => handleInputChange('entity', e.target.value)}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Subject Type</Label>
              <Select
                value={formData.subjectType}
                onChange={(e) => handleInputChange('subjectType', e.target.value)}
                required
              >
                <option value="">Select subject type</option>
                <option value="Employee">Employee</option>
                <option value="Client">Client</option>
                <option value="Candidate">Candidate</option>
                <option value="Prospect">Prospect</option>
              </Select>
            </FormGroup>

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
                overflowY: 'auto',
                marginBottom: '1rem'
              }}>
                {requirement.text}
              </div>
            </FormGroup>

            <FormGroup>
              <Label>Proposed Requirement Text</Label>
              <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>
                Enter your proposed changes to the requirement text. This will be compared against the original text above.
              </div>
              <RichTextArea
                value={formData.proposedText}
                onChange={(e) => handleInputChange('proposedText', e.target.value)}
                placeholder="Enter the proposed requirement text..."
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Impact Summary</Label>
              <TextArea
                value={formData.impact}
                onChange={(e) => handleInputChange('impact', e.target.value)}
                placeholder="Describe the impact and reasoning for this change..."
                required
              />
            </FormGroup>

            <ApproverGroup>
              <ApproverIcon>
                <FiUser />
              </ApproverIcon>
              <ApproverInfo>
                <ApproverLabel>Assign to Approver</ApproverLabel>
                <ApproverSelect
                  value={formData.approver}
                  onChange={(e) => handleInputChange('approver', e.target.value)}
                  required
                >
                  <option value="">Select an approver</option>
                  <option value="admin-john">John Smith (Admin)</option>
                  <option value="admin-sarah">Sarah Johnson (Admin)</option>
                  <option value="admin-mike">Mike Wilson (Admin)</option>
                  <option value="admin-lisa">Lisa Brown (Admin)</option>
                </ApproverSelect>
              </ApproverInfo>
            </ApproverGroup>

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <ButtonGroup>
              <Button type="button" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" $variant="primary" disabled={isSubmitting}>
                <FiSave />
                {isSubmitting ? 'Submitting...' : 'Submit Change Request'}
              </Button>
            </ButtonGroup>
          </Form>
        </ModalBody>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default ProposeEditModal;
