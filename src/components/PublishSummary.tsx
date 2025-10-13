import React, { useState } from 'react';
import styled from 'styled-components';
import SubmissionSidebar from './SubmissionSidebar';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: relative;
`;

const MainContent = styled.div<{ $sidebarOpen: boolean }>`
  display: flex;
  gap: 1rem;
  transition: all 0.3s ease;
  
  ${props => props.$sidebarOpen && `
    .table-container {
      width: 50%;
    }
  `}
`;

const TableContainer = styled.div`
  flex: 1;
  transition: width 0.3s ease;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #222;
  margin-bottom: 1rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  color: #222;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const Th = styled.th`
  background: #f8f9fa;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #e9ecef;
  font-size: 0.875rem;
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
  color: #666;
  vertical-align: middle;
`;

const Tr = styled.tr`
  &:hover {
    background: #f8f9fa;
  }
  
  &:last-child td {
    border-bottom: none;
  }
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

const ActionButton = styled.button<{ variant: 'approve' | 'reject' }>`
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-right: 0.5rem;
  
  ${props => props.variant === 'approve' 
    ? 'background: #10b981; color: white; &:hover { background: #059669; }'
    : 'background: #ef4444; color: white; &:hover { background: #dc2626; }'
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #666;
  font-size: 0.875rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const ClickableSubmissionId = styled.button`
  background: none;
  border: none;
  color: #2563eb;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  font-size: inherit;
  padding: 0;
  
  &:hover {
    color: #1d4ed8;
    text-decoration: none;
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

const mockEntityData: EntitySubmission[] = [
  {
    submissionId: 'SUB-001',
    entityName: 'XYZ-Entity',
    entityId: 'xyz-123',
    status: 'PENDING',
    submittedAt: '2024-01-15',
    submittedBy: 'John Smith',
    entityData: {
      id: 'xyz-123',
      name: 'XYZ-Entity',
      jurisdiction: 'Germany',
      updatedCount: 12,
      lastUpdated: '2025-10-01',
      dataSubjects: [
        {
          type: 'Client',
          count: 6,
          combinations: [
            {
              id: 'c-001',
              recipient: 'Service Provider',
              attributes: {
                location: { before: 'Inside Country', after: 'Outside Country' },
                division: { before: 'GWM', after: 'AM' },
                purpose: { before: 'KYC', after: 'KYC, Compliance' },
                output: { before: 'OK', after: 'NOK' }
              },
              conditions: { before: 'Transfer only within EU', after: 'Transfer within EU + Switzerland, Norway, Iceland, and Liechtenstein with additional safeguards for third countries' },
              remediations: { before: 'Submit monthly compliance check', after: 'Submit quarterly compliance check with detailed risk assessment and mitigation strategies including data protection impact assessment' },
              endUserRequirements: { before: null, after: 'Provide ID proof' }
            },
            {
              id: 'c-002',
              recipient: 'Third Party',
              attributes: {
                location: { before: null, after: 'Outside Country' },
                division: { before: 'AM', after: 'AM' },
                purpose: { before: null, after: 'Compliance' },
                output: { before: null, after: 'NOK' }
              },
              conditions: { before: null, after: 'Must meet GDPR rules and demonstrate adequate level of protection including technical and organizational measures' },
              remediations: { before: null, after: 'Perform comprehensive DPIA including risk assessment, mitigation strategies, and regular monitoring' },
              endUserRequirements: { before: null, after: 'Notify data subject' }
            }
          ]
        },
        {
          type: 'Employee',
          count: 3,
          combinations: [
            {
              id: 'e-001',
              recipient: 'Service Provider',
              attributes: {
                location: { before: 'Inside Country', after: 'Inside Country' },
                division: { before: 'GWM', after: 'GWM' },
                purpose: { before: 'KYC', after: 'KYC' },
                output: { before: 'OK', after: 'OKC' }
              },
              conditions: { before: 'N/A', after: 'N/A' },
              remediations: { before: 'N/A', after: 'N/A' },
              endUserRequirements: { before: 'N/A', after: 'N/A' }
            }
          ]
        }
      ]
    }
  },
  {
    submissionId: 'SUB-002',
    entityName: 'Tech Solutions Ltd',
    entityId: 'ENT-002',
    status: 'UNDER_REVIEW',
    submittedAt: '2024-01-14',
    submittedBy: 'Sarah Johnson'
  },
  {
    submissionId: 'SUB-003',
    entityName: 'Financial Services Inc',
    entityId: 'ENT-003',
    status: 'APPROVED',
    submittedAt: '2024-01-13',
    submittedBy: 'Mike Wilson'
  },
  {
    submissionId: 'SUB-004',
    entityName: 'Healthcare Partners',
    entityId: 'ENT-004',
    status: 'REJECTED',
    submittedAt: '2024-01-12',
    submittedBy: 'Emily Davis'
  },
  {
    submissionId: 'SUB-005',
    entityName: 'Retail Chain Corp',
    entityId: 'ENT-005',
    status: 'PENDING',
    submittedAt: '2024-01-11',
    submittedBy: 'David Brown'
  },
  {
    submissionId: 'SUB-006',
    entityName: 'Energy Solutions Group',
    entityId: 'ENT-006',
    status: 'UNDER_REVIEW',
    submittedAt: '2024-01-10',
    submittedBy: 'Lisa Anderson'
  },
  {
    submissionId: 'SUB-007',
    entityName: 'Transportation Services',
    entityId: 'ENT-007',
    status: 'PENDING',
    submittedAt: '2024-01-09',
    submittedBy: 'Robert Taylor'
  },
  {
    submissionId: 'SUB-008',
    entityName: 'Education Foundation',
    entityId: 'ENT-008',
    status: 'APPROVED',
    submittedAt: '2024-01-08',
    submittedBy: 'Jennifer White'
  }
];

const PublishSummary: React.FC = () => {
  const [submissions, setSubmissions] = useState<EntitySubmission[]>(mockEntityData);
  const [selectedSubmission, setSelectedSubmission] = useState<EntitySubmission | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleApprove = (submissionId: string) => {
    setSubmissions(prev => 
      prev.map(submission => 
        submission.submissionId === submissionId 
          ? { ...submission, status: 'APPROVED' as const }
          : submission
      )
    );
    
    // Update selected submission if it's the one being approved
    if (selectedSubmission?.submissionId === submissionId) {
      setSelectedSubmission(prev => prev ? { ...prev, status: 'APPROVED' as const } : null);
    }
  };

  const handleReject = (submissionId: string) => {
    setSubmissions(prev => 
      prev.map(submission => 
        submission.submissionId === submissionId 
          ? { ...submission, status: 'REJECTED' as const }
          : submission
      )
    );
    
    // Update selected submission if it's the one being rejected
    if (selectedSubmission?.submissionId === submissionId) {
      setSelectedSubmission(prev => prev ? { ...prev, status: 'REJECTED' as const } : null);
    }
  };

  const handleSubmissionClick = (submission: EntitySubmission) => {
    setSelectedSubmission(submission);
    setSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
    setSelectedSubmission(null);
  };

  const stats = {
    total: submissions.length,
    pending: submissions.filter(s => s.status === 'PENDING').length,
    underReview: submissions.filter(s => s.status === 'UNDER_REVIEW').length,
    approved: submissions.filter(s => s.status === 'APPROVED').length,
    rejected: submissions.filter(s => s.status === 'REJECTED').length
  };

  return (
    <Container>
      <Title>Publish Summary</Title>
      
      <StatsGrid>
        <StatCard>
          <StatValue>{stats.total}</StatValue>
          <StatLabel>Total Submissions</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.pending}</StatValue>
          <StatLabel>Pending</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.underReview}</StatValue>
          <StatLabel>Under Review</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.approved}</StatValue>
          <StatLabel>Approved</StatLabel>
        </StatCard>
      </StatsGrid>

      <MainContent $sidebarOpen={sidebarOpen}>
        <TableContainer className="table-container">
          {submissions.length > 0 ? (
            <Table>
              <thead>
                <tr>
                  <Th>Submission ID</Th>
                  <Th>Entity Name</Th>
                  <Th>Entity ID</Th>
                  <Th>Status</Th>
                  <Th>Submitted By</Th>
                  <Th>Submitted At</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission) => (
                  <Tr key={submission.submissionId}>
                    <Td>
                      <ClickableSubmissionId
                        onClick={() => handleSubmissionClick(submission)}
                      >
                        {submission.submissionId}
                      </ClickableSubmissionId>
                    </Td>
                    <Td>{submission.entityName}</Td>
                    <Td>{submission.entityId}</Td>
                    <Td>
                      <StatusChip status={submission.status}>
                        {submission.status}
                      </StatusChip>
                    </Td>
                    <Td>{submission.submittedBy}</Td>
                    <Td>{new Date(submission.submittedAt).toLocaleDateString()}</Td>
                    <Td>
                      {submission.status === 'PENDING' || submission.status === 'UNDER_REVIEW' ? (
                        <>
                          <ActionButton
                            variant="approve"
                            onClick={() => handleApprove(submission.submissionId)}
                          >
                            Approve
                          </ActionButton>
                          <ActionButton
                            variant="reject"
                            onClick={() => handleReject(submission.submissionId)}
                          >
                            Reject
                          </ActionButton>
                        </>
                      ) : (
                        <span style={{ color: '#666', fontSize: '0.875rem' }}>
                          {submission.status === 'APPROVED' ? '✓ Approved' : '✗ Rejected'}
                        </span>
                      )}
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <EmptyState>
              No entity submissions found
            </EmptyState>
          )}
        </TableContainer>
      </MainContent>

      <SubmissionSidebar
        isOpen={sidebarOpen}
        submission={selectedSubmission}
        onClose={handleCloseSidebar}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </Container>
  );
};

export default PublishSummary;
