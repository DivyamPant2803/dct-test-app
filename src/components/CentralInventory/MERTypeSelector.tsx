import React from 'react';
import styled from 'styled-components';
import { MERType } from '../../types/index';
import { FiMapPin, FiServer } from 'react-icons/fi';
import { colors, borderRadius, shadows, spacing } from '../../styles/designTokens';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.lg};
`;

const Title = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${colors.text.primary};
  margin-bottom: ${spacing.base};
`;

const Description = styled.p`
  font-size: 0.95rem;
  color: ${colors.text.secondary};
  margin-bottom: ${spacing.lg};
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${spacing.lg};
`;

const MERCard = styled.button<{ $selected: boolean }>`
  padding: ${spacing.xl};
  border: 2px solid ${props => props.$selected ? colors.status.underReview : colors.neutral.gray300};
  border-radius: ${borderRadius.lg};
  background: ${props => props.$selected ? `${colors.status.underReview}10` : colors.background.paper};
  cursor: pointer;
  text-align: left;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    border-color: ${props => props.$selected ? colors.status.underReview : colors.neutral.gray400};
    background: ${props => props.$selected ? `${colors.status.underReview}20` : colors.neutral.gray50};
    transform: translateY(-2px);
    box-shadow: ${shadows.md};
  }

  &:focus {
    outline: 2px solid ${colors.status.underReview};
    outline-offset: 2px;
  }
`;

const CardIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${borderRadius.full};
  background: ${colors.status.underReview}20;
  color: ${colors.status.underReview};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${spacing.md};
  font-size: 1.5rem;
`;

const CardTitle = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${colors.text.primary};
  margin-bottom: ${spacing.sm};
`;

const CardDescription = styled.p`
  font-size: 0.9rem;
  color: ${colors.text.secondary};
  line-height: 1.5;
`;

const SelectedBadge = styled.div`
  position: absolute;
  top: ${spacing.base};
  right: ${spacing.base};
  background: ${colors.status.underReview};
  color: white;
  padding: 4px 12px;
  border-radius: ${borderRadius.full};
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
`;

const ContinueButton = styled.button<{ $disabled: boolean }>`
  background-color: ${props => props.$disabled ? colors.neutral.gray400 : colors.neutral.black};
  color: white;
  border: none;
  padding: ${spacing.base} ${spacing.xl};
  border-radius: ${borderRadius.base};
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.2s ease;
  align-self: flex-start;
  box-shadow: ${shadows.sm};

  &:hover:not(:disabled) {
    background-color: ${colors.neutral.gray800};
    transform: translateY(-2px);
    box-shadow: ${shadows.base};
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:focus {
    outline: 2px solid ${colors.status.underReview};
    outline-offset: 2px;
  }
`;

interface MERTypeSelectorProps {
  selectedMERType: MERType | null;
  onSelect: (merType: MERType) => void;
  onContinue: () => void;
}

const MERTypeSelector: React.FC<MERTypeSelectorProps> = ({
  selectedMERType,
  onSelect,
  onContinue
}) => {
  const merTypes = [
    {
      type: 'MER-13' as MERType,
      icon: <FiMapPin />,
      title: 'MER-13: Data Classification & Location',
      description: 'Document data storage locations, classification levels, and compliance requirements for your application.'
    },
    {
      type: 'MER-14' as MERType,
      icon: <FiServer />,
      title: 'MER-14: Hosting & Architecture',
      description: 'Capture hosting infrastructure, deployment models, and architectural diagrams for compliance review.'
    }
  ];

  return (
    <Container>
      <div>
        <Title>Select MER Type</Title>
        <Description>
          Choose the Minimum Enterprise Requirement (MER) type that applies to your data transfer request.
          Different MER types have different documentation requirements.
        </Description>
      </div>

      <CardsGrid>
        {merTypes.map((mer) => (
          <MERCard
            key={mer.type}
            $selected={selectedMERType === mer.type}
            onClick={() => onSelect(mer.type)}
            type="button"
          >
            {selectedMERType === mer.type && <SelectedBadge>Selected</SelectedBadge>}
            <CardIcon>{mer.icon}</CardIcon>
            <CardTitle>{mer.title}</CardTitle>
            <CardDescription>{mer.description}</CardDescription>
          </MERCard>
        ))}
      </CardsGrid>

      <ContinueButton
        $disabled={!selectedMERType}
        onClick={onContinue}
        disabled={!selectedMERType}
      >
        Continue to Application Identification
      </ContinueButton>
    </Container>
  );
};

export default MERTypeSelector;
