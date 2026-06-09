import React from 'react';
import styled from 'styled-components';
import { Card } from '../../../shared/types';
import { useCardData } from '../hooks/useCardData';

// Icon circle config per provider key — matching the mockup's colored circles
const PROVIDER_ICON: Record<string, { bg: string; color: string; icon: string }> = {
  'total-requests':         { bg: '#fee2e2', color: '#c5152a', icon: '📋' },
  'pending-approvals':      { bg: '#fff7ed', color: '#ea580c', icon: '⏳' },
  'active-transfers':       { bg: '#eff6ff', color: '#2563eb', icon: '🔄' },
  'completed-30d':          { bg: '#f0fdf4', color: '#16a34a', icon: '✅' },
  'sla-performance':        { bg: '#fdf4ff', color: '#9333ea', icon: '📊' },
  'escalations':            { bg: '#fff7ed', color: '#dc2626', icon: '⚠️' },
  'team-workload':          { bg: '#f0f9ff', color: '#0284c7', icon: '👥' },
  'approval-queue':         { bg: '#fff7ed', color: '#ea580c', icon: '📥' },
  'my-open-requests':       { bg: '#fee2e2', color: '#c5152a', icon: '📝' },
  'requests-awaiting-action':{ bg: '#fef9c3', color: '#ca8a04', icon: '⏰' },
  'recently-completed':     { bg: '#f0fdf4', color: '#16a34a', icon: '✅' },
  'transfer-status-summary':{ bg: '#eff6ff', color: '#2563eb', icon: '📈' },
};

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.25rem 0 0.5rem;
`;

const IconCircle = styled.div<{ bg: string }>`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: ${({ bg }) => bg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
`;

const Stats = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
`;

const Value = styled.div`
  font-size: 1.9rem;
  font-weight: 800;
  color: #111827;
  line-height: 1;
  letter-spacing: -0.02em;
`;

const Trend = styled.div<{ positive: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 0.72rem;
  font-weight: 600;
  color: ${({ positive }) => (positive ? '#16a34a' : '#dc2626')};
`;

const TrendDot = styled.span<{ positive: boolean }>`
  font-size: 0.65rem;
`;

const ErrorMsg = styled.div`
  color: #9ca3af;
  font-size: 0.82rem;
  padding: 0.75rem 0;
`;

const SkeletonWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.25rem 0 0.5rem;
`;

const SkeletonCircle = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  flex-shrink: 0;
  @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
`;

const SkeletonLine = styled.div<{ w?: string; h?: string }>`
  width: ${({ w }) => w ?? '100%'};
  height: ${({ h }) => h ?? '14px'};
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 4px;
  @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
`;

interface Props { card: Card }

const MetricCard: React.FC<Props> = ({ card }) => {
  const { data, isLoading, isError } = useCardData(card.id);
  const providerKey = card.dataProviderKey ?? '';
  const iconCfg = PROVIDER_ICON[providerKey] ?? { bg: '#f3f4f6', color: '#6b7280', icon: '📊' };

  if (isLoading) {
    return (
      <SkeletonWrapper>
        <SkeletonCircle />
        <div style={{ flex: 1 }}>
          <SkeletonLine w="60px" h="36px" />
          <SkeletonLine w="120px" h="12px" />
        </div>
      </SkeletonWrapper>
    );
  }

  if (isError || data?.error) return <ErrorMsg>Data unavailable</ErrorMsg>;

  const format = (card.settings?.format as string) ?? 'integer';
  const raw = data?.value;
  const formatted =
    raw === null || raw === undefined ? '—'
    : format === 'integer' ? Number(raw).toLocaleString()
    : String(raw);

  const trend = data?.trend;
  const trendPositive = trend ? trend.deltaPct >= 0 : true;

  return (
    <Wrapper>
      <IconCircle bg={iconCfg.bg} aria-hidden="true">
        {iconCfg.icon}
      </IconCircle>
      <Stats>
        <Value>{formatted}</Value>
        {trend && (
          <Trend positive={trendPositive}>
            <TrendDot positive={trendPositive}>{trendPositive ? '▲' : '▼'}</TrendDot>
            {Math.abs(trend.deltaPct).toFixed(1)}% vs {trend.vs}
          </Trend>
        )}
      </Stats>
    </Wrapper>
  );
};

export default MetricCard;
