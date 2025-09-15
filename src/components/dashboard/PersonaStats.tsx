import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useEvidenceApi } from '../../hooks/useEvidenceApi';

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

// const StatIcon = styled.div<{ $color: string }>`
//   font-size: 2rem;
//   margin-bottom: 0.5rem;
//   color: ${props => props.$color};
// `;

interface PersonaStatsProps {
  persona: string;
  escalatedTo?: string;
}

const PersonaStats: React.FC<PersonaStatsProps> = ({ persona, escalatedTo }) => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    underReview: 0,
    approved: 0,
    rejected: 0,
    escalated: 0
  });
  const [loading, setLoading] = useState(false);
  const { getAllEvidence } = useEvidenceApi();

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        const allEvidence = await getAllEvidence();
        
        let filteredEvidence = allEvidence;
        
        // Filter by escalated to specific authority if provided
        if (escalatedTo) {
          filteredEvidence = allEvidence.filter(e => 
            e.status === 'ESCALATED' && 
            (e.escalatedTo === escalatedTo || e.escalatedTo === escalatedTo.toLowerCase())
          );
        }
        
        setStats({
          total: filteredEvidence.length,
          pending: filteredEvidence.filter(e => e.status === 'PENDING').length,
          underReview: filteredEvidence.filter(e => e.status === 'UNDER_REVIEW').length,
          approved: filteredEvidence.filter(e => e.status === 'APPROVED').length,
          rejected: filteredEvidence.filter(e => e.status === 'REJECTED').length,
          escalated: filteredEvidence.filter(e => e.status === 'ESCALATED').length
        });
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [getAllEvidence, escalatedTo]);

  const getStatsForPersona = () => {
    switch (persona) {
      case 'admin':
        return [
          { label: 'Total Evidence', value: stats.total, color: '#FF9800' },
          { label: 'Pending Review', value: stats.pending, color: '#FFA000' },
          { label: 'Under Review', value: stats.underReview, color: '#2196F3' },
          { label: 'Approved', value: stats.approved, color: '#4CAF50' },
          { label: 'Rejected', value: stats.rejected, color: '#F44336' }
        ];
      case 'legal':
        return [
          { label: 'Escalated to Legal', value: stats.escalated, color: '#9C27B0' },
          { label: 'High Priority', value: Math.floor(stats.escalated * 0.3), color: '#F44336' },
          { label: 'Medium Priority', value: Math.floor(stats.escalated * 0.4), color: '#FFA000' },
          { label: 'Low Priority', value: Math.floor(stats.escalated * 0.3), color: '#4CAF50' }
        ];
      case 'business':
        return [
          { label: 'Escalated to Business', value: stats.escalated, color: '#2196F3' },
          { label: 'Process Reviews', value: Math.floor(stats.escalated * 0.6), color: '#2196F3' },
          { label: 'Approvals Pending', value: Math.floor(stats.escalated * 0.4), color: '#FFA000' }
        ];
      case 'diso':
        return [
          { label: 'Escalated to DISO', value: stats.escalated, color: '#F44336' },
          { label: 'Security Reviews', value: Math.floor(stats.escalated * 0.7), color: '#F44336' },
          { label: 'Risk Assessments', value: Math.floor(stats.escalated * 0.3), color: '#FFA000' }
        ];
      case 'finance':
        return [
          { label: 'Escalated to Finance', value: stats.escalated, color: '#4CAF50' },
          { label: 'Budget Reviews', value: Math.floor(stats.escalated * 0.5), color: '#4CAF50' },
          { label: 'Contract Analysis', value: Math.floor(stats.escalated * 0.5), color: '#2196F3' }
        ];
      case 'privacy':
        return [
          { label: 'Escalated to Privacy', value: stats.escalated, color: '#673AB7' },
          { label: 'Data Protection', value: Math.floor(stats.escalated * 0.6), color: '#673AB7' },
          { label: 'Consent Management', value: Math.floor(stats.escalated * 0.4), color: '#4CAF50' }
        ];
      default:
        return [
          { label: 'My Transfers', value: stats.total, color: '#4CAF50' },
          { label: 'Pending', value: stats.pending, color: '#FFA000' },
          { label: 'Approved', value: stats.approved, color: '#4CAF50' }
        ];
    }
  };

  if (loading) {
    return <div>Loading stats...</div>;
  }

  const statsData = getStatsForPersona();

  return (
    <StatsGrid>
      {statsData.map((stat, index) => (
        <StatCard key={index}>
          <StatValue>{stat.value}</StatValue>
          <StatLabel>{stat.label}</StatLabel>
        </StatCard>
      ))}
    </StatsGrid>
  );
};

export default PersonaStats;
