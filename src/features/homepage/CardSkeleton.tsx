import React from 'react';
import styled, { keyframes } from 'styled-components';

const shimmer = keyframes`
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
`;

const SkeletonCard = styled.div`
  background: white;
  border-radius: 10px;
  padding: 1.25rem;
  border: 1px solid #e8eaed;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
`;

const SkeletonHeader = styled.div`
  height: 20px;
  width: 55%;
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 0.75rem;
`;

const SkeletonLine = styled.div<{ width?: string }>`
  height: 14px;
  width: ${({ width }) => width ?? '100%'};
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 0.5rem;
`;

const CardSkeleton: React.FC = () => (
  <SkeletonCard aria-busy="true" aria-label="Loading card…">
    <SkeletonHeader />
    <SkeletonLine />
    <SkeletonLine width="80%" />
    <SkeletonLine width="65%" />
  </SkeletonCard>
);

export default CardSkeleton;
