import React from 'react';
import styled from 'styled-components';
import { Card, CardSize } from '../../shared/types';
import CardRenderer from './CardRenderer';

// §9.3 column mapping: 4-column grid
// Assumptions: col spans = Small→1, Medium→2, Large→3, FullWidth→4
const COL_SPAN: Record<CardSize, number> = {
  Small: 1,
  Medium: 2,
  Large: 3,
  FullWidth: 4,
};

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  align-items: stretch;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const CardCell = styled.div<{ colSpan: number }>`
  grid-column: span ${({ colSpan }) => colSpan};
  display: flex;
  flex-direction: column;

  @media (max-width: 1024px) {
    grid-column: span ${({ colSpan }) => Math.min(colSpan, 2)};
  }

  @media (max-width: 768px) {
    grid-column: span 1;
  }
`;

interface CardGridProps {
  cards: Card[];
}

const CardGrid: React.FC<CardGridProps> = ({ cards }) => {
  const sorted = [...cards].sort((a, b) => a.order - b.order);

  return (
    <Grid>
      {sorted.map((card) => (
        <CardCell key={card.id} colSpan={COL_SPAN[card.size] ?? 1}>
          <CardRenderer card={card} />
        </CardCell>
      ))}
    </Grid>
  );
};

export default CardGrid;
