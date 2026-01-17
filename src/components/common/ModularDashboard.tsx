import React from 'react';
import Sidebar, { SidebarGroup } from './Sidebar';
import { 
  DashboardContainer, 
  SidebarWrapper, 
  MainContent 
} from './DashboardComponents';

interface ModularDashboardProps {
  /**
   * Sidebar configuration. Pass an empty array if no sidebar is needed.
   */
  sidebarGroups: SidebarGroup[];
  
  /**
   * Currently active sidebar item ID.
   */
  activeItemId: string;
  
  /**
   * Callback when a sidebar item is clicked.
   */
  onItemChange: (itemId: string) => void;
  
  /**
   * Callback to toggle sidebar groups.
   * If not provided, the dashboard assumes the parent handles this state 
   * (or we could make it stateful, but controlled is better for lifting state up).
   */
  onGroupToggle?: (groupId: string) => void;

  /**
   * Optional content to render above the main content children 
   * (e.g., Stats bar, breadcrumbs, top navigation).
   */
  headerContent?: React.ReactNode;

  /**
   * The main content relevant to the active item.
   * This is where you would render your tables, grids, etc.
   */
  children: React.ReactNode;
}

const ModularDashboard: React.FC<ModularDashboardProps> = ({
  sidebarGroups,
  activeItemId,
  onItemChange,
  onGroupToggle,
  headerContent,
  children
}) => {
  // Default no-op if onGroupToggle is not provided (though ideally it should be)
  const handleGroupToggle = onGroupToggle || ((_id: string) => {});

  const hasSidebar = sidebarGroups.length > 0;

  return (
    <DashboardContainer>
      {hasSidebar && (
        <SidebarWrapper>
          <Sidebar
            groups={sidebarGroups}
            activeItemId={activeItemId}
            onItemClick={onItemChange}
            onGroupToggle={handleGroupToggle}
          />
        </SidebarWrapper>
      )}
      
      <MainContent>
        {headerContent}
        {children}
      </MainContent>
    </DashboardContainer>
  );
};

export default ModularDashboard;
