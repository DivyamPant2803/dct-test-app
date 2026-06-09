import React from 'react';
import styled from 'styled-components';
import { Card } from '../../../shared/types';
import { sanitizeHtml } from '../../../shared/sanitize';

const BRAND = '#c5152a';

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
`;

const Item = styled.li`
  padding: 0.6rem 0;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  flex-direction: column;
  gap: 3px;

  &:first-child { padding-top: 0; }
  &:last-child { border-bottom: none; padding-bottom: 0; }
`;

const ItemTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
`;

const PriorityBadge = styled.span<{ priority?: string }>`
  display: inline-block;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 1px 7px;
  border-radius: 3px;
  white-space: nowrap;
  flex-shrink: 0;

  ${({ priority }) =>
    priority === 'High'
      ? `background:#fee2e2;color:${BRAND};`
      : priority === 'Low'
      ? `background:#f0fdf4;color:#15803d;`
      : `background:#fff7ed;color:#c2410c;`}
`;

const DateLabel = styled.span`
  font-size: 0.68rem;
  color: #9ca3af;
  white-space: nowrap;
  flex-shrink: 0;
`;

const ItemTitle = styled.div`
  font-size: 0.82rem;
  font-weight: 600;
  color: #111827;
  line-height: 1.3;
`;

const ItemBody = styled.div`
  font-size: 0.78rem;
  color: #6b7280;
  line-height: 1.45;

  b, strong { color: #374151; font-weight: 600; }
  a { color: ${BRAND}; }
`;

interface Props { card: Card }

const NoticeListCard: React.FC<Props> = ({ card }) => {
  const now = Date.now();

  const visible = (card.items ?? []).filter((item) => {
    const from = item.effectiveFromUtc ? new Date(item.effectiveFromUtc).getTime() : -Infinity;
    const to   = item.effectiveToUtc   ? new Date(item.effectiveToUtc).getTime()   :  Infinity;
    return now >= from && now <= to;
  });

  if (visible.length === 0) {
    return <p style={{ color: '#9ca3af', fontSize: '0.82rem' }}>No active notices.</p>;
  }

  return (
    <List>
      {visible.map((item) => {
        const priority = typeof item.extra?.priority === 'string' ? item.extra.priority : undefined;
        return (
          <Item key={item.id} role="listitem">
            <ItemTop>
              {priority && <PriorityBadge priority={priority}>{priority} Priority</PriorityBadge>}
              {item.badgeText && !priority && (
                <PriorityBadge>{item.badgeText}</PriorityBadge>
              )}
              <DateLabel>
                {item.effectiveToUtc
                  ? new Date(item.effectiveToUtc).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })
                  : 'Ongoing'}
              </DateLabel>
            </ItemTop>
            {item.title && <ItemTitle>{item.title}</ItemTitle>}
            {item.bodyHtml && (
              <ItemBody dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.bodyHtml) }} />
            )}
          </Item>
        );
      })}
    </List>
  );
};

export default NoticeListCard;
