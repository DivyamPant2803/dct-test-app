import React from 'react';
import styled from 'styled-components';
import { colors, borderRadius, shadows } from '../../styles/designTokens';

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
  min-height: 300px;
`;

const IconContainer = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${colors.background.hover};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  color: ${colors.text.tertiary};
  font-size: 2.5rem;
`;

const Title = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${colors.text.primary};
  margin-bottom: 0.5rem;
`;

const Message = styled.p`
  font-size: 0.875rem;
  color: ${colors.text.secondary};
  margin-bottom: 1.5rem;
  max-width: 400px;
  line-height: 1.6;
`;

const ActionButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: ${colors.status.underReview};
  color: white;
  border: none;
  border-radius: ${borderRadius.base};
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${shadows.sm};
  
  &:hover {
    background: ${colors.status.underReview};
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: ${shadows.base};
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:focus {
    outline: 2px solid ${colors.status.underReview};
    outline-offset: 2px;
  }
`;

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  icon,
  actionLabel,
  onAction,
}) => {
  return (
    <Container>
      {icon && <IconContainer>{icon}</IconContainer>}
      <Title>{title}</Title>
      <Message>{message}</Message>
      {actionLabel && onAction && (
        <ActionButton onClick={onAction}>
          {actionLabel}
        </ActionButton>
      )}
    </Container>
  );
};


