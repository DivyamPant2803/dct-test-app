import React, { useState } from 'react';
import styled from 'styled-components';
import { FiArrowLeft, FiArrowRight, FiSend, FiInfo } from 'react-icons/fi';
import { colors, spacing, borderRadius, shadows } from '../../styles/designTokens';

const ActionsBar = styled.div`
  position: sticky;
  bottom: 0;
  background: ${colors.background.paper};
  border-top: 1px solid ${colors.neutral.gray200};
  padding: ${spacing.base} ${spacing.xl};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${spacing.lg};
  z-index: 20;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.06);
`;

const LeftActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.md};
`;

const RightActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.md};
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  padding: ${spacing.sm} ${spacing.lg};
  border: 1px solid ${colors.neutral.gray300};
  border-radius: ${borderRadius.base};
  background: white;
  color: ${colors.text.secondary};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  height: 38px;

  &:hover:not(:disabled) {
    border-color: ${colors.neutral.gray400};
    color: ${colors.text.primary};
    background: ${colors.background.hover};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid ${colors.status.underReview};
    outline-offset: 2px;
  }
`;

const ContinueButton = styled.button<{ $isSubmit?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  padding: ${spacing.sm} ${spacing.xl};
  border: none;
  border-radius: ${borderRadius.base};
  background: ${props => props.$isSubmit ? colors.semantic.success : colors.neutral.black};
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${shadows.sm};
  height: 38px;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: ${shadows.base};
    background: ${props => props.$isSubmit ? '#388E3C' : colors.neutral.gray800};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    background: ${colors.neutral.gray300};
    color: ${colors.neutral.gray500};
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  &:focus-visible {
    outline: 2px solid ${colors.status.underReview};
    outline-offset: 2px;
  }
`;

const HintWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const HintText = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.xs};
  font-size: 0.78rem;
  color: ${colors.text.tertiary};
  max-width: 220px;
  text-align: right;
  line-height: 1.3;
`;

const TooltipPopup = styled.div<{ $visible: boolean }>`
  position: absolute;
  bottom: calc(100% + 10px);
  right: 0;
  background: ${colors.neutral.gray900};
  color: white;
  padding: ${spacing.sm} ${spacing.md};
  border-radius: ${borderRadius.base};
  font-size: 0.78rem;
  white-space: nowrap;
  pointer-events: none;
  opacity: ${props => props.$visible ? 1 : 0};
  transform: ${props => props.$visible ? 'translateY(0)' : 'translateY(4px)'};
  transition: all 0.15s ease;
  box-shadow: ${shadows.md};
  z-index: 100;
  max-width: 280px;
  white-space: normal;
  text-align: center;

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    right: 16px;
    border: 5px solid transparent;
    border-top-color: ${colors.neutral.gray900};
  }
`;

export interface StepActionsProps {
  onBack?: () => void;
  onContinue?: () => void;
  canContinue: boolean;
  disabledReason?: string;
  continueLabel?: string;
  backLabel?: string;
  isSubmit?: boolean;
  isLoading?: boolean;
  showBack?: boolean;
  showContinue?: boolean;
}

const StepActions: React.FC<StepActionsProps> = ({
  onBack,
  onContinue,
  canContinue,
  disabledReason,
  continueLabel = 'Continue',
  backLabel = 'Back',
  isSubmit = false,
  isLoading = false,
  showBack = true,
  showContinue = true,
}) => {
  const [tooltipVisible, setTooltipVisible] = useState(false);

  return (
    <ActionsBar>
      <LeftActions>
        {showBack && (
          <BackButton
            onClick={onBack}
            disabled={!onBack}
            aria-label={backLabel}
          >
            <FiArrowLeft size={14} />
            {backLabel}
          </BackButton>
        )}
      </LeftActions>

      <RightActions>
        {!canContinue && disabledReason && (
          <HintText>
            <FiInfo size={12} style={{ flexShrink: 0 }} />
            {disabledReason}
          </HintText>
        )}

        {showContinue && (
          <HintWrapper
            onMouseEnter={() => !canContinue && setTooltipVisible(true)}
            onMouseLeave={() => setTooltipVisible(false)}
          >
            <ContinueButton
              $isSubmit={isSubmit}
              onClick={onContinue}
              disabled={!canContinue || isLoading}
              aria-label={continueLabel}
            >
              {isLoading ? 'Please wait...' : continueLabel}
              {!isSubmit && !isLoading && <FiArrowRight size={14} />}
              {isSubmit && !isLoading && <FiSend size={14} />}
            </ContinueButton>

            {!canContinue && disabledReason && (
              <TooltipPopup $visible={tooltipVisible} role="tooltip">
                {disabledReason}
              </TooltipPopup>
            )}
          </HintWrapper>
        )}
      </RightActions>
    </ActionsBar>
  );
};

export default StepActions;
