import React from 'react';
import styled from 'styled-components';
import { ControlMetadata, getAllControls } from '../../services/controlService';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Title = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: #222;
  margin-bottom: 0.5rem;
`;

const ControlsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
`;

const ControlCard = styled.button<{ $selected: boolean }>`
  padding: 1.5rem;
  border: 2px solid ${props => props.$selected ? '#000' : '#e0e0e0'};
  border-radius: 8px;
  background: ${props => props.$selected ? '#f8f8f8' : 'white'};
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${props => props.$selected ? '#000' : '#999'};
    background: ${props => props.$selected ? '#f8f8f8' : '#fafafa'};
  }
`;

const ControlTypeLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
`;

const ControlId = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #222;
  margin-bottom: 0.25rem;
`;

const ControlName = styled.div`
  font-size: 0.9rem;
  color: #666;
`;

interface ControlSelectorProps {
  selectedControl: ControlMetadata | null;
  onSelect: (control: ControlMetadata) => void;
}

const ControlSelector: React.FC<ControlSelectorProps> = ({ selectedControl, onSelect }) => {
  const controls = getAllControls();

  return (
    <Container>
      <Title>Select Data Transfer Control</Title>
      <ControlsGrid>
        {controls.map((control) => (
          <ControlCard
            key={control.controlId}
            $selected={selectedControl?.controlId === control.controlId}
            onClick={() => onSelect(control)}
          >
            <ControlTypeLabel>{control.controlType}</ControlTypeLabel>
            <ControlId>{control.controlId}</ControlId>
            <ControlName>{control.applicationName}</ControlName>
          </ControlCard>
        ))}
      </ControlsGrid>
    </Container>
  );
};

export default ControlSelector;

