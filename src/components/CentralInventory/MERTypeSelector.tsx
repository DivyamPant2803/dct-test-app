import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { MERType } from '../../types/index';
import { FiMapPin, FiServer, FiCheck } from 'react-icons/fi';
import { colors, borderRadius, shadows, spacing } from '../../styles/designTokens';

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.lg};
`;

const Description = styled.p`
  font-size: 0.9rem;
  color: ${colors.text.secondary};
  line-height: 1.6;
  margin: 0;
  text-align: left;
  max-width: 72ch;
`;

const CardsGrid = styled.div`
  display: grid;
  width: 100%;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
  gap: ${spacing.lg};
`;

const MERCard = styled.button<{ $selected: boolean; $disabled?: boolean }>`
  padding: ${spacing.xl};
  border: 2px solid ${props => props.$selected ? colors.status.underReview : colors.neutral.gray200};
  border-radius: ${borderRadius.lg};
  background: ${props => props.$selected ? `${colors.status.underReview}08` : 'white'};
  cursor: ${props => (props.$disabled ? 'not-allowed' : 'pointer')};
  text-align: left;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
  opacity: ${props => (props.$disabled ? 0.45 : 1)};

  &:hover {
    border-color: ${props => (props.$disabled ? colors.neutral.gray200 : colors.status.underReview)};
    background: ${props => {
      if (props.$disabled) return 'white';
      return props.$selected ? `${colors.status.underReview}12` : `${colors.status.underReview}04`;
    }};
    transform: ${props => (props.$disabled ? 'none' : 'translateY(-2px)')};
    box-shadow: ${props => (props.$disabled ? 'none' : shadows.md)};
  }

  &:focus-visible {
    outline: 2px solid ${colors.status.underReview};
    outline-offset: 2px;
  }

  &:active {
    transform: translateY(0);
  }
`;

const CardIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${borderRadius.full};
  background: ${colors.status.underReview}15;
  color: ${colors.status.underReview};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${spacing.md};
  font-size: 1.4rem;
`;

const CardTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: ${colors.text.primary};
  margin-bottom: ${spacing.sm};
`;

const CardDescription = styled.p`
  font-size: 0.875rem;
  color: ${colors.text.secondary};
  line-height: 1.5;
  margin: 0;
`;

const SelectedOverlay = styled.div`
  position: absolute;
  top: ${spacing.md};
  right: ${spacing.md};
  background: ${colors.status.underReview};
  color: white;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${fadeIn} 0.2s ease;
`;

const SelectingHint = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  padding: ${spacing.md} ${spacing.lg};
  background: ${colors.status.underReview}08;
  border: 1px solid ${colors.status.underReview}25;
  border-radius: ${borderRadius.base};
  font-size: 0.875rem;
  color: ${colors.status.underReview};
  font-weight: 500;
`;

const EmptyHint = styled.div`
  padding: ${spacing.md} ${spacing.lg};
  background: ${colors.semantic.warning}10;
  border: 1px solid ${colors.semantic.warning}35;
  border-radius: ${borderRadius.base};
  font-size: 0.875rem;
  color: ${colors.text.primary};
`;

interface MERTypeSelectorProps {
  selectedMERType: MERType | null;
  onSelect: (merType: MERType) => void;
  /** When provided, only these MER types can be selected (based on selected controls). */
  allowedMerTypes?: MERType[];
}

const ALL_TYPES: MERType[] = ['MER-13', 'MER-14'];

const MERTypeSelector: React.FC<MERTypeSelectorProps> = ({
  selectedMERType,
  onSelect,
  allowedMerTypes,
}) => {
  const [justSelected, setJustSelected] = useState<MERType | null>(null);

  const effectiveAllowed = allowedMerTypes?.length ? allowedMerTypes : ALL_TYPES;

  const merTypes = [
    {
      type: 'MER-13' as MERType,
      icon: <FiMapPin />,
      title: 'MER-13: Data Classification & Location',
      description: 'Document data storage locations, classification levels, and compliance requirements for your application.',
    },
    {
      type: 'MER-14' as MERType,
      icon: <FiServer />,
      title: 'MER-14: Hosting & Architecture',
      description: 'Capture hosting infrastructure, deployment models, and architectural diagrams for compliance review.',
    },
  ];

  const handleCardClick = (merType: MERType) => {
    if (!effectiveAllowed.includes(merType)) return;
    setJustSelected(merType);
    onSelect(merType);
  };

  return (
    <Container>
      <Description>
        Choose the Minimum Enterprise Requirement (MER) type that applies to your data transfer request.
        Available types depend on the controls you selected.
      </Description>

      {allowedMerTypes && allowedMerTypes.length === 0 && (
        <EmptyHint role="alert">
          No MER type is valid for all selected controls. Go back and adjust your control selection.
        </EmptyHint>
      )}

      <CardsGrid role="radiogroup" aria-label="Select MER type">
        {merTypes.map(mer => {
          const disabled = !effectiveAllowed.includes(mer.type);
          return (
            <MERCard
              key={mer.type}
              $selected={selectedMERType === mer.type}
              $disabled={disabled}
              onClick={() => handleCardClick(mer.type)}
              type="button"
              role="radio"
              aria-checked={selectedMERType === mer.type}
              aria-disabled={disabled}
              disabled={disabled}
              title={disabled ? 'Not available for the selected control combination' : undefined}
              aria-label={mer.title}
            >
              {selectedMERType === mer.type && (
                <SelectedOverlay aria-hidden="true">
                  <FiCheck size={14} />
                </SelectedOverlay>
              )}
              <CardIcon aria-hidden="true">{mer.icon}</CardIcon>
              <CardTitle>{mer.title}</CardTitle>
              <CardDescription>{mer.description}</CardDescription>
            </MERCard>
          );
        })}
      </CardsGrid>

      {justSelected && selectedMERType && (
        <SelectingHint aria-live="polite">
          <FiCheck size={14} />
          {selectedMERType} selected — proceeding to application identification…
        </SelectingHint>
      )}
    </Container>
  );
};

export default MERTypeSelector;
