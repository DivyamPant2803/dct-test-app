import styled from 'styled-components';

const Sidebar = styled.div`
  width: 240px;
  background: #fff;
  border-right: 1px solid #eee;
  display: flex;
  flex-direction: column;
  border-radius: 16px 0 0 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  margin: 24px 0 24px 24px;
`;
const SidebarTitle = styled.div`
  font-weight: 700;
  font-size: 1.13em;
  padding: 22px 22px 10px 22px;
  color: #1e293b;
`;
const SidebarItem = styled.div<{ selected?: boolean }>`
  padding: 14px 22px;
  cursor: pointer;
  background: ${({ selected }) => selected ? '#f1f5f9' : 'transparent'};
  font-weight: ${({ selected }) => selected ? 700 : 500};
  color: ${({ selected }) => selected ? '#111' : '#334155'};
  border-left: ${({ selected }) => selected ? '4px solid #111' : '4px solid transparent'};
  border-radius: 8px;
  margin-bottom: 4px;
  font-size: 1.07em;
  transition: background 0.16s, color 0.16s, border 0.16s;
  &:hover {
    background: #f3f4f6;
    color: #111;
  }
`;
const SidebarSearch = styled.input`
  margin: 0 22px 14px 22px;
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  font-size: 1em;
  background: #f8fafc;
  color: #222;
  outline: none;
  margin-bottom: 18px;
`;

interface EntitySidebarProps {
  selectedEntity: string;
  onSelect: (e: string) => void;
  entities: { id: string, name: string }[];
}

const EntitiesSidebar = ({ selectedEntity, onSelect, entities }: EntitySidebarProps) => (
  <Sidebar>
    <SidebarTitle>Entities</SidebarTitle>
    <SidebarSearch placeholder="Search" />
    {entities.map(entity => (
      <SidebarItem
        key={entity.id}
        selected={selectedEntity === entity.id}
        onClick={() => onSelect(entity.id)}
      >
        {entity.name}
      </SidebarItem>
    ))}
  </Sidebar>
);

export default EntitiesSidebar; 