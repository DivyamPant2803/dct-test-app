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
const SidebarSearch = styled.input`
  margin: 0 18px 10px 18px;
  padding: 7px 12px;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  font-size: 1em;
`;

const EntitiesSidebar = ({ selectedEntity, onSelect }: { selectedEntity: string, onSelect: (e: string) => void }) => (
  <Sidebar>
    <SidebarTitle>Entities</SidebarTitle>
    {/* TODO: Add search, pin/favorite, infinite scroll, sorting */}
    <SidebarSearch placeholder="Search" />
    <SidebarItem selected={selectedEntity === 'entityA'} onClick={() => onSelect('entityA')}>Entity A</SidebarItem>
    <SidebarItem selected={selectedEntity === 'entityB'} onClick={() => onSelect('entityB')}>Entity B</SidebarItem>
    <SidebarItem selected={selectedEntity === 'entityC'} onClick={() => onSelect('entityC')}>Entity C</SidebarItem>
    <SidebarItem selected={selectedEntity === 'entityD'} onClick={() => onSelect('entityD')}>Entity D</SidebarItem>
  </Sidebar>
);

export default EntitiesSidebar; 