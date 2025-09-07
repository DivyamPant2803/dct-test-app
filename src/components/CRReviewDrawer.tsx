import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ChangeRequest, Requirement } from '../types/index';
import { useRequirementsApi } from '../hooks/useRequirementsApi';
import DiffViewer from './DiffViewer';
import { FiX, FiCheck, FiXCircle, FiClock, FiUser, FiCalendar } from 'react-icons/fi';

interface CRReviewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  changeRequest: ChangeRequest | null;
  onDecision: (crId: string, decision: 'APPROVE' | 'REJECT', note?: string, reviewer?: string) => Promise<void>;
  currentReviewer?: string;
}

const DrawerOverlay = styled.div<{ $isOpen: boolean }>`
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

const DrawerContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 95%;
  max-width: 1200px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const DrawerHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
`;

const DrawerTitle = styled.h2`
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

const DrawerBody = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const CRInfo = styled.div`
  padding: 1.5rem;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
`;

const InfoLabel = styled.span`
  font-weight: 500;
  color: #666;
`;

const InfoValue = styled.span`
  color: #222;
`;

const StatusBadge = styled.span<{ $status: 'PENDING' | 'APPROVED' | 'REJECTED' }>`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  
  ${props => {
    switch (props.$status) {
      case 'PENDING':
        return `
          background: #fef3c7;
          color: #92400e;
        `;
      case 'APPROVED':
        return `
          background: #d1fae5;
          color: #065f46;
        `;
      case 'REJECTED':
        return `
          background: #fee2e2;
          color: #991b1b;
        `;
    }
  }}
`;

const DiffSection = styled.div`
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
`;

const ImpactSection = styled.div`
  padding: 1.5rem;
  background: #f8f9fa;
  border-top: 1px solid #eee;
  flex-shrink: 0;
`;

const ImpactTitle = styled.h3`
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #222;
`;

const ImpactText = styled.div`
  background: white;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  color: #333;
  line-height: 1.5;
`;

const ActionSection = styled.div`
  padding: 1.5rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
`;

const CommentSection = styled.div`
  flex: 1;
  margin-right: 1rem;
`;

const CommentLabel = styled.label`
  display: block;
  font-weight: 500;
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
`;

const CommentTextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 0.9rem;
  min-height: 80px;
  resize: vertical;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: #222;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
`;

const Button = styled.button<{ $variant?: 'approve' | 'reject' | 'secondary' }>`
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
  
  ${props => {
    switch (props.$variant) {
      case 'approve':
        return `
          background: #22c55e;
          color: white;
          
          &:hover {
            background: #16a34a;
          }
          
          &:disabled {
            background: #ccc;
            cursor: not-allowed;
          }
        `;
      case 'reject':
        return `
          background: #ef4444;
          color: white;
          
          &:hover {
            background: #dc2626;
          }
          
          &:disabled {
            background: #ccc;
            cursor: not-allowed;
          }
        `;
      default:
        return `
          background: white;
          color: #222;
          border: 1px solid #ccc;
          
          &:hover {
            background: #f5f5f5;
          }
        `;
    }
  }}
`;

const LoadingMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #666;
  font-size: 0.9rem;
`;

const ErrorMessage = styled.div`
  color: #dc2626;
  font-size: 0.9rem;
  margin-top: 0.5rem;
`;

const CRReviewDrawer: React.FC<CRReviewDrawerProps> = ({
  isOpen,
  onClose,
  changeRequest,
  onDecision,
  currentReviewer
}) => {
  const [requirement, setRequirement] = useState<Requirement | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { getRequirementById } = useRequirementsApi();

  // Load requirement data when change request changes
  useEffect(() => {
    if (changeRequest) {
      setLoading(true);
      getRequirementById(changeRequest.requirementId)
        .then(setRequirement)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [changeRequest, getRequirementById]);

  // Reset form when drawer opens/closes
  useEffect(() => {
    if (!isOpen) {
      setComment('');
      setError('');
      setRequirement(null);
    }
  }, [isOpen]);

  const handleDecision = async (decision: 'APPROVE' | 'REJECT') => {
    if (!changeRequest) return;

    setIsSubmitting(true);
    setError('');

    try {
      await onDecision(changeRequest.id, decision, comment.trim() || undefined, currentReviewer);
      onClose();
    } catch (err) {
      setError('Failed to submit decision. Please try again.');
      console.error('Error submitting decision:', err);
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!changeRequest) return null;

  return (
    <DrawerOverlay $isOpen={isOpen}>
      <DrawerContainer>
        <DrawerHeader>
          <DrawerTitle>Review Change Request</DrawerTitle>
          <CloseButton onClick={handleClose}>
            <FiX />
          </CloseButton>
        </DrawerHeader>

        <DrawerBody>
          <CRInfo>
            <InfoGrid>
              <InfoItem>
                <FiUser />
                <InfoLabel>Author:</InfoLabel>
                <InfoValue>{changeRequest.author}</InfoValue>
              </InfoItem>
              <InfoItem>
                <FiUser />
                <InfoLabel>Assigned To:</InfoLabel>
                <InfoValue>{changeRequest.approver}</InfoValue>
              </InfoItem>
              <InfoItem>
                <FiCalendar />
                <InfoLabel>Submitted:</InfoLabel>
                <InfoValue>{formatDate(changeRequest.createdAt)}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Status:</InfoLabel>
                <StatusBadge $status={changeRequest.status}>
                  {changeRequest.status === 'PENDING' && <FiClock />}
                  {changeRequest.status === 'APPROVED' && <FiCheck />}
                  {changeRequest.status === 'REJECTED' && <FiXCircle />}
                  {changeRequest.status}
                </StatusBadge>
              </InfoItem>
            </InfoGrid>
          </CRInfo>

          {loading ? (
            <LoadingMessage>Loading requirement details...</LoadingMessage>
          ) : requirement ? (
            <DiffSection>
              <DiffViewer
                originalText={requirement.text}
                proposedText={changeRequest.proposedText}
                title={`${changeRequest.title} - Text Comparison`}
              />
            </DiffSection>
          ) : (
            <LoadingMessage>Unable to load requirement details</LoadingMessage>
          )}

          <ImpactSection>
            <ImpactTitle>Impact Summary</ImpactTitle>
            <ImpactText>{changeRequest.impact}</ImpactText>
          </ImpactSection>

          {changeRequest.status === 'PENDING' && (
            <ActionSection>
              <CommentSection>
                <CommentLabel>Review Comments (Optional)</CommentLabel>
                <CommentTextArea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add any comments about your decision..."
                />
                {error && <ErrorMessage>{error}</ErrorMessage>}
              </CommentSection>
              
              <ActionButtons>
                <Button onClick={handleClose} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button 
                  $variant="reject" 
                  onClick={() => handleDecision('REJECT')}
                  disabled={isSubmitting}
                >
                  <FiXCircle />
                  {isSubmitting ? 'Rejecting...' : 'Reject'}
                </Button>
                <Button 
                  $variant="approve" 
                  onClick={() => handleDecision('APPROVE')}
                  disabled={isSubmitting}
                >
                  <FiCheck />
                  {isSubmitting ? 'Approving...' : 'Approve'}
                </Button>
              </ActionButtons>
            </ActionSection>
          )}
        </DrawerBody>
      </DrawerContainer>
    </DrawerOverlay>
  );
};

export default CRReviewDrawer;
