import React from 'react';
import styled from 'styled-components';

const StatsContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  padding: 1rem;
  margin-bottom: 0.75rem;
  flex-shrink: 0;
`;

const StatsRow = styled.div`
  display: flex;
  gap: 1rem;
`;

const StatCard = styled.div<{ $variant?: 'success' | 'warning' | 'danger' }>`
  padding: 0.75rem;
  border-radius: 6px;
  background: ${props => {
    switch (props.$variant) {
      case 'success': return '#d1fae5';
      case 'warning': return '#fef3c7';
      case 'danger': return '#fee2e2';
      default: return '#f8f9fa';
    }
  }};
  border: 1px solid ${props => {
    switch (props.$variant) {
      case 'success': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'danger': return '#ef4444';
      default: return '#e9ecef';
    }
  }};
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  color: #222;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.8rem;
  color: #666;
`;

const TotalCountText = styled.div`
  font-size: 0.75rem;
  color: #888;
  margin-top: 0.5rem;
  text-align: center;
`;

interface StatsSummary {
  totalRequirements: number;
  currentCount: number;
  dueSoonCount: number;
  overdueCount: number;
}

interface StatsSectionProps {
  summary: StatsSummary;
}

const StatsSection: React.FC<StatsSectionProps> = ({ summary }) => {
  return (
    <StatsContainer>
      <StatsRow>
        <StatCard $variant="success">
          <StatValue>{summary.currentCount.toLocaleString()}</StatValue>
          <StatLabel>Current</StatLabel>
        </StatCard>
        <StatCard $variant="warning">
          <StatValue>{summary.dueSoonCount.toLocaleString()}</StatValue>
          <StatLabel>Due Soon</StatLabel>
        </StatCard>
        <StatCard $variant="danger">
          <StatValue>{summary.overdueCount.toLocaleString()}</StatValue>
          <StatLabel>Overdue</StatLabel>
        </StatCard>
      </StatsRow>
      <TotalCountText>
        Total: {summary.totalRequirements.toLocaleString()} requirements
      </TotalCountText>
    </StatsContainer>
  );
};

export default StatsSection;
