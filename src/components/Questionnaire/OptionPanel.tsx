import React from 'react';
import styled from 'styled-components';

const StyledOptionPanel = styled.div<{ selected: boolean }>`
  display: flex;
  align-items: flex-start;
  padding: 1rem;
  border: 2px solid ${props => props.selected ? '#000' : '#eee'};
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${props => props.selected ? '#f8f8f8' : 'white'};
  position: relative;
  height: auto;
  min-height: 80px;

  &:hover {
    border-color: #000;
    background-color: ${props => props.selected ? '#f8f8f8' : '#f9f9f9'};
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
`;

const OptionContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
`;

const OptionTitle = styled.span`
  font-size: 1rem;
  font-weight: 500;
  color: #333;
`;

const OptionDescription = styled.span`
  font-size: 0.85rem;
  color: #666;
  line-height: 1.3;
`;

interface OptionPanelProps {
  option: string;
  isSelected: boolean;
  description: string;
  onClick: (e: React.MouseEvent) => void;
}

const OptionPanel: React.FC<OptionPanelProps> = ({
  option,
  isSelected,
  description,
  onClick
}) => {
  return (
    <StyledOptionPanel
      selected={isSelected}
      onClick={onClick}
    >
      <OptionContent>
        <OptionTitle>{option}</OptionTitle>
        <OptionDescription>{description}</OptionDescription>
      </OptionContent>
    </StyledOptionPanel>
  );
};

export default OptionPanel; 