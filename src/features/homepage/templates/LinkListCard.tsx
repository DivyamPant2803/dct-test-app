import React from 'react';
import styled from 'styled-components';
import { Card } from '../../../shared/types';
import { isSafeUrl, sanitizeHtml } from '../../../shared/sanitize';

const BRAND = '#c5152a';

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
`;

const Item = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  padding: 0.55rem 0;
  border-bottom: 1px solid #f3f4f6;

  &:first-child { padding-top: 0; }
  &:last-child { border-bottom: none; padding-bottom: 0; }
`;

const Dot = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: #fee2e2;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;
`;

const DotIcon = styled.span`
  font-size: 0.75rem;
  color: ${BRAND};
`;

const TextGroup = styled.div`
  flex: 1;
  min-width: 0;
`;

const LinkTitle = styled.a`
  display: block;
  font-size: 0.82rem;
  font-weight: 600;
  color: #111827;
  text-decoration: none;
  line-height: 1.3;

  &:hover { color: ${BRAND}; text-decoration: underline; }
`;

const LinkTitlePlain = styled.div`
  font-size: 0.82rem;
  font-weight: 600;
  color: #111827;
  line-height: 1.3;
`;

const LinkDesc = styled.div`
  font-size: 0.73rem;
  color: #9ca3af;
  margin-top: 1px;
  line-height: 1.4;
`;

interface Props { card: Card }

const LinkListCard: React.FC<Props> = ({ card }) => {
  if (!card.items || card.items.length === 0) {
    return <p style={{ color: '#9ca3af', fontSize: '0.82rem' }}>No links configured.</p>;
  }

  return (
    <List>
      {card.items.map((item) => {
        const safeUrl = item.url && isSafeUrl(item.url) ? item.url : undefined;

        return (
          <Item key={item.id}>
            <Dot aria-hidden="true">
              <DotIcon>🔗</DotIcon>
            </Dot>
            <TextGroup>
              {safeUrl ? (
                <LinkTitle href={safeUrl} target="_blank" rel="noopener noreferrer">
                  {item.title ?? 'Link'}
                </LinkTitle>
              ) : (
                <LinkTitlePlain>{item.title ?? 'Link'}</LinkTitlePlain>
              )}
              {item.bodyHtml && (
                <LinkDesc dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.bodyHtml) }} />
              )}
            </TextGroup>
          </Item>
        );
      })}
    </List>
  );
};

export default LinkListCard;
