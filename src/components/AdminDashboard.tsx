import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Evidence, Transfer, ReviewDecision } from '../types/index';
import { useEvidenceApi } from '../hooks/useEvidenceApi';
import ReviewDrawer from './ReviewDrawer';
import StatusChip from './StatusChip';
import AdminAIInsights from './AdminAIInsights';
import StyledSelect from './common/StyledSelect';

const DashboardContainer = styled.div`
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Tabs = styled.div`
  display: flex;
  gap: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  margin-bottom: 2rem;
  width: 100%;
  z-index: 1;
  border: 2px solid #e1e5e9;
  min-height: 60px;
`;

const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 1rem 1.5rem;
  border: none;
  background: ${props => props.$active ? '#222' : 'white'};
  color: ${props => props.$active ? 'white' : '#222'};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
  position: relative;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  visibility: visible;
  opacity: 1;
  white-space: nowrap;
  
  &:hover {
    background: ${props => props.$active ? '#444' : '#f8f9fa'};
    transform: ${props => props.$active ? 'none' : 'translateY(-1px)'};
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:first-child {
    border-top-left-radius: 10px;
    border-bottom-left-radius: 10px;
  }
  
  &:last-child {
    border-top-right-radius: 10px;
    border-bottom-right-radius: 10px;
  }
`;

const Section = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  padding: 1.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #222;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 0.5rem;
`;

const Filters = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const FilterLabel = styled.label`
  font-size: 0.8rem;
  font-weight: 500;
  color: #666;
`;

const SelectWrapper = styled.div`
  min-width: 150px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
`;

const Th = styled.th`
  background: #f8f8f8;
  padding: 1rem;
  text-align: left;
  font-weight: 500;
  color: #333;
  border-bottom: 2px solid #eee;
  white-space: nowrap;
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #eee;
  color: #666;
  vertical-align: middle;
`;

const Tr = styled.tr`
  &:hover {
    background: #f9f9f9;
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid ${props => props.variant === 'primary' ? '#222' : '#ccc'};
  background: ${props => props.variant === 'primary' ? '#222' : 'white'};
  color: ${props => props.variant === 'primary' ? 'white' : '#222'};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;

  &:hover {
    background: ${props => props.variant === 'primary' ? '#444' : '#f8f8f8'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const NoDataMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #666;
  font-size: 0.9rem;
`;

const LoadingMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #666;
  font-size: 0.9rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 600;
  color: #222;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

type TabType = 'evidence-queue' | 'my-reviews' | 'all-transfers' | 'ai-insights';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('evidence-queue');
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
  const [showReviewDrawer, setShowReviewDrawer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    jurisdiction: '',
    entity: ''
  });

  const { getTransfers, submitReviewDecision, getAllEvidence } = useEvidenceApi();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'evidence-queue') {
          // Load all evidence for filtering
          const evidence = await getAllEvidence();
          setAllEvidence(evidence);
        } else if (activeTab === 'all-transfers') {
          const transferData = await getTransfers();
          setTransfers(transferData);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [activeTab, getAllEvidence, getTransfers]);

  const handleReviewClick = (evidence: Evidence) => {
    setSelectedEvidence(evidence);
    setShowReviewDrawer(true);
  };

  const handleReviewDecision = async (decision: ReviewDecision) => {
    try {
      await submitReviewDecision(decision);
      setShowReviewDrawer(false);
      setSelectedEvidence(null);
      
      // Refresh all data
      const allEvidenceData = await getAllEvidence();
      setAllEvidence(allEvidenceData);
      
      // Show success message
      alert(`Evidence ${decision.decision.toLowerCase()}d successfully!`);
    } catch (error) {
      console.error('Failed to submit review decision:', error);
      alert('Failed to submit review decision. Please try again.');
    }
  };

  const [allEvidence, setAllEvidence] = useState<Evidence[]>([]);

  const filteredEvidence = allEvidence.filter(evidence => {
    if (filters.status && evidence.status !== filters.status) return false;
    // Add more filter logic as needed
    return true;
  });

  // All evidence is now loaded in the main useEffect above

  const stats = {
    pending: allEvidence.filter(e => e.status === 'PENDING').length,
    underReview: allEvidence.filter(e => e.status === 'UNDER_REVIEW').length,
    approved: allEvidence.filter(e => e.status === 'APPROVED').length,
    rejected: allEvidence.filter(e => e.status === 'REJECTED').length
  };

  const renderEvidenceQueue = () => (
    <>
      <StatsGrid>
        <StatCard>
          <StatValue>{stats.pending}</StatValue>
          <StatLabel>Pending Review</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.underReview}</StatValue>
          <StatLabel>Under Review</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.approved}</StatValue>
          <StatLabel>Approved</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.rejected}</StatValue>
          <StatLabel>Rejected</StatLabel>
        </StatCard>
      </StatsGrid>

      <Section>
        <SectionTitle>Evidence Queue</SectionTitle>
        
        <Filters>
          <FilterGroup>
            <FilterLabel>Status</FilterLabel>
            <SelectWrapper>
              <StyledSelect
                value={filters.status}
                onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                options={[
                  { value: '', label: 'All Status' },
                  { value: 'PENDING', label: 'Pending' },
                  { value: 'UNDER_REVIEW', label: 'Under Review' },
                  { value: 'APPROVED', label: 'Approved' },
                  { value: 'REJECTED', label: 'Rejected' }
                ]}
                placeholder="All Status"
              />
            </SelectWrapper>
          </FilterGroup>
        </Filters>

        {loading ? (
          <LoadingMessage>Loading evidence...</LoadingMessage>
        ) : filteredEvidence.length > 0 ? (
          <Table>
            <thead>
              <tr>
                <Th>Transfer ID</Th>
                <Th>Requirement</Th>
                <Th>Submitted By</Th>
                <Th>Submitted At</Th>
                <Th>SLA Due</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filteredEvidence.map((evidence) => (
                <Tr key={evidence.id}>
                  <Td>{evidence.requirementId}</Td>
                  <Td>
                    <div>
                      <div style={{ fontWeight: '500' }}>{evidence.filename}</div>
                      {evidence.description && (
                        <div style={{ fontSize: '0.8rem', color: '#888' }}>
                          {evidence.description}
                        </div>
                      )}
                    </div>
                  </Td>
                  <Td>{evidence.uploadedBy}</Td>
                  <Td>{new Date(evidence.uploadedAt).toLocaleDateString()}</Td>
                  <Td>
                    {evidence.uploadedAt ? 
                      new Date(new Date(evidence.uploadedAt).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString() : 
                      'N/A'
                    }
                  </Td>
                  <Td>
                    <StatusChip status={evidence.status} />
                  </Td>
                  <Td>
                    <Button
                      variant="primary"
                      onClick={() => handleReviewClick(evidence)}
                    >
                      Review
                    </Button>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <NoDataMessage>No evidence found for the selected filter</NoDataMessage>
        )}
      </Section>
    </>
  );

  const renderMyReviews = () => {
    // Filter evidence reviewed by current admin
    const myReviewedEvidence = allEvidence.filter(e => 
      e.reviewerId === 'current-admin' && 
      (e.status === 'APPROVED' || e.status === 'REJECTED' || e.status === 'ESCALATED')
    );

    return (
      <Section>
        <SectionTitle>My Reviews</SectionTitle>
        {loading ? (
          <LoadingMessage>Loading reviews...</LoadingMessage>
        ) : myReviewedEvidence.length > 0 ? (
          <Table>
            <thead>
              <tr>
                <Th>File Name</Th>
                <Th>Requirement</Th>
                <Th>Decision</Th>
                <Th>Review Comments</Th>
                <Th>Reviewed At</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {myReviewedEvidence.map((evidence) => (
                <Tr key={evidence.id}>
                  <Td>
                    <div>
                      <div style={{ fontWeight: '500' }}>{evidence.filename}</div>
                      <div style={{ fontSize: '0.8rem', color: '#888' }}>
                        {evidence.description}
                      </div>
                    </div>
                  </Td>
                  <Td>{evidence.requirementId}</Td>
                  <Td>
                    <StatusChip status={evidence.status} />
                  </Td>
                  <Td>
                    <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {evidence.reviewerNote || 'No comments'}
                    </div>
                  </Td>
                  <Td>
                    {evidence.reviewedAt ? new Date(evidence.reviewedAt).toLocaleDateString() : 'N/A'}
                  </Td>
                  <Td>
                    <Button
                      variant="secondary"
                      onClick={() => handleReviewClick(evidence)}
                    >
                      View Details
                    </Button>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <NoDataMessage>No reviews found</NoDataMessage>
        )}
      </Section>
    );
  };

  const renderAllTransfers = () => (
    <Section>
      <SectionTitle>All Transfers</SectionTitle>
      {loading ? (
        <LoadingMessage>Loading transfers...</LoadingMessage>
      ) : transfers.length > 0 ? (
        <Table>
          <thead>
            <tr>
              <Th>Transfer Name</Th>
              <Th>Jurisdiction</Th>
              <Th>Entity</Th>
              <Th>Subject Type</Th>
              <Th>Status</Th>
              <Th>Created At</Th>
              <Th>Requirements</Th>
            </tr>
          </thead>
          <tbody>
            {transfers.map((transfer) => (
              <Tr key={transfer.id}>
                <Td>{transfer.name}</Td>
                <Td>{transfer.jurisdiction}</Td>
                <Td>{transfer.entity}</Td>
                <Td>{transfer.subjectType}</Td>
                <Td>
                  <StatusChip status={transfer.status as any} />
                </Td>
                <Td>{new Date(transfer.createdAt).toLocaleDateString()}</Td>
                <Td>{transfer.requirements.length}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <NoDataMessage>No transfers found</NoDataMessage>
      )}
    </Section>
  );

  return (
    <DashboardContainer>
      <Tabs>
        <Tab
          $active={activeTab === 'evidence-queue'}
          onClick={() => setActiveTab('evidence-queue')}
        >
          Evidence Queue
        </Tab>
        <Tab
          $active={activeTab === 'my-reviews'}
          onClick={() => setActiveTab('my-reviews')}
        >
          My Reviews
        </Tab>
        <Tab
          $active={activeTab === 'all-transfers'}
          onClick={() => setActiveTab('all-transfers')}
        >
          All Transfers
        </Tab>
        <Tab
          $active={activeTab === 'ai-insights'}
          onClick={() => setActiveTab('ai-insights')}
        >
          AI Insights
        </Tab>
      </Tabs>

      {activeTab === 'evidence-queue' && renderEvidenceQueue()}
      {activeTab === 'my-reviews' && renderMyReviews()}
      {activeTab === 'all-transfers' && renderAllTransfers()}
      {activeTab === 'ai-insights' && <AdminAIInsights />}

      {showReviewDrawer && selectedEvidence && (
        <ReviewDrawer
          evidence={selectedEvidence}
          onClose={() => setShowReviewDrawer(false)}
          onDecision={handleReviewDecision}
        />
      )}
    </DashboardContainer>
  );
};

export default AdminDashboard;
