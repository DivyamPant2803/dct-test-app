import React from 'react';
import styled, { css, keyframes } from 'styled-components';
import { FiCheck } from 'react-icons/fi';
import { colors, spacing, borderRadius, shadows } from '../../styles/designTokens';
import { WorkflowStep } from '../common/WorkflowStepper';

const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 ${colors.status.underReview}50; }
  50% { box-shadow: 0 0 0 6px ${colors.status.underReview}00; }
`;

const SidebarContainer = styled.nav`
  position: sticky;
  top: 0;
  height: 100vh;
  width: 256px;
  min-width: 256px;
  background: ${colors.background.paper};
  border-right: 1px solid ${colors.neutral.gray200};
  display: flex;
  flex-direction: column;
  padding: ${spacing.xl} ${spacing.base} ${spacing.lg};
  overflow-y: auto;
  box-shadow: ${shadows.sm};
  z-index: 10;
`;

const SidebarHeader = styled.div`
  margin-bottom: ${spacing.xl};
  padding: 0 ${spacing.sm};
`;

const SidebarTitle = styled.div`
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  color: ${colors.text.tertiary};
  margin-bottom: ${spacing.xs};
`;

const SidebarSubtitle = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${colors.text.primary};
`;

const StepList = styled.ol`
  display: flex;
  flex-direction: column;
  flex: 1;
  list-style: none;
  padding: 0;
  margin: 0;
  gap: 0;
`;

const StepItemWrapper = styled.li`
  display: flex;
  flex-direction: column;
`;

const StepItem = styled.button<{ $clickable: boolean; $current: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: ${spacing.md};
  padding: ${spacing.sm};
  border: none;
  background: ${props => props.$current ? `${colors.status.underReview}08` : 'transparent'};
  border-radius: ${borderRadius.base};
  cursor: ${props => props.$clickable ? 'pointer' : 'default'};
  text-align: left;
  width: 100%;
  transition: background 0.15s ease;
  position: relative;

  &:hover {
    background: ${props => props.$clickable ? colors.background.hover : 'transparent'};
  }

  &:focus-visible {
    outline: 2px solid ${colors.status.underReview};
    outline-offset: 2px;
  }
`;

const StepIconCol = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  padding-top: 2px;
`;

const StepCircle = styled.div<{ $status: 'completed' | 'current' | 'locked' }>`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
  position: relative;
  z-index: 2;
  transition: all 0.2s ease;

  ${props => {
    switch (props.$status) {
      case 'completed':
        return css`
          background: ${colors.status.approved};
          color: white;
        `;
      case 'current':
        return css`
          background: ${colors.status.underReview};
          color: white;
          animation: ${pulse} 2s infinite;
        `;
      case 'locked':
        return css`
          background: ${colors.neutral.gray100};
          color: ${colors.text.tertiary};
          border: 2px solid ${colors.neutral.gray300};
        `;
    }
  }}
`;

const StepConnector = styled.div<{ $completed: boolean }>`
  width: 2px;
  height: 20px;
  margin: 2px 0;
  background: ${props => props.$completed ? colors.status.approved : colors.neutral.gray200};
  flex-shrink: 0;
  border-radius: 1px;
  transition: background 0.3s ease;
`;

const StepTextCol = styled.div`
  flex: 1;
  padding-top: 4px;
  min-width: 0;
`;

const StepLabel = styled.div<{ $current: boolean; $completed: boolean }>`
  font-size: 0.875rem;
  font-weight: ${props => (props.$current || props.$completed) ? 600 : 400};
  color: ${props =>
    props.$current ? colors.status.underReview :
    props.$completed ? colors.text.primary :
    colors.text.tertiary
  };
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StepStatusText = styled.div<{ $type: 'done' | 'active' | 'locked' }>`
  font-size: 0.7rem;
  font-weight: 500;
  margin-top: 2px;
  color: ${props =>
    props.$type === 'done' ? colors.semantic.success :
    props.$type === 'active' ? colors.status.underReview :
    colors.text.tertiary
  };
`;

const ConnectorWrapper = styled.div`
  padding-left: 22px;
`;

// ─── Sub-navigation (template sections) ──────────────────────────────────────

const SubNavList = styled.ol`
  list-style: none;
  padding: 0;
  margin: 0;
  padding-left: 28px;
  padding-bottom: ${spacing.xs};
  display: flex;
  flex-direction: column;
  gap: 1px;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 13px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: ${colors.status.underReview}25;
    border-radius: 1px;
  }
`;

const SubNavItem = styled.button`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  width: 100%;
  padding: 5px ${spacing.sm};
  border: none;
  background: transparent;
  border-radius: ${borderRadius.sm};
  cursor: pointer;
  text-align: left;
  transition: background 0.15s ease;
  position: relative;

  &:hover {
    background: ${colors.status.underReview}08;
  }

  &:focus-visible {
    outline: 2px solid ${colors.status.underReview};
    outline-offset: 2px;
  }
`;

const SubNavDot = styled.div`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: ${colors.status.underReview}50;
  flex-shrink: 0;
  transition: background 0.15s ease;

  ${SubNavItem}:hover & {
    background: ${colors.status.underReview};
  }
`;

const SubNavLabel = styled.span`
  font-size: 0.78rem;
  color: ${colors.text.secondary};
  line-height: 1.3;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  ${SubNavItem}:hover & {
    color: ${colors.status.underReview};
  }
`;

const SubNavBadge = styled.span`
  font-size: 0.65rem;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: ${borderRadius.full};
  background: ${colors.status.underReview}12;
  color: ${colors.status.underReview};
  white-space: nowrap;
  flex-shrink: 0;
`;

const ProgressSection = styled.div`
  margin-top: ${spacing.lg};
  padding-top: ${spacing.lg};
  border-top: 1px solid ${colors.neutral.gray100};
`;

const ProgressLabelRow = styled.div`
  font-size: 0.78rem;
  color: ${colors.text.secondary};
  margin-bottom: ${spacing.sm};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ProgressCount = styled.span`
  font-weight: 700;
  color: ${colors.text.primary};
`;

const ProgressBar = styled.div`
  height: 5px;
  border-radius: 3px;
  background: ${colors.neutral.gray200};
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $percent: number }>`
  height: 100%;
  width: ${props => props.$percent}%;
  border-radius: 3px;
  background: linear-gradient(90deg, ${colors.status.underReview}, ${colors.status.approved});
  transition: width 0.5s ease;
`;

export interface SubNavItem {
  id: string;
  label: string;
  badge?: string;
}

interface StepSidebarProps {
  steps: WorkflowStep[];
  currentStep: number;
  onStepClick: (stepIndex: number) => void;
  title?: string;
  subNavItems?: SubNavItem[];
  onSubNavClick?: (id: string) => void;
}

const StepSidebar: React.FC<StepSidebarProps> = ({
  steps,
  onStepClick,
  title = 'Central Inventory',
  subNavItems,
  onSubNavClick,
}) => {
  const completedCount = steps.filter(s => s.completed).length;
  const progressPercent = steps.length > 0
    ? Math.round((completedCount / steps.length) * 100)
    : 0;

  return (
    <SidebarContainer aria-label="Form progress navigation">
      <SidebarHeader>
        <SidebarTitle>Workflow</SidebarTitle>
        <SidebarSubtitle>{title}</SidebarSubtitle>
      </SidebarHeader>

      <StepList>
        {steps.map((step, index) => {
          const status: 'completed' | 'current' | 'locked' =
            step.completed ? 'completed' : step.current ? 'current' : 'locked';
          const isClickable = step.completed || step.current;
          const isLast = index === steps.length - 1;

          return (
            <StepItemWrapper key={step.id}>
              <StepItem
                $clickable={isClickable}
                $current={step.current}
                onClick={() => isClickable && onStepClick(index)}
                aria-current={step.current ? 'step' : undefined}
                aria-label={`Step ${index + 1}: ${step.label}${step.completed ? ', completed' : step.current ? ', in progress' : ', not started'}`}
              >
                <StepIconCol>
                  <StepCircle $status={status}>
                    {step.completed ? <FiCheck size={14} /> : index + 1}
                  </StepCircle>
                </StepIconCol>
                <StepTextCol>
                  <StepLabel $current={step.current} $completed={step.completed}>
                    {step.label}
                  </StepLabel>
                  <StepStatusText $type={status === 'completed' ? 'done' : status === 'current' ? 'active' : 'locked'}>
                    {step.completed ? 'Completed' : step.current ? 'In progress' : 'Not started'}
                  </StepStatusText>
                </StepTextCol>
              </StepItem>

              {/* Sub-nav items shown when this step is active and has sub-sections */}
              {step.current && subNavItems && subNavItems.length > 0 && (
                <SubNavList aria-label="Template sections">
                  {subNavItems.map(item => (
                    <li key={item.id}>
                      <SubNavItem
                        onClick={() => onSubNavClick?.(item.id)}
                        aria-label={`Jump to ${item.label}`}
                        title={item.label}
                      >
                        <SubNavDot aria-hidden="true" />
                        <SubNavLabel>{item.label}</SubNavLabel>
                        {item.badge && <SubNavBadge>{item.badge}</SubNavBadge>}
                      </SubNavItem>
                    </li>
                  ))}
                </SubNavList>
              )}

              {!isLast && (
                <ConnectorWrapper>
                  <StepConnector $completed={step.completed} />
                </ConnectorWrapper>
              )}
            </StepItemWrapper>
          );
        })}
      </StepList>

      <ProgressSection>
        <ProgressLabelRow>
          <span>Progress</span>
          <ProgressCount>{completedCount} / {steps.length} steps</ProgressCount>
        </ProgressLabelRow>
        <ProgressBar role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
          <ProgressFill $percent={progressPercent} />
        </ProgressBar>
      </ProgressSection>
    </SidebarContainer>
  );
};

export default StepSidebar;
