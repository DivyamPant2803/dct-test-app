import React from 'react';
import styled from 'styled-components';

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
  justify-content: flex-end;
`;

const Sidebar = styled.div`
  background: white;
  width: 600px;
  height: 100vh;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

const Header = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fafafa;
`;

const Title = styled.h2`
  font-size: 1.25rem;
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
`;

const InfoSection = styled.div`
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  margin-bottom: 1.5rem;
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

const StatusChip = styled.span<{ status: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  ${props => {
    switch (props.status) {
      case 'PENDING':
        return 'background: #fef3c7; color: #92400e;';
      case 'APPROVED':
        return 'background: #d1fae5; color: #065f46;';
      case 'REJECTED':
        return 'background: #fee2e2; color: #991b1b;';
      case 'UNDER_REVIEW':
        return 'background: #dbeafe; color: #1e40af;';
      default:
        return 'background: #f3f4f6; color: #6b7280;';
    }
  }}
`;

const DataSubjectsSection = styled.div`
  margin-top: 1.5rem;
`;

const SectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #222;
  margin-bottom: 1rem;
`;

const DataSubjectCard = styled.div`
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1rem;
`;

const DataSubjectHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
`;

const DataSubjectType = styled.span`
  font-weight: 600;
  color: #222;
`;

const Count = styled.span`
  background: #e9ecef;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  color: #666;
`;

const CombinationItem = styled.div`
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
`;

const CombinationHeader = styled.div`
  font-weight: 500;
  color: #222;
  margin-bottom: 0.5rem;
`;

const AttributeRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  margin-bottom: 0.25rem;
`;

const AttributeLabel = styled.span`
  color: #666;
`;

const AttributeValue = styled.span`
  color: #222;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
`;

const Button = styled.button<{ variant: 'approve' | 'reject' }>`
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
  
  ${props => props.variant === 'approve' 
    ? 'background: #10b981; color: white; &:hover { background: #059669; }'
    : 'background: #ef4444; color: white; &:hover { background: #dc2626; }'
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

interface EntitySubmission {
  submissionId: string;
  entityName: string;
  entityId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW';
  submittedAt: string;
  submittedBy: string;
  entityData?: {
    id: string;
    name: string;
    jurisdiction: string;
    updatedCount: number;
    lastUpdated: string;
    dataSubjects: Array<{
      type: string;
      count: number;
      combinations: Array<{
        id: string;
        recipient: string;
        attributes: {
          location: { before: string | null; after: string | null };
          division: { before: string | null; after: string | null };
          purpose: { before: string | null; after: string | null };
          output: { before: string | null; after: string | null };
        };
        conditions: { before: string | null; after: string | null };
        remediations: { before: string | null; after: string | null };
        endUserRequirements: { before: string | null; after: string | null };
      }>;
    }>;
  };
}

interface SubmissionSidebarProps {
  isOpen: boolean;
  submission: EntitySubmission | null;
  onClose: () => void;
  onApprove: (submissionId: string) => void;
  onReject: (submissionId: string) => void;
}

const SubmissionSidebar: React.FC<SubmissionSidebarProps> = ({
  isOpen,
  submission,
  onClose,
  onApprove,
  onReject
}) => {
  if (!isOpen || !submission) {
    return null;
  }

  const handleApprove = () => {
    onApprove(submission.submissionId);
    onClose();
  };

  const handleReject = () => {
    onReject(submission.submissionId);
    onClose();
  };

  return (
    <Overlay onClick={onClose}>
      <Sidebar onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>Submission Details</Title>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </Header>
        
        <Content>
          <InfoSection>
            <InfoRow>
              <InfoLabel>Submission ID:</InfoLabel>
              <InfoValue>{submission.submissionId}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Entity Name:</InfoLabel>
              <InfoValue>{submission.entityName}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Entity ID:</InfoLabel>
              <InfoValue>{submission.entityId}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Status:</InfoLabel>
              <InfoValue>
                <StatusChip status={submission.status}>
                  {submission.status}
                </StatusChip>
              </InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Submitted By:</InfoLabel>
              <InfoValue>{submission.submittedBy}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Submitted At:</InfoLabel>
              <InfoValue>{new Date(submission.submittedAt).toLocaleDateString()}</InfoValue>
            </InfoRow>
          </InfoSection>

          {submission.entityData && (
            <>
              <InfoSection>
                <InfoRow>
                  <InfoLabel>Jurisdiction:</InfoLabel>
                  <InfoValue>{submission.entityData.jurisdiction}</InfoValue>
                </InfoRow>
                <InfoRow>
                  <InfoLabel>Updated Count:</InfoLabel>
                  <InfoValue>{submission.entityData.updatedCount}</InfoValue>
                </InfoRow>
                <InfoRow>
                  <InfoLabel>Last Updated:</InfoLabel>
                  <InfoValue>{new Date(submission.entityData.lastUpdated).toLocaleDateString()}</InfoValue>
                </InfoRow>
              </InfoSection>

              <DataSubjectsSection>
                <SectionTitle>Data Subject Types</SectionTitle>
                {submission.entityData.dataSubjects.map((dataSubject, index) => (
                  <DataSubjectCard key={index}>
                    <DataSubjectHeader>
                      <DataSubjectType>{dataSubject.type}</DataSubjectType>
                      <Count>{dataSubject.count} combinations</Count>
                    </DataSubjectHeader>
                    {dataSubject.combinations.map((combination) => (
                      <CombinationItem key={combination.id}>
                        <CombinationHeader>
                          Recipient: {combination.recipient}
                        </CombinationHeader>
                        <AttributeRow>
                          <AttributeLabel>Location:</AttributeLabel>
                          <AttributeValue>
                            {combination.attributes.location.before || 'N/A'} → {combination.attributes.location.after || 'N/A'}
                          </AttributeValue>
                        </AttributeRow>
                        <AttributeRow>
                          <AttributeLabel>Division:</AttributeLabel>
                          <AttributeValue>
                            {combination.attributes.division.before || 'N/A'} → {combination.attributes.division.after || 'N/A'}
                          </AttributeValue>
                        </AttributeRow>
                        <AttributeRow>
                          <AttributeLabel>Purpose:</AttributeLabel>
                          <AttributeValue>
                            {combination.attributes.purpose.before || 'N/A'} → {combination.attributes.purpose.after || 'N/A'}
                          </AttributeValue>
                        </AttributeRow>
                        <AttributeRow>
                          <AttributeLabel>Output:</AttributeLabel>
                          <AttributeValue>
                            {combination.attributes.output.before || 'N/A'} → {combination.attributes.output.after || 'N/A'}
                          </AttributeValue>
                        </AttributeRow>
                        {combination.conditions.before && (
                          <AttributeRow>
                            <AttributeLabel>Conditions:</AttributeLabel>
                            <AttributeValue>
                              {combination.conditions.before} → {combination.conditions.after}
                            </AttributeValue>
                          </AttributeRow>
                        )}
                        {combination.remediations.before && (
                          <AttributeRow>
                            <AttributeLabel>Remediations:</AttributeLabel>
                            <AttributeValue>
                              {combination.remediations.before} → {combination.remediations.after}
                            </AttributeValue>
                          </AttributeRow>
                        )}
                        {combination.endUserRequirements.before && (
                          <AttributeRow>
                            <AttributeLabel>End User Requirements:</AttributeLabel>
                            <AttributeValue>
                              {combination.endUserRequirements.before} → {combination.endUserRequirements.after}
                            </AttributeValue>
                          </AttributeRow>
                        )}
                      </CombinationItem>
                    ))}
                  </DataSubjectCard>
                ))}
              </DataSubjectsSection>
            </>
          )}

          {(submission.status === 'PENDING' || submission.status === 'UNDER_REVIEW') && (
            <ButtonGroup>
              <Button variant="reject" onClick={handleReject}>
                Reject
              </Button>
              <Button variant="approve" onClick={handleApprove}>
                Approve
              </Button>
            </ButtonGroup>
          )}
        </Content>
      </Sidebar>
    </Overlay>
  );
};

export default SubmissionSidebar;
