import React, { lazy, Suspense, Component, ErrorInfo, ReactNode } from 'react';
import styled from 'styled-components';
import { Card, CardType } from '../../shared/types';

const BRAND = '#c5152a';

// Registry: lazy-loaded templates keyed by CardType
const templateRegistry: Partial<Record<CardType, React.LazyExoticComponent<React.FC<{ card: Card }>>>> = {
  RichText: lazy(() => import('./templates/RichTextCard')),
  LinkList: lazy(() => import('./templates/LinkListCard')),
  NoticeList: lazy(() => import('./templates/NoticeListCard')),
  Timeline: lazy(() => import('./templates/TimelineCard')),
  Metric: lazy(() => import('./templates/MetricCard')),
  Chart: lazy(() => import('./templates/ChartCard')),
  ActivityFeed: lazy(() => import('./templates/ActivityFeedCard')),
};

// Structured types get a "View all" affordance
const STRUCTURED_TYPES: CardType[] = ['NoticeList', 'LinkList', 'Timeline', 'ActivityFeed'];

// ─── Card shell ────────────────────────────────────────────────────────────────

const CardWrapper = styled.article`
  background: white;
  border-radius: 10px;
  border: 1px solid #e8eaed;
  display: flex;
  flex-direction: column;
  height: 100%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.03);
  transition: box-shadow 0.15s, border-color 0.15s;
  overflow: hidden;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    border-color: #d1d5db;
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.875rem 1rem 0.75rem;
  border-bottom: 1px solid #f3f4f6;
  flex-shrink: 0;
`;

const CardTitleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
`;

const CardTitle = styled.h2`
  font-size: 0.88rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CardSubtitle = styled.p`
  font-size: 0.72rem;
  color: #9ca3af;
  margin: 0;
`;

const ViewAll = styled.a`
  font-size: 0.72rem;
  font-weight: 600;
  color: ${BRAND};
  text-decoration: none;
  white-space: nowrap;
  flex-shrink: 0;
  opacity: 0.85;

  &:hover { opacity: 1; text-decoration: underline; }
`;

const CardBody = styled.div`
  flex: 1;
  padding: 0.875rem 1rem;
  overflow: hidden;
`;

// ─── ErrorBoundary ────────────────────────────────────────────────────────────

const ErrorBox = styled.div`
  padding: 0.75rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #991b1b;
  font-size: 0.82rem;
`;

interface ErrorBoundaryState { hasError: boolean }

class CardErrorBoundary extends Component<
  { children: ReactNode; header: string },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode; header: string }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(): ErrorBoundaryState { return { hasError: true }; }
  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(`[CardRenderer] Error in card "${this.props.header}":`, error, info);
  }
  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <ErrorBox role="alert">
          Card could not be rendered. Please contact support if this persists.
        </ErrorBox>
      );
    }
    return this.props.children;
  }
}

const MisconfiguredCard: React.FC<{ type: string }> = ({ type }) => (
  <ErrorBox role="alert">Unknown card type <strong>{type}</strong>.</ErrorBox>
);

// ─── Main renderer ────────────────────────────────────────────────────────────

const CardRenderer: React.FC<{ card: Card }> = ({ card }) => {
  const Template = templateRegistry[card.type];
  const showViewAll = STRUCTURED_TYPES.includes(card.type as CardType);

  return (
    <CardWrapper aria-label={card.header}>
      <CardHeader>
        <CardTitleGroup>
          <CardTitle>{card.header}</CardTitle>
          {card.subtitle && <CardSubtitle>{card.subtitle}</CardSubtitle>}
        </CardTitleGroup>
        {showViewAll && (
          <ViewAll href="#" aria-label={`View all ${card.header}`} onClick={(e) => e.preventDefault()}>
            View all
          </ViewAll>
        )}
      </CardHeader>
      <CardBody>
        <CardErrorBoundary header={card.header}>
          {Template ? (
            <Suspense fallback={<div style={{ color: '#9ca3af', fontSize: '0.82rem' }}>Loading…</div>}>
              <Template card={card} />
            </Suspense>
          ) : (
            <MisconfiguredCard type={card.type} />
          )}
        </CardErrorBoundary>
      </CardBody>
    </CardWrapper>
  );
};

export default CardRenderer;
