import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Evidence, ReviewDecision } from '../types/index';
import { useEvidenceApi } from '../hooks/useEvidenceApi';
import ReviewDrawer from './ReviewDrawer';
import StatusChip from './StatusChip';
import Sidebar, { SidebarGroup } from './common/Sidebar';

const DashboardContainer = styled.div`
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  display: flex;
`;

const SidebarWrapper = styled.div`
  flex-shrink: 0;
`;

const MainContent = styled.div`
  flex: 1;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  overflow-y: auto;
  min-height: 0;
`;

const Section = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  padding: 1.25rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #222;
  margin-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 0.5rem;
  flex-shrink: 0;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  flex: 1;
  min-height: 0;
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
  border: 1px solid ${props => props.variant === 'primary' ? '#2196F3' : '#ccc'};
  background: ${props => props.variant === 'primary' ? '#2196F3' : 'white'};
  color: ${props => props.variant === 'primary' ? 'white' : '#222'};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;

  &:hover {
    background: ${props => props.variant === 'primary' ? '#1976D2' : '#f8f8f8'};
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
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  flex-shrink: 0;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.25rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.75rem;
  font-weight: 600;
  color: #2196F3;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const PriorityBadge = styled.span<{ $priority: 'high' | 'medium' | 'low' }>`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  background-color: ${props => {
    switch (props.$priority) {
      case 'high':
        return '#F44336';
      case 'medium':
        return '#FFA000';
      case 'low':
        return '#4CAF50';
      default:
        return '#666';
    }
  }};
  
  color: white;
`;

type SidebarItemType = 'escalated-evidence' | 'process-reviews' | 'business-analytics';

const BusinessDashboard: React.FC = () => {
  const [activeItem, setActiveItem] = useState<SidebarItemType>('escalated-evidence');
  const [sidebarGroups, setSidebarGroups] = useState<SidebarGroup[]>([
    {
      id: 'business-dashboard',
      label: 'Business Dashboard',
      isExpanded: true,
      items: [
        { id: 'escalated-evidence', label: 'Escalated Evidence' },
        { id: 'process-reviews', label: 'Process Reviews' },
        { id: 'business-analytics', label: 'Business Analytics' }
      ]
    }
  ]);
  const [escalatedEvidence, setEscalatedEvidence] = useState<Evidence[]>([]);
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
  const [showReviewDrawer, setShowReviewDrawer] = useState(false);
  const [loading, setLoading] = useState(false);

  const { getAllEvidence, submitReviewDecision } = useEvidenceApi();

  // Function to refresh escalated evidence
  const refreshEscalatedEvidence = useCallback(async () => {
    try {
      const allEvidence = await getAllEvidence();
      const escalated = allEvidence.filter(e => e.status === 'ESCALATED' && e.escalatedTo === 'Business');
      setEscalatedEvidence(escalated);
      console.log('Refreshed escalated evidence for Business:', escalated);
    } catch (error) {
      console.error('Failed to refresh escalated evidence:', error);
    }
  }, [getAllEvidence]);

  useEffect(() => {
    const loadEscalatedEvidence = async () => {
      setLoading(true);
      try {
        await refreshEscalatedEvidence();
      } catch (error) {
        console.error('Failed to load escalated evidence:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEscalatedEvidence();
  }, [refreshEscalatedEvidence]);

  // Refresh data periodically to catch new escalations
  useEffect(() => {
    const interval = setInterval(() => {
      refreshEscalatedEvidence();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [refreshEscalatedEvidence]);

  const handleReviewClick = (evidence: Evidence) => {
    setSelectedEvidence(evidence);
    setShowReviewDrawer(true);
  };

  const handleReviewDecision = async (decision: ReviewDecision) => {
    try {
      await submitReviewDecision(decision);
      setShowReviewDrawer(false);
      setSelectedEvidence(null);
      
      // Refresh the escalated evidence list
      await refreshEscalatedEvidence();
      
      // Show success message
      alert(`Evidence ${decision.decision.toLowerCase()}d successfully!`);
    } catch (error) {
      console.error('Failed to submit review decision:', error);
      alert('Failed to submit review decision. Please try again.');
    }
  };

  const handleSidebarItemClick = (itemId: string) => {
    setActiveItem(itemId as SidebarItemType);
  };

  const handleSidebarGroupToggle = (groupId: string) => {
    setSidebarGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, isExpanded: !group.isExpanded }
        : group
    ));
  };

  const getPriority = (evidence: Evidence): 'high' | 'medium' | 'low' => {
    // Simple priority logic based on upload date
    const uploadDate = new Date(evidence.uploadedAt);
    const daysSinceUpload = (Date.now() - uploadDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceUpload > 7) return 'high';
    if (daysSinceUpload > 3) return 'medium';
    return 'low';
  };

  const stats = {
    total: escalatedEvidence.length,
    highPriority: escalatedEvidence.filter(e => getPriority(e) === 'high').length,
    mediumPriority: escalatedEvidence.filter(e => getPriority(e) === 'medium').length,
    lowPriority: escalatedEvidence.filter(e => getPriority(e) === 'low').length
  };

  const renderEscalatedEvidence = () => (
    <>
      <StatsGrid>
        <StatCard>
          <StatValue>{stats.total}</StatValue>
          <StatLabel>Total Escalations</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.highPriority}</StatValue>
          <StatLabel>High Priority</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.mediumPriority}</StatValue>
          <StatLabel>Medium Priority</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.lowPriority}</StatValue>
          <StatLabel>Low Priority</StatLabel>
        </StatCard>
      </StatsGrid>

      <Section>
        <SectionTitle>Escalated Evidence for Business Review</SectionTitle>
        
        {loading ? (
          <LoadingMessage>Loading escalated evidence...</LoadingMessage>
        ) : escalatedEvidence.length > 0 ? (
          <Table>
            <thead>
              <tr>
                <Th>Transfer ID</Th>
                <Th>Requirement</Th>
                <Th>Submitted By</Th>
                <Th>Submitted At</Th>
                <Th>Priority</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {escalatedEvidence.map((evidence) => (
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
                    <PriorityBadge $priority={getPriority(evidence)}>
                      {getPriority(evidence)}
                    </PriorityBadge>
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
          <NoDataMessage>No evidence escalated for business review</NoDataMessage>
        )}
      </Section>
    </>
  );

  const renderProcessReviews = () => (
    <Section>
      <SectionTitle>Process Reviews</SectionTitle>
      <NoDataMessage>Process Reviews functionality coming soon</NoDataMessage>
    </Section>
  );

  const renderBusinessAnalytics = () => (
    <Section>
      <SectionTitle>Business Analytics</SectionTitle>
      <NoDataMessage>Business Analytics functionality coming soon</NoDataMessage>
    </Section>
  );

  const renderContent = () => {
    switch (activeItem) {
      case 'escalated-evidence':
        return renderEscalatedEvidence();
      case 'process-reviews':
        return renderProcessReviews();
      case 'business-analytics':
        return renderBusinessAnalytics();
      default:
        return renderEscalatedEvidence();
    }
  };

  return (
    <DashboardContainer>
      <SidebarWrapper>
        <Sidebar
          groups={sidebarGroups}
          activeItemId={activeItem}
          onItemClick={handleSidebarItemClick}
          onGroupToggle={handleSidebarGroupToggle}
        />
      </SidebarWrapper>
      
      <MainContent>
        {renderContent()}
      </MainContent>

      {showReviewDrawer && selectedEvidence && (
        <ReviewDrawer
          evidence={selectedEvidence}
          onClose={() => setShowReviewDrawer(false)}
          onDecision={handleReviewDecision}
          hideEscalateButton={true}
        />
      )}
    </DashboardContainer>
  );
};

export default BusinessDashboard;
