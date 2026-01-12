import React, { useState } from 'react';
import styled from 'styled-components';
import { colors, borderRadius, shadows, spacing } from '../../styles/designTokens';
import { FiUsers } from 'react-icons/fi';
import StyledSelect from '../common/StyledSelect';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
`;

const Modal = styled.div`
  background: ${colors.background.paper};
  border-radius: ${borderRadius.lg};
  box-shadow: ${shadows.lg};
  width: 90%;
  max-width: 500px;
  padding: ${spacing.xl};
`;

const Title = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${colors.text.primary};
  margin: 0 0 ${spacing.md} 0;
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
`;

const Description = styled.p`
  font-size: 0.9rem;
  color: ${colors.text.secondary};
  margin: 0 0 ${spacing.lg} 0;
`;

const FormGroup = styled.div`
  margin-bottom: ${spacing.lg};
`;

const Label = styled.label`
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: ${colors.text.primary};
  margin-bottom: ${spacing.sm};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${spacing.md};
  justify-content: flex-end;
  margin-top: ${spacing.lg};
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: ${spacing.sm} ${spacing.lg};
  border-radius: ${borderRadius.base};
  border: 1px solid ${props => props.$variant === 'primary' ? colors.neutral.black : colors.neutral.gray300};
  background: ${props => props.$variant === 'primary' ? colors.neutral.black : colors.background.paper};
  color: ${props => props.$variant === 'primary' ? colors.neutral.white : colors.text.primary};
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$variant === 'primary' ? colors.neutral.gray800 : colors.neutral.gray100};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

interface DeputizeModalProps {
  onDeputize: (deputyId: string, deputyName: string) => void;
  onClose: () => void;
}

const DeputizeModal: React.FC<DeputizeModalProps> = ({
  onDeputize,
  onClose,
}) => {
  const [selectedDeputy, setSelectedDeputy] = useState('');

  // Mock deputy list - in real app, this would come from persona config or API
const deputies = [
    { value: 'deputy-legal-1', label: 'Sarah Johnson (Deputy Legal)' },
    { value: 'deputy-legal-2', label: 'Michael Chen (Deputy Legal)' },
    { value: 'deputy-business-1', label: 'Emily Davis (Deputy Business)' },
  ];

  const handleSubmit = () => {
    if (selectedDeputy) {
      const deputy = deputies.find(d => d.value === selectedDeputy);
      onDeputize(selectedDeputy, deputy?.label || selectedDeputy);
    }
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Title>
          <FiUsers />
          Deputize MER Review
        </Title>
        <Description>
          Assign this MER submission to another reviewer. They will receive a notification and the submission will appear in their queue.
        </Description>

        <FormGroup>
          <Label>Select Deputy</Label>
          <StyledSelect
            value={selectedDeputy}
            onChange={setSelectedDeputy}
            options={[
              { value: '', label: 'Select a deputy...' },
              ...deputies,
            ]}
          />
        </FormGroup>

        <ButtonGroup>
          <Button $variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            $variant="primary"
            onClick={handleSubmit}
            disabled={!selectedDeputy}
          >
            Deputize
          </Button>
        </ButtonGroup>
      </Modal>
    </Overlay>
  );
};

export default DeputizeModal;
