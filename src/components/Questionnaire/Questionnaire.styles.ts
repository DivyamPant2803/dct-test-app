import styled from 'styled-components';

export const Form = styled.form`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: white;
`;

export const TabsContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 280px;
  min-width: 280px;
  background: #f8f8f8;
  border-right: 1px solid #eee;
  overflow-y: auto;
  flex-shrink: 0;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #ddd;
    border-radius: 3px;
  }
`;

export const TabGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

export const TabGroupHeader = styled.div<{ isExpanded: boolean }>`
  padding: 1rem 1.5rem;
  background: #f0f0f0;
  font-weight: 500;
  color: #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  border-bottom: 1px solid #eee;
  transition: background-color 0.2s ease;

  &:hover {
    background: #e8e8e8;
  }
`;

export const TabGroupContent = styled.div<{ isExpanded: boolean }>`
  display: ${props => props.isExpanded ? 'flex' : 'none'};
  flex-direction: column;
`;

export const StepNumber = styled.span<{ status: 'completed' | 'current' | 'pending' }>`
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.status === 'pending' ? '#999' : props.status === 'completed' ? '#fff' : '#000'};
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  transition: all 0.3s ease;
`;

export const ProgressIndicator = styled.div<{ status: 'completed' | 'current' | 'pending' }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  position: relative;
  margin-right: 16px;
  flex-shrink: 0;
  background: ${props => {
    switch (props.status) {
      case 'completed':
        return '#000';
      case 'current':
        return '#fff';
      default:
        return '#fff';
    }
  }};
  border: ${props => {
    switch (props.status) {
      case 'completed':
        return '2px solid #000';
      case 'current':
        return '2px solid #000';
      default:
        return '2px solid #ddd';
    }
  }};
  transition: all 0.3s ease;
  
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    border-radius: 50%;
    border: 2px solid transparent;
    transition: all 0.3s ease;
  }

  ${props => props.status === 'current' && `
    &::before {
      border-color: rgba(0, 0, 0, 0.1);
      transform: scale(1.2);
    }
  `}
`;

export const Tab = styled.button.attrs<{ isActive: boolean; disabled: boolean; isNextEnabled: boolean }>(props => ({
  type: 'button',
  'aria-selected': props.isActive,
  'data-next-enabled': props.isNextEnabled,
}))`
  padding: 1.25rem 1.5rem;
  border: none;
  background: ${props => props.isActive ? 'white' : 'transparent'};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  font-weight: ${props => props.isActive ? '600' : 'normal'};
  color: ${props => {
    if (props.disabled) return '#ccc';
    if (props.isNextEnabled) return '#000';
    return props.isActive ? '#000' : '#666';
  }};
  border-left: 4px solid ${props => {
    if (props.disabled) return 'transparent';
    if (props.isActive) return '#000';
    if (props.isNextEnabled) return 'rgba(0, 0, 0, 0.2)';
    return 'transparent';
  }};
  transition: all 0.3s ease;
  text-align: left;
  position: relative;
  display: flex;
  align-items: center;
  font-size: 0.95rem;
  min-height: 56px;

  &:hover {
    background: ${props => props.disabled ? 'transparent' : 'white'};
    color: ${props => props.disabled ? '#ccc' : '#000'};
  }

  ${props => props.isActive && !props.disabled && `
    &:hover ${ProgressIndicator}::before {
      transform: scale(1.3);
    }
  `}
`;

export const ExpandButton = styled.button<{ isExpanded: boolean }>`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  color: #666;
  transform: rotate(${props => props.isExpanded ? '180deg' : '0deg'});
  transition: transform 0.3s ease;
  
  &:hover {
    color: #333;
  }
`;

export const FlagContainer = styled.div`
  width: 30px;
  height: 20px;
  overflow: hidden;
  border-radius: 2px;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

// ... (continue for all other styled-components in the file) ... 