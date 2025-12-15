import React, { useEffect } from 'react';
import styled from 'styled-components';
import { FiCheckCircle, FiXCircle, FiInfo, FiX } from 'react-icons/fi';
import { colors, transitions, borderRadius, shadows, zIndex } from '../../styles/designTokens';

export interface ToastProps {
  id?: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

const ToastContainer = styled.div<{ $type: string; $isVisible: boolean }>`
  position: fixed;
  top: 20px;
  right: 20px;
  background: ${colors.background.paper};
  border-radius: ${borderRadius.lg};
  box-shadow: ${shadows.md};
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 300px;
  max-width: 500px;
  z-index: ${zIndex.toast};
  transform: ${props => props.$isVisible ? 'translateX(0)' : 'translateX(120%)'};
  opacity: ${props => props.$isVisible ? 1 : 0};
  transition: all ${transitions.slow};
  
  border-left: 4px solid ${props => {
    switch (props.$type) {
      case 'success': return colors.semantic.success;
      case 'error': return colors.semantic.error;
      case 'info': return colors.semantic.info;
      default: return colors.neutral.gray500;
    }
  }};
`;

const Icon = styled.div<{ $type: string }>`
  color: ${props => {
    switch (props.$type) {
      case 'success': return colors.semantic.success;
      case 'error': return colors.semantic.error;
      case 'info': return colors.semantic.info;
      default: return colors.neutral.gray500;
    }
  }};
  font-size: 1.5rem;
  flex-shrink: 0;
`;

const Message = styled.span`
  flex: 1;
  color: ${colors.text.primary};
  font-size: 0.875rem;
  line-height: 1.5;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${colors.text.secondary};
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${borderRadius.sm};
  transition: all ${transitions.base};
  flex-shrink: 0;
  
  &:hover {
    background: ${colors.background.hover};
    color: ${colors.text.primary};
  }
  
  &:focus {
    outline: 2px solid ${colors.status.underReview};
    outline-offset: 2px;
  }
`;

export const Toast: React.FC<ToastProps> = ({ 
  message, 
  type, 
  duration = 3000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = React.useState(false);

  useEffect(() => {
    // Trigger animation
    setTimeout(() => setIsVisible(true), 10);
    
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for animation to complete
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, onClose]);
  
  const getIcon = () => {
    switch (type) {
      case 'success': return <FiCheckCircle />;
      case 'error': return <FiXCircle />;
      case 'info': return <FiInfo />;
    }
  };
  
  return (
    <ToastContainer $type={type} $isVisible={isVisible}>
      <Icon $type={type}>{getIcon()}</Icon>
      <Message>{message}</Message>
      <CloseButton onClick={() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }} aria-label="Close notification">
        <FiX size={18} />
      </CloseButton>
    </ToastContainer>
  );
};


