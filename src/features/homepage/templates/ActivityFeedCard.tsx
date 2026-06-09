import React from 'react';
import styled from 'styled-components';
import { Card } from '../../../shared/types';
import { useCardData } from '../hooks/useCardData';

const Feed = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const FeedItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f3f4f6;

  &:last-child { border-bottom: none; }
`;

const Dot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #c5152a;
  margin-top: 5px;
  flex-shrink: 0;
`;

const FeedContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const FeedTitle = styled.div`
  font-size: 0.85rem;
  color: #111827;
  font-weight: 500;
`;

const FeedDate = styled.div`
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 1px;
`;

const ErrorMsg = styled.div`
  color: #9ca3af;
  font-size: 0.82rem;
  text-align: center;
  padding: 0.5rem;
`;

const SkeletonRow = styled.div`
  height: 36px;
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 8px;

  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

interface Props {
  card: Card;
}

const ActivityFeedCard: React.FC<Props> = ({ card }) => {
  const { data, isLoading, isError } = useCardData(card.id);

  if (isLoading) {
    return (
      <div>
        {[1, 2, 3].map((i) => <SkeletonRow key={i} />)}
      </div>
    );
  }

  if (isError || data?.error) {
    return <ErrorMsg>Activity feed unavailable</ErrorMsg>;
  }

  const items = data?.items as Array<{ id: string; title: string; date?: string }> | undefined;

  if (!items || items.length === 0) {
    return <ErrorMsg>No recent activity</ErrorMsg>;
  }

  return (
    <Feed>
      {items.map((item) => (
        <FeedItem key={item.id}>
          <Dot aria-hidden="true" />
          <FeedContent>
            <FeedTitle>{item.title}</FeedTitle>
            {item.date && (
              <FeedDate>
                {new Date(item.date).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </FeedDate>
            )}
          </FeedContent>
        </FeedItem>
      ))}
    </Feed>
  );
};

export default ActivityFeedCard;
