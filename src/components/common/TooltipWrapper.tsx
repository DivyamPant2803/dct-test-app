import React, { useState } from 'react';
import styled from 'styled-components';

const TooltipContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const Tooltip = styled.div<{ show: boolean }>`
  position: absolute;
  bottom: -40px;
  left: 50%;
  transform: translateX(-50%);
  background: #333;
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  font-size: 0.8rem;
  white-space: nowrap;
  z-index: 9999;
  opacity: ${props => props.show ? 1 : 0};
  visibility: ${props => props.show ? 'visible' : 'hidden'};
  transition: opacity 0.2s ease, visibility 0.2s ease;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-bottom-color: #333;
  }
`;

interface TooltipWrapperProps {
  children: React.ReactNode;
  tooltipText: string;
}

const TooltipWrapper: React.FC<TooltipWrapperProps> = ({ children, tooltipText }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <TooltipContainer
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {children}
      <Tooltip show={showTooltip}>
        {tooltipText}
      </Tooltip>
    </TooltipContainer>
  );
};

export default TooltipWrapper; 