import styled from 'styled-components';

export const SidebarContainer = styled.div`
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

export const SidebarGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

export const SidebarGroupHeader = styled.div<{ $isExpanded: boolean }>`
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

export const SidebarGroupContent = styled.div<{ $isExpanded: boolean }>`
  display: ${props => props.$isExpanded ? 'flex' : 'none'};
  flex-direction: column;
`;

export const SidebarItem = styled.button<{ $isActive: boolean; $disabled?: boolean }>`
  padding: 1.25rem 1.5rem;
  border: none;
  background: ${props => props.$isActive ? 'white' : 'transparent'};
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  font-weight: ${props => props.$isActive ? '600' : 'normal'};
  color: ${props => {
    if (props.$disabled) return '#ccc';
    return props.$isActive ? '#000' : '#666';
  }};
  border-left: 4px solid ${props => {
    if (props.$disabled) return 'transparent';
    if (props.$isActive) return '#000';
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
    background: ${props => props.$disabled ? 'transparent' : 'white'};
    color: ${props => props.$disabled ? '#ccc' : '#000'};
  }
`;

export const ExpandButton = styled.button<{ $isExpanded: boolean }>`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  color: #666;
  transform: rotate(${props => props.$isExpanded ? '180deg' : '0deg'});
  transition: transform 0.3s ease;
  
  &:hover {
    color: #333;
  }
`;
