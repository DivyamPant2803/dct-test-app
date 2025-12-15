import React from 'react';
import styled from 'styled-components';
import { FiCheck, FiClock } from 'react-icons/fi';
import { colors, transitions } from '../../styles/designTokens';

export interface StatusStep {
  id: string;
  label: string;
  date?: string;
  completed: boolean;
  current: boolean;
}

interface StatusStepperProps {
  steps: StatusStep[];
  orientation?: 'horizontal' | 'vertical';
}

const StepperContainer = styled.div<{ $orientation: string }>`
  display: flex;
  flex-direction: ${props => props.$orientation === 'vertical' ? 'column' : 'row'};
  gap: 1rem;
  align-items: ${props => props.$orientation === 'vertical' ? 'flex-start' : 'center'};
  flex-wrap: ${props => props.$orientation === 'horizontal' ? 'wrap' : 'nowrap'};
`;

const Step = styled.div<{ $completed: boolean; $current: boolean; $orientation: string }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  flex: ${props => props.$orientation === 'horizontal' ? '1' : 'none'};
  min-width: 0;
  
  ${props => props.$current && `
    font-weight: 600;
  `}
`;

const StepIcon = styled.div<{ $completed: boolean; $current: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => 
    props.$completed ? colors.status.approved : 
    props.$current ? colors.status.underReview : colors.neutral.gray300
  };
  color: white;
  transition: all ${transitions.base};
  flex-shrink: 0;
  
  ${props => props.$current && !props.$completed && `
    animation: pulse 2s infinite;
  `}
  
  @keyframes pulse {
    0%, 100% { 
      opacity: 1; 
      transform: scale(1);
    }
    50% { 
      opacity: 0.7; 
      transform: scale(1.05);
    }
  }
`;

const StepContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
`;

const StepLabel = styled.span<{ $current: boolean }>`
  color: ${props => props.$current ? colors.status.underReview : colors.text.secondary};
  font-size: 0.9rem;
  font-weight: ${props => props.$current ? 600 : 400};
  white-space: nowrap;
`;

const StepDate = styled.span`
  font-size: 0.75rem;
  color: ${colors.text.tertiary};
  margin-top: 0.125rem;
`;

const Connector = styled.div<{ $completed: boolean; $orientation: string }>`
  ${props => props.$orientation === 'horizontal' ? `
    flex: 1;
    height: 2px;
    background: ${props.$completed ? colors.status.approved : colors.neutral.gray300};
    margin: 0 0.5rem;
    transition: background ${transitions.base};
  ` : `
    width: 2px;
    min-height: 1rem;
    background: ${props.$completed ? colors.status.approved : colors.neutral.gray300};
    margin: 0.5rem 0;
    margin-left: 15px;
    transition: background ${transitions.base};
  `}
`;

export const StatusStepper: React.FC<StatusStepperProps> = ({ 
  steps, 
  orientation = 'horizontal' 
}) => {
  return (
    <StepperContainer $orientation={orientation}>
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <Step 
            $completed={step.completed} 
            $current={step.current}
            $orientation={orientation}
            as="div"
          >
            <StepIcon $completed={step.completed} $current={step.current}>
              {step.completed ? <FiCheck size={18} /> : <FiClock size={18} />}
            </StepIcon>
            <StepContent>
              <StepLabel $current={step.current}>{step.label}</StepLabel>
              {step.date && <StepDate>{step.date}</StepDate>}
            </StepContent>
          </Step>
          {index < steps.length - 1 && (
            <Connector 
              $completed={step.completed}
              $orientation={orientation}
            />
          )}
        </React.Fragment>
      ))}
    </StepperContainer>
  );
};

