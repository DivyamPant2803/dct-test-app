import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiTrendingUp, FiHelpCircle, FiRefreshCw, FiLoader } from 'react-icons/fi';
import { useAIInsights } from '../hooks/useAIApi';
import { AIInsights } from '../types/index';

const Container = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  padding: 1.5rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #222;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #666;
`;

const LoadingSpinner = styled(FiLoader)`
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  color: #dc2626;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1rem;
`;

const InsightsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const InsightSection = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.25rem;
  border: 1px solid #e9ecef;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #222;
`;

const SectionIcon = styled.div`
  color: #6366f1;
`;

const InsightList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const InsightItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: white;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;

  &:hover {
    background: #f9fafb;
    border-color: #d1d5db;
  }
`;

const InsightText = styled.div`
  font-size: 0.875rem;
  color: #374151;
  font-weight: 500;
`;

const InsightCount = styled.div`
  background: #6366f1;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  min-width: 2rem;
  text-align: center;
`;

const RequirementItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: white;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;

  &:hover {
    background: #f9fafb;
    border-color: #d1d5db;
  }
`;

const RequirementInfo = styled.div`
  flex: 1;
`;

const RequirementTitle = styled.div`
  font-size: 0.875rem;
  color: #374151;
  font-weight: 500;
  margin-bottom: 0.25rem;
`;

const RequirementId = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
`;

const HelpClicks = styled.div`
  background: #f59e0b;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  min-width: 2rem;
  text-align: center;
`;

const PeriodInfo = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
  font-size: 0.875rem;
  color: #6b7280;
  text-align: center;
`;

const EmptyState = styled.div`
  text-align: center;
  color: #9ca3af;
  font-style: italic;
  padding: 2rem;
`;

const AdminAIInsights: React.FC = () => {
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { getInsights, loading: apiLoading, error: apiError } = useAIInsights();

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getInsights('30d');
      if (result) {
        setInsights(result);
      } else {
        setError('Failed to load insights');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load insights');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadInsights();
  };

  if (loading || apiLoading) {
    return (
      <Container>
        <Header>
          <Title>
            <FiTrendingUp />
            AI Insights
          </Title>
        </Header>
        <LoadingContainer>
          <LoadingSpinner />
          Loading AI insights...
        </LoadingContainer>
      </Container>
    );
  }

  if (error || apiError) {
    return (
      <Container>
        <Header>
          <Title>
            <FiTrendingUp />
            AI Insights
          </Title>
          <RefreshButton onClick={handleRefresh}>
            <FiRefreshCw />
            Retry
          </RefreshButton>
        </Header>
        <ErrorMessage>
          {error || apiError}
        </ErrorMessage>
      </Container>
    );
  }

  if (!insights) {
    return (
      <Container>
        <Header>
          <Title>
            <FiTrendingUp />
            AI Insights
          </Title>
        </Header>
        <EmptyState>
          No insights data available
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>
          <FiTrendingUp />
          AI Insights
        </Title>
        <RefreshButton onClick={handleRefresh}>
          <FiRefreshCw />
          Refresh
        </RefreshButton>
      </Header>

      <InsightsGrid>
        <InsightSection>
          <SectionHeader>
            <SectionIcon>
              <FiHelpCircle />
            </SectionIcon>
            Top Asked Intents
          </SectionHeader>
          <InsightList>
            {insights.topAskedIntents.length > 0 ? (
              insights.topAskedIntents.map((intent, index) => (
                <InsightItem key={index}>
                  <InsightText>{intent.intent}</InsightText>
                  <InsightCount>{intent.count}</InsightCount>
                </InsightItem>
              ))
            ) : (
              <EmptyState>No intent data available</EmptyState>
            )}
          </InsightList>
        </InsightSection>

        <InsightSection>
          <SectionHeader>
            <SectionIcon>
              <FiHelpCircle />
            </SectionIcon>
            Requirements Needing Help
          </SectionHeader>
          <InsightList>
            {insights.requirementsNeedingHelp.length > 0 ? (
              insights.requirementsNeedingHelp.map((req, index) => (
                <RequirementItem key={index}>
                  <RequirementInfo>
                    <RequirementTitle>{req.title}</RequirementTitle>
                    <RequirementId>ID: {req.requirementId}</RequirementId>
                  </RequirementInfo>
                  <HelpClicks>{req.helpClicks}</HelpClicks>
                </RequirementItem>
              ))
            ) : (
              <EmptyState>No help data available</EmptyState>
            )}
          </InsightList>
        </InsightSection>
      </InsightsGrid>

      <PeriodInfo>
        Data for the last {insights.period}
      </PeriodInfo>
    </Container>
  );
};

export default AdminAIInsights;
