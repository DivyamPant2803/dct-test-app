import React from 'react';
import styled, { css } from 'styled-components';
import { FiCheck, FiAlertCircle, FiMinus } from 'react-icons/fi';
import { colors, spacing, borderRadius, shadows } from '../../styles/designTokens';
import { MerSectionStatus } from '../../utils/merTemplateSectionStatus';

const CIRCLE = 48;
const LINE = 4;
/** Icon fills most of the circle (Feather defaults can look tiny without explicit svg size) */
const ICON_IN_CIRCLE = Math.round(CIRCLE * 0.30);
/** Space between step circles; scroll-spy + sticky rail provide section alignment */
const CONNECTOR_MIN = 36;

const Track = styled.nav`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: ${spacing.md} ${spacing.sm};
  background: ${colors.background.paper};
  border: 1px solid ${colors.neutral.gray200};
  border-radius: ${borderRadius.lg};
  box-shadow: ${shadows.sm};
`;

const NavTitle = styled.div`
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${colors.text.tertiary};
  margin-bottom: ${spacing.md};
  margin-left: calc(${CIRCLE}px + ${spacing.md});
`;

const StepList = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const StepRow = styled.li`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: ${spacing.md};
`;

const RailCol = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: ${CIRCLE}px;
  flex-shrink: 0;
`;

const VConnector = styled.div<{ $tone: 'success' | 'warning' | 'error' | 'neutral' }>`
  width: ${LINE}px;
  min-height: ${CONNECTOR_MIN}px;
  flex: 1 1 ${CONNECTOR_MIN}px;
  margin: 2px 0;
  border-radius: ${borderRadius.full};
  background: ${props => {
    switch (props.$tone) {
      case 'success':
        return colors.semantic.success;
      case 'warning':
        return colors.semantic.warning;
      case 'error':
        return colors.semantic.error;
      default:
        return colors.neutral.gray300;
    }
  }};
  opacity: ${props => (props.$tone === 'neutral' ? 0.85 : 1)};
`;

const CircleBtn = styled.button<{
  $status: MerSectionStatus;
  $active: boolean;
}>`
  width: ${CIRCLE}px;
  height: ${CIRCLE}px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    background 0.15s ease,
    border-color 0.15s ease;
  border: 3px solid transparent;

  ${props => {
    switch (props.$status) {
      case 'complete':
        return css`
          background: ${colors.semantic.success};
          color: white;
          border-color: ${colors.semantic.success};
        `;
      case 'in_progress':
        return css`
          background: ${colors.semantic.warning};
          color: ${colors.neutral.gray900};
          border-color: ${colors.semantic.warning};
        `;
      case 'error':
        return css`
          background: ${colors.semantic.error};
          color: white;
          border-color: ${colors.semantic.error};
        `;
      default:
        return css`
          background: white;
          color: ${colors.text.tertiary};
          border-color: ${colors.neutral.gray300};
        `;
    }
  }}

  ${props =>
    props.$active &&
    css`
      box-shadow: 0 0 0 4px ${colors.status.underReview}55;
      border-color: ${colors.neutral.black};
      transform: scale(1.05);
    `}

  &:hover {
    transform: scale(${props => (props.$active ? 1.05 : 1.03)});
  }

  &:focus-visible {
    outline: 3px solid ${colors.status.underReview};
    outline-offset: 2px;
  }

  & > svg {
    width: ${ICON_IN_CIRCLE}px;
    height: ${ICON_IN_CIRCLE}px;
    min-width: ${ICON_IN_CIRCLE}px;
    min-height: ${ICON_IN_CIRCLE}px;
    flex-shrink: 0;
    stroke-width: 2.75px;
  }
`;

const TextCol = styled.div`
  flex: 1;
  min-width: 0;
  padding-bottom: ${spacing.sm};
`;

const StepTitleBtn = styled.button`
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: ${colors.text.primary};
  line-height: 1.35;
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
  text-align: left;
  width: 100%;
  font-family: inherit;

  &:hover {
    color: ${colors.status.underReview};
  }

  &:focus-visible {
    outline: 2px solid ${colors.status.underReview};
    outline-offset: 2px;
    border-radius: ${borderRadius.sm};
  }
`;

const StepMeta = styled.span<{ $status: MerSectionStatus }>`
  display: block;
  margin-top: 4px;
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: ${props => {
    switch (props.$status) {
      case 'complete':
        return colors.semantic.success;
      case 'in_progress':
        return colors.semantic.warning;
      case 'error':
        return colors.semantic.error;
      default:
        return colors.text.tertiary;
    }
  }};
`;

function statusLabel(s: MerSectionStatus): string {
  switch (s) {
    case 'complete':
      return 'Complete';
    case 'in_progress':
      return 'In progress';
    case 'error':
      return 'Open items';
    default:
      return 'Not started';
  }
}

function connectorTone(st: MerSectionStatus): 'success' | 'warning' | 'error' | 'neutral' {
  switch (st) {
    case 'complete':
      return 'success';
    case 'in_progress':
      return 'warning';
    case 'error':
      return 'error';
    default:
      return 'neutral';
  }
}

function circleContent(st: MerSectionStatus) {
  const s = ICON_IN_CIRCLE;
  switch (st) {
    case 'complete':
      return <FiCheck size={s} strokeWidth={3} aria-hidden />;
    case 'in_progress':
      return <FiMinus size={s} strokeWidth={3} aria-hidden />;
    case 'error':
      return <FiAlertCircle size={s} strokeWidth={2.75} aria-hidden />;
    default:
      return (
        <span
          aria-hidden
          style={{
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: colors.neutral.gray300,
          }}
        />
      );
  }
}

export interface MerSectionStepperProps {
  sectionIdsOrdered: { id: string; title: string }[];
  statuses: Record<string, MerSectionStatus>;
  activeSectionId: string | null;
  onSectionSelect: (sectionId: string) => void;
  /** Section IDs with open review comments — shown as red until cleared */
  sectionFollowUpIds?: readonly string[];
}

const MerSectionStepper: React.FC<MerSectionStepperProps> = ({
  sectionIdsOrdered,
  statuses,
  activeSectionId,
  onSectionSelect,
  sectionFollowUpIds,
}) => {
  if (sectionIdsOrdered.length === 0) return null;

  const followUp = sectionFollowUpIds ? new Set(sectionFollowUpIds) : null;
  const lastIndex = sectionIdsOrdered.length - 1;

  return (
    <Track aria-label="MER template sections">
      <NavTitle>Sections</NavTitle>
      <StepList>
        {sectionIdsOrdered.map(({ id, title }, index) => {
          const base = statuses[id] ?? 'not_started';
          const hasFollowUp = followUp?.has(id);
          const st: MerSectionStatus = hasFollowUp ? 'error' : base;
          const active = activeSectionId === id;
          const metaText = hasFollowUp ? 'Comments' : statusLabel(st);

          return (
            <StepRow key={id}>
              <RailCol>
                <CircleBtn
                  type="button"
                  $status={st}
                  $active={active}
                  onClick={() => onSectionSelect(id)}
                  aria-current={active ? 'step' : undefined}
                  aria-label={`${title}, ${metaText}`}
                >
                  {circleContent(st)}
                </CircleBtn>
                {index < lastIndex && <VConnector $tone={connectorTone(st)} aria-hidden />}
              </RailCol>
              <TextCol>
                <StepTitleBtn type="button" onClick={() => onSectionSelect(id)}>
                  {title}
                </StepTitleBtn>
                <StepMeta $status={st}>{metaText}</StepMeta>
              </TextCol>
            </StepRow>
          );
        })}
      </StepList>
    </Track>
  );
};

export default MerSectionStepper;
