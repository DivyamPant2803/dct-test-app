import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Evidence, ReviewDecision } from '../types/index';
import { useEvidenceApi } from '../hooks/useEvidenceApi';
import ReviewDrawer from './ReviewDrawer';
import StatusChip from './StatusChip';

const Container = styled.div`
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
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

const LegalReview: React.FC = () => {
  const [escalatedEvidence, setEscalatedEvidence] = useState<Evidence[]>([]);
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
  const [showReviewDrawer, setShowReviewDrawer] = useState(false);
  const [loading, setLoading] = useState(false);

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
      alert(`Evidence ${decision.decision.toLowerCase()}d successfully!`);
    } catch (error) {
      console.error('Failed to submit review decision:', error);
      alert('Failed to submit review decision. Please try again.');
    }
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

  return (
    <Container>
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
        <SectionTitle>Escalated Evidence for Legal Review</SectionTitle>
        
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
          <NoDataMessage>No evidence escalated for legal review</NoDataMessage>
        )}
      </Section>

      {showReviewDrawer && selectedEvidence && (
        <ReviewDrawer
          evidence={selectedEvidence}
          onClose={() => setShowReviewDrawer(false)}
          onDecision={handleReviewDecision}
          hideEscalateButton={true}
        />
      )}
    </Container>
  );
};

export default LegalReview;
