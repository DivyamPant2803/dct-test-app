import styled from 'styled-components';

const Sidebar = styled.div`
  width: 210px;
  background: #fff;
  border-right: 1px solid #f3f4f6;
  display: flex;
  flex-direction: column;
  margin: 0;
  border-radius: 0;
  box-shadow: none;
`;
const SidebarTitle = styled.div`
  font-weight: 600;
  font-size: 1.05em;
  padding: 18px 18px 8px 18px;
  color: #1e293b;
`;
const SidebarItem = styled.div<{ selected?: boolean }>`
  padding: 10px 18px;
  cursor: pointer;
  background: ${({ selected }) => selected ? '#f8fafc' : 'transparent'};
  font-weight: ${({ selected }) => selected ? 600 : 400};
  color: ${({ selected }) => selected ? '#111' : '#334155'};
  border-left: ${({ selected }) => selected ? '3px solid #111' : '3px solid transparent'};
  border-radius: 0;
  margin-bottom: 2px;
  font-size: 1em;
  transition: background 0.16s, color 0.16s, border 0.16s;
  &:hover {
    background: #f3f4f6;
    color: #111;
  }
`;
const SidebarSearch = styled.input`
  margin: 0 18px 10px 18px;
  padding: 7px 12px;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  font-size: 0.98em;
  background: #f8fafc;
  color: #222;
  outline: none;
  margin-bottom: 12px;
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