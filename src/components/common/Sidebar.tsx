import React from 'react';
import {
  SidebarContainer,
  SidebarGroup,
  SidebarGroupHeader,
  SidebarGroupContent,
  SidebarItem,
  ExpandButton
} from './Sidebar.styles';

export interface SidebarGroupItem {
  id: string;
  label: string;
  disabled?: boolean;
}

export interface SidebarGroup {
  id: string;
  label: string;
  items: SidebarGroupItem[];
  isExpanded: boolean;
}

export interface SidebarProps {
  groups: SidebarGroup[];
  activeItemId: string;
  onItemClick: (itemId: string) => void;
  onGroupToggle: (groupId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  groups,
  activeItemId,
  onItemClick,
  onGroupToggle
}) => {
  return (
    <SidebarContainer>
      {groups.map((group) => (
        <SidebarGroup key={group.id}>
          <SidebarGroupHeader 
            $isExpanded={group.isExpanded}
            onClick={() => onGroupToggle(group.id)}
          >
            <span>{group.label}</span>
            <ExpandButton $isExpanded={group.isExpanded}>▼</ExpandButton>
          </SidebarGroupHeader>
          <SidebarGroupContent $isExpanded={group.isExpanded}>
            {group.items.map((item) => (
              <SidebarItem
                key={item.id}
                $isActive={activeItemId === item.id}
                $disabled={item.disabled}
                onClick={() => !item.disabled && onItemClick(item.id)}
              >
                {item.label}
              </SidebarItem>
            ))}
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </SidebarContainer>
  );
};

export default Sidebar;
