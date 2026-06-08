import React from 'react';
import styled from 'styled-components';
import { colors, spacing, borderRadius } from '../../styles/designTokens';

const Nav = styled.nav`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${spacing.sm};
  margin-bottom: ${spacing.lg};
`;

const Crumb = styled.span<{ $state: 'done' | 'current' | 'todo' }>`
  display: inline-flex;
  align-items: center;
  gap: ${spacing.xs};
  font-size: 0.8rem;
  font-weight: 600;
  padding: ${spacing.xs} ${spacing.md};
  border-radius: ${borderRadius.full};
  color: ${props => {
    switch (props.$state) {
      case 'done':
        return colors.semantic.success;
      case 'current':
        return colors.text.primary;
      default:
        return colors.text.tertiary;
    }
  }};
  background: ${props => {
    switch (props.$state) {
      case 'done':
        return `${colors.semantic.success}12`;
      case 'current':
        return colors.neutral.gray100;
      default:
        return 'transparent';
    }
  }};
  border: 1px solid
    ${props => {
      switch (props.$state) {
        case 'current':
          return colors.neutral.gray300;
        default:
          return 'transparent';
      }
    }};
`;

const Sep = styled.span`
  color: ${colors.text.tertiary};
  font-size: 0.75rem;
  user-select: none;
`;

export type MerSetupCrumbId = 'controls' | 'merType' | 'application';

export interface MerWorkflowSetupBreadcrumbsProps {
  /** MER setup: 0 = controls, 1 = MER type, 2 = application identification */
  currentStepIndex: number;
  /** When user has moved past setup, mark all setup crumbs complete */
  allComplete?: boolean;
}

const LABELS: Record<MerSetupCrumbId, string> = {
  controls: '1. Controls',
  merType: '2. MER type',
  application: '3. Application ID',
};

const MerWorkflowSetupBreadcrumbs: React.FC<MerWorkflowSetupBreadcrumbsProps> = ({
  currentStepIndex,
  allComplete = false,
}) => {
  const order: MerSetupCrumbId[] = ['controls', 'merType', 'application'];

  const stateFor = (id: MerSetupCrumbId): 'done' | 'current' | 'todo' => {
    if (allComplete) return 'done';
    const idx = order.indexOf(id);
    if (idx < currentStepIndex) return 'done';
    if (idx === currentStepIndex) return 'current';
    return 'todo';
  };

  return (
    <Nav aria-label="MER setup progress">
      {order.map((id, i) => (
        <React.Fragment key={id}>
          {i > 0 && <Sep aria-hidden="true">/</Sep>}
          <Crumb
            $state={stateFor(id)}
            aria-current={
              !allComplete && order.indexOf(id) === currentStepIndex ? 'step' : undefined
            }
          >
            {LABELS[id]}
          </Crumb>
        </React.Fragment>
      ))}
    </Nav>
  );
};

export default MerWorkflowSetupBreadcrumbs;
