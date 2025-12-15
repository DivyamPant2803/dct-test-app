import React from 'react';
import styled from 'styled-components';
import { FiCheck, FiCircle } from 'react-icons/fi';
import { colors, transitions, borderRadius, shadows } from '../../styles/designTokens';

export interface WorkflowStep {
  id: string;
  label: string;
  icon?: React.ReactNode;
  completed: boolean;
  current: boolean;
  onClick?: () => void;
}

interface WorkflowStepperProps {
  steps: WorkflowStep[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
}

const StepperContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: ${colors.background.paper};
  border-radius: ${borderRadius.lg};
  box-shadow: ${shadows.base};
`;

const StepWrapper = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  position: relative;
`;

const Step = styled.button<{ $completed: boolean; $current: boolean; $clickable: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  background: none;
  border: none;
  cursor: ${props => props.$clickable ? 'pointer' : 'default'};
  padding: 0.5rem;
  transition: all ${transitions.base};
  position: relative;
  
  &:hover {
    ${props => props.$clickable && !props.$current && `
      transform: translateY(-2px);
    `}
  }
  
  &:focus {
    outline: 2px solid ${colors.status.underReview};
    outline-offset: 4px;
    border-radius: ${borderRadius.base};
  }
`;

const StepIcon = styled.div<{ $completed: boolean; $current: boolean }>`
  width: 48px;
  height: 48px;
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
  font-size: 1.25rem;
  position: relative;
  z-index: 2;
  
  ${props => props.$current && !props.$completed && `
    animation: pulse 2s infinite;
    box-shadow: 0 0 0 4px ${colors.status.underReview}33;
  `}
  
  ${props => props.$completed && `
    animation: checkmarkBounce 0.4s ease;
  `}
  
  @keyframes pulse {
    0%, 100% { 
      opacity: 1; 
      transform: scale(1);
    }
    50% { 
      opacity: 0.9; 
      transform: scale(1.05);
    }
  }
  
  @keyframes checkmarkBounce {
    0% { transform: scale(0); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
`;

const StepLabel = styled.span<{ $current: boolean; $completed: boolean }>`
  color: ${props => 
    props.$current ? colors.status.underReview : 
    props.$completed ? colors.text.secondary : colors.text.tertiary
  };
  font-size: 0.875rem;
  font-weight: ${props => props.$current ? 600 : 400};
  text-align: center;
  transition: color ${transitions.base};
`;

const Connector = styled.div<{ $completed: boolean }>`
  flex: 1;
  height: 2px;
  background: ${props => props.$completed ? colors.status.approved : colors.neutral.gray300};
  margin: 0 1rem;
  transition: background ${transitions.base};
  position: relative;
  top: -24px;
  z-index: 1;
`;

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({ 
  steps, 
  onStepClick
}) => {
  const handleStepClick = (stepIndex: number, step: WorkflowStep) => {
    if (step.onClick) {
      step.onClick();
    } else if (onStepClick) {
      onStepClick(stepIndex);
    }
  };

  return (
    <StepperContainer>
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <StepWrapper>
            <Step
              $completed={step.completed}
              $current={step.current}
              $clickable={!!(step.onClick || onStepClick)}
              onClick={() => handleStepClick(index, step)}
              aria-label={`Step ${index + 1}: ${step.label}`}
              aria-current={step.current ? 'step' : undefined}
            >
              <StepIcon $completed={step.completed} $current={step.current}>
                {step.completed ? (
                  <FiCheck size={24} />
                ) : step.icon ? (
                  step.icon
                ) : (
                  <FiCircle size={24} />
                )}
              </StepIcon>
              <StepLabel $current={step.current} $completed={step.completed}>
                {step.label}
              </StepLabel>
            </Step>
          </StepWrapper>
          {index < steps.length - 1 && (
            <Connector $completed={step.completed} />
          )}
        </React.Fragment>
      ))}
    </StepperContainer>
  );
};


