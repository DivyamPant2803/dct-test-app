import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Evidence, ReviewDecision } from '../types/index';
import { useEvidenceApi } from '../hooks/useEvidenceApi';
import ReviewDrawer from './ReviewDrawer';
import StatusChip from './StatusChip';
import LegalContentDashboard from './LegalContentDashboard';
import LegalTemplates from './LegalTemplates';
import Sidebar, { SidebarGroup } from './common/Sidebar';
import { EscalationTimeline, useToast } from './common';
import { colors } from '../styles/designTokens';
import { FiAlertCircle, FiChevronsUp, FiChevronUp, FiMinus } from 'react-icons/fi';
import { DashboardStats, StatItem } from './common/DashboardStats';

const Container = styled.div`
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

const ContentWrapper = styled.div<{ $isVisible: boolean }>`
  display: ${props => props.$isVisible ? 'flex' : 'none'};
  flex-direction: column;
  gap: 1.5rem;
  flex: 1;
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


const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  flex: 1;
  min-height: 0;
`;

const Th = styled.th`
  background: #f8f8f8;
  padding: 0.75rem 1rem;
  text-align: left;
  font-weight: 500;
  color: #333;
  border-bottom: 2px solid #eee;
  white-space: nowrap;
`;

const Td = styled.td`
  padding: 0.5rem 1rem;
  border-bottom: 1px solid #eee;
  color: #666;
  vertical-align: top;
`;

const Tr = styled.tr`
  &:hover {
    background: #f9f9f9;
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  border: 1px solid ${props => props.variant === 'primary' ? '#222' : '#ccc'};
  background: ${props => props.variant === 'primary' ? '#222' : 'white'};
  color: ${props => props.variant === 'primary' ? 'white' : '#222'};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.8rem;

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



const PriorityBadge = styled.span<{ $priority: 'high' | 'medium' | 'low' }>`
  display: inline-block;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-size: 0.65rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  
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

type SidebarItemType = 'escalated-evidence' | 'content-management' | 'templates';

const LegalReview: React.FC = () => {
  const [activeItem, setActiveItem] = useState<SidebarItemType>('escalated-evidence');
  const [sidebarGroups, setSidebarGroups] = useState<SidebarGroup[]>([
    {
      id: 'escalated-evidence',
      label: 'Escalated Evidence',
      isExpanded: true,
      items: [
        { id: 'escalated-evidence', label: 'Escalated Evidence' }
      ]
    },
    {
      id: 'content-management',
      label: 'Content Management',
      isExpanded: false,
      items: [
        { id: 'content-management', label: 'Content Management' }
      ]
    },
    {
      id: 'templates',
      label: 'Templates',
      isExpanded: false,
      items: [
        { id: 'templates', label: 'Templates' }
      ]
    }
  ]);
  const [escalatedEvidence, setEscalatedEvidence] = useState<Evidence[]>([]);
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
  const [showReviewDrawer, setShowReviewDrawer] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const { getAllEvidence, submitReviewDecision } = useEvidenceApi();

  // Function to refresh escalated evidence
  const refreshEscalatedEvidence = useCallback(async () => {
    try {
      const allEvidence = await getAllEvidence();
      const escalated = allEvidence.filter(e => e.status === 'ESCALATED');
      setEscalatedEvidence(escalated);
      console.log('Refreshed escalated evidence:', escalated);
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
      showToast(`Evidence ${decision.decision.toLowerCase()}d successfully!`, 'success');
    } catch (error) {
      console.error('Failed to submit review decision:', error);
      showToast('Failed to submit review decision. Please try again.', 'error');
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

  const renderEscalatedEvidence = () => {
    const statItems: StatItem[] = [
      {
        label: 'Total Escalations',
        value: stats.total,
        icon: <FiAlertCircle />,
        color: colors.status.escalated,
        subtext: 'Pending legal review'
      },
      {
        label: 'High Priority',
        value: stats.highPriority,
        icon: <FiChevronsUp />,
        color: colors.semantic.error,
        subtext: '> 7 days old',
        highlight: stats.highPriority > 0
      },
      {
        label: 'Medium Priority',
        value: stats.mediumPriority,
        icon: <FiChevronUp />,
        color: colors.semantic.warning,
        subtext: '3-7 days old'
      },
      {
        label: 'Low Priority',
        value: stats.lowPriority,
        icon: <FiMinus />,
        color: colors.status.approved,
        subtext: '< 3 days old'
      }
    ];

    return (
      <>
        <DashboardStats items={statItems} />

      <Section>
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
                    <div style={{ lineHeight: '1.3' }}>
                      <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>{evidence.filename}</div>
                      {evidence.description && (
                        <div style={{ fontSize: '0.75rem', color: '#888' }}>
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
          <NoDataMessage>No evidence escalated for legal review</NoDataMessage>
        )}
      </Section>
    </>
  );
  };



  return (
    <Container>
      <SidebarWrapper>
        <Sidebar
          groups={sidebarGroups}
          activeItemId={activeItem}
          onItemClick={handleSidebarItemClick}
          onGroupToggle={handleSidebarGroupToggle}
        />
      </SidebarWrapper>
      
      <MainContent>
        <ContentWrapper $isVisible={activeItem === 'escalated-evidence'}>
          {renderEscalatedEvidence()}
        </ContentWrapper>
        
        <ContentWrapper $isVisible={activeItem === 'content-management'}>
          <LegalContentDashboard />
        </ContentWrapper>
        
        <ContentWrapper $isVisible={activeItem === 'templates'}>
          <LegalTemplates />
        </ContentWrapper>
      </MainContent>

      {showReviewDrawer && selectedEvidence && (
        <ReviewDrawer
          evidence={selectedEvidence}
          onClose={() => setShowReviewDrawer(false)}
          onDecision={handleReviewDecision}
          hideEscalateButton={true}
        />
      )}
      
      {/* Show escalation timeline when evidence is selected but drawer is not open */}
      {selectedEvidence && !showReviewDrawer && (
        <EscalationTimeline evidence={selectedEvidence} />
      )}
    </Container>
  );
};

export default LegalReview;
