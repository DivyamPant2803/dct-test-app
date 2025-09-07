import React from 'react';
import styled from 'styled-components';
import TooltipWrapper from './TooltipWrapper';

const ExampleContainer = styled.div`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ExampleButton = styled.button`
  padding: 0.5rem 1rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  
  &:hover {
    background: #0056b3;
  }
`;

const ExampleCard = styled.div`
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #007bff;
    box-shadow: 0 2px 8px rgba(0, 123, 255, 0.1);
  }
`;

const ExampleLink = styled.a`
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

const TooltipWrapperExample: React.FC = () => {
  return (
    <ExampleContainer>
      <h2>TooltipWrapper Usage Examples</h2>
      
      <div>
        <h3>Button with Tooltip</h3>
        <TooltipWrapper tooltipText="This button performs an important action">
          <ExampleButton>Click Me</ExampleButton>
        </TooltipWrapper>
      </div>
      
      <div>
        <h3>Card with Tooltip</h3>
        <TooltipWrapper tooltipText="This card contains important information">
          <ExampleCard>
            <h4>Sample Card</h4>
            <p>This is a sample card that shows how tooltips work with different elements.</p>
          </ExampleCard>
        </TooltipWrapper>
      </div>
      
      <div>
        <h3>Link with Tooltip</h3>
        <TooltipWrapper tooltipText="Click to visit our documentation">
          <ExampleLink href="#" onClick={(e) => e.preventDefault()}>
            Documentation
          </ExampleLink>
        </TooltipWrapper>
      </div>
      
      <div>
        <h3>Custom Element with Tooltip</h3>
        <TooltipWrapper tooltipText="This is a custom styled element">
          <div style={{
            padding: '1rem',
            background: '#f8f9fa',
            border: '2px dashed #dee2e6',
            borderRadius: '8px',
            cursor: 'pointer',
            textAlign: 'center'
          }}>
            Custom Element
          </div>
        </TooltipWrapper>
      </div>
      
      <div>
        <h3>Multiple Elements with Different Tooltips</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <TooltipWrapper tooltipText="Option 1">
            <ExampleButton>Option 1</ExampleButton>
          </TooltipWrapper>
          <TooltipWrapper tooltipText="Option 2">
            <ExampleButton>Option 2</ExampleButton>
          </TooltipWrapper>
          <TooltipWrapper tooltipText="Option 3">
            <ExampleButton>Option 3</ExampleButton>
          </TooltipWrapper>
        </div>
      </div>
    </ExampleContainer>
  );
};

export default TooltipWrapperExample; 