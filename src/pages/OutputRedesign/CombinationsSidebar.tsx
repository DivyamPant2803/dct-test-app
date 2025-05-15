import React from 'react';
import styled from 'styled-components';

const Sidebar = styled.div`
  width: 220px;
  background: #fff;
  border-right: 1px solid #eee;
  display: flex;
  flex-direction: column;
`;
const SidebarTitle = styled.div`
  font-weight: 600;
  font-size: 1.1em;
  padding: 18px 18px 8px 18px;
`;
const SidebarItem = styled.div<{ selected?: boolean }>`
  padding: 12px 18px;
  cursor: pointer;
  background: ${({ selected }) => selected ? '#f0f0f0' : 'transparent'};
  font-weight: ${({ selected }) => selected ? 600 : 400};
  &:hover { background: #f5f5f5; }
`;
const SidebarFooter = styled.div`
  margin-top: auto;
  padding: 12px 18px;
  font-size: 0.98em;
  color: #888;
  cursor: pointer;
`;

const CombinationsSidebar = ({ selectedCombination, onSelect }: { selectedCombination: string, onSelect: (c: string) => void }) => (
  <Sidebar>
    <SidebarTitle>Combinations</SidebarTitle>
    {/* TODO: Render combinations list, collapse/expand, pin/favorite */}
    <SidebarItem selected={selectedCombination === 'comb1'} onClick={() => onSelect('comb1')}>Combination 1</SidebarItem>
    <SidebarItem selected={selectedCombination === 'comb2'} onClick={() => onSelect('comb2')}>Combination 2</SidebarItem>
    <SidebarItem selected={selectedCombination === 'comb3'} onClick={() => onSelect('comb3')}>Combination 3</SidebarItem>
    <SidebarItem selected={selectedCombination === 'comb4'} onClick={() => onSelect('comb4')}>Combination 4</SidebarItem>
    <SidebarFooter>Collapse</SidebarFooter>
  </Sidebar>
);

export default CombinationsSidebar; 