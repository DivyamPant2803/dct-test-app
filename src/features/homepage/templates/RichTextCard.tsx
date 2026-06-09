import React from 'react';
import styled from 'styled-components';
import { Card } from '../../../shared/types';
import { sanitizeHtml } from '../../../shared/sanitize';

const Body = styled.div`
  font-size: 0.9rem;
  line-height: 1.6;
  color: #374151;

  h3, h4 { margin: 0.75rem 0 0.25rem; font-weight: 600; color: #111827; }
  p { margin: 0.4rem 0; }
  ul, ol { padding-left: 1.25rem; margin: 0.4rem 0; }
  a { color: #2563eb; text-decoration: underline; }
  a:hover { color: #1d4ed8; }
`;

interface Props {
  card: Card;
}

const RichTextCard: React.FC<Props> = ({ card }) => {
  if (!card.bodyHtml) return <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>No content.</p>;

  return (
    <Body
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(card.bodyHtml) }}
    />
  );
};

export default RichTextCard;
