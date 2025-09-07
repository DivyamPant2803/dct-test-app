import React from 'react';
import styled from 'styled-components';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const NavigationContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  padding: 0 2rem;
  align-items: center;
`;

const NavButton = styled.button<{ variant: 'back' | 'next'; disabled?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: 2px solid ${props => props.variant === 'back' ? '#666' : '#000'};
  border-radius: 6px;
  background: ${props => {
    if (props.disabled) return '#f5f5f5';
    return props.variant === 'back' ? 'white' : '#000';
  }};
  color: ${props => {
    if (props.disabled) return '#ccc';
    return props.variant === 'back' ? '#666' : 'white';
  }};
  font-weight: 500;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  font-size: 0.9rem;
  min-width: 100px;
  justify-content: center;

  &:hover {
    ${props => !props.disabled && `
      border-color: ${props.variant === 'back' ? '#000' : '#333'};
      color: ${props.variant === 'back' ? '#000' : 'white'};
      background: ${props.variant === 'back' ? '#f8f8f8' : '#333'};
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    `}
  }

  &:active {
    ${props => !props.disabled && `
      transform: translateY(0);
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    `}
  }
`;

interface NavigationButtonsProps {
  onBack: () => void;
  onNext: () => void;
  canGoBack?: boolean;
  canGoNext?: boolean;
  backText?: string;
  nextText?: string;
  showBack?: boolean;
  showNext?: boolean;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  onBack,
  onNext,
  canGoBack = true,
  canGoNext = true,
  backText = 'Back',
  nextText = 'Next',
  showBack = true,
  showNext = true,
}) => {
  return (
    <NavigationContainer>
      {showBack && (
        <NavButton
          variant="back"
          onClick={onBack}
          disabled={!canGoBack}
          aria-label="Go to previous step"
        >
          <FiChevronLeft size={16} />
          {backText}
        </NavButton>
      )}
      {showNext && (
        <NavButton
          variant="next"
          onClick={onNext}
          disabled={!canGoNext}
          aria-label="Go to next step"
        >
          {nextText}
          <FiChevronRight size={16} />
        </NavButton>
      )}
    </NavigationContainer>
  );
};

export default NavigationButtons; 