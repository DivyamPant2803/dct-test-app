import React, { useRef, useEffect, useMemo } from 'react';
import { List, AutoSizer } from 'react-virtualized';
import styled from 'styled-components';
import { EntitySummary } from '../../types/requirements';
import EntityTreeItemComponent from './EntityTreeItem';
import VersionItem from './VersionItem';

const ListContainer = styled.div`
  flex: 1;
  min-height: 0;
  overflow: hidden;
`;

interface VirtualizedEntityListProps {
  entities: EntitySummary[];
  expandedEntities: Set<string>;
  expandedVersions: Set<string>;
  selectedVersions: Set<string>;
  selectedCombinations: Set<string>;
  loadingVersions: Set<string>;
  onEntityToggle: (entityId: string) => Promise<void>;
  onVersionToggle: (versionId: string) => Promise<void>;
  onEntitySelect: (entityId: string, selectAll: boolean) => void;
  onVersionSelect: (versionId: string, selectAll: boolean) => void;
  onCombinationSelect: (combinationId: string) => void;
  onEntityReaffirm: (entityId: string) => Promise<void>;
  onVersionReaffirm: (versionId: string) => Promise<void>;
  onCombinationReaffirm: (combinationId: string) => Promise<void>;
  height: number;
}


// Flatten tree structure for virtualization
const flattenTreeStructure = (
  entities: EntitySummary[], 
  expandedEntities: Set<string>, 
  expandedVersions: Set<string>
): any[] => {
  const flattened: any[] = [];
  
  entities.forEach(entity => {
    // Add entity
    flattened.push({
      id: entity.id,
      type: 'entity',
      level: 0,
      isExpanded: expandedEntities.has(entity.id),
      isVisible: true,
      entity,
      versions: entity.versions || []
    });
    
    // Add versions if entity is expanded
    if (expandedEntities.has(entity.id) && entity.versionsLoaded) {
      entity.versions.forEach(version => {
        flattened.push({
          id: version.id,
          type: 'version',
          level: 1,
          isExpanded: expandedVersions.has(version.id),
          isVisible: true,
          parentId: entity.id,
          version,
          entityId: entity.id,
          combinations: version.combinations || []
        });
        
        // Add combinations if version is expanded
        if (expandedVersions.has(version.id)) {
          version.combinations.forEach(combo => {
            flattened.push({
              id: combo.id,
              type: 'combination',
              level: 2,
              isExpanded: false,
              isVisible: true,
              parentId: version.id,
              combination: combo,
              versionId: version.id,
              entityId: entity.id
            });
          });
        }
      });
    }
  });
  
  return flattened;
};

// Calculate dynamic height for each tree item
const getItemSize = (index: number, flattenedItems: any[]): number => {
  const item = flattenedItems[index];
  
  switch (item.type) {
    case 'entity':
      return 50; // Entity header height
    case 'version':
      return 50; // Version header height
    case 'combination':
      return 60; // Combination item height (includes description)
    default:
      return 50;
  }
};

// Item renderer for react-virtualized tree structure
const TreeItemRenderer = ({ index, key, style, flattenedItems, expandedEntities, expandedVersions, selectedVersions, selectedCombinations, onEntityToggle, onVersionToggle, onEntitySelect, onVersionSelect, onCombinationSelect, onEntityReaffirm, onVersionReaffirm, onCombinationReaffirm }: {
  index: number;
  key: string;
  style: React.CSSProperties;
  flattenedItems: any[];
  expandedEntities: Set<string>;
  expandedVersions: Set<string>;
  selectedVersions: Set<string>;
  selectedCombinations: Set<string>;
  onEntityToggle: (entityId: string) => Promise<void>;
  onVersionToggle: (versionId: string) => Promise<void>;
  onEntitySelect: (entityId: string, selectAll: boolean) => void;
  onVersionSelect: (versionId: string, selectAll: boolean) => void;
  onCombinationSelect: (combinationId: string) => void;
  onEntityReaffirm: (entityId: string) => Promise<void>;
  onVersionReaffirm: (versionId: string) => Promise<void>;
  onCombinationReaffirm: (combinationId: string) => Promise<void>;
}) => {
  const item = flattenedItems[index];
  
  const renderItem = () => {
    switch (item.type) {
      case 'entity':
        return (
          <EntityTreeItemComponent
            entity={item.entity}
            versions={item.versions}
            isExpanded={expandedEntities.has(item.id)}
            selectedVersions={selectedVersions}
            onToggle={() => onEntityToggle(item.id)}
            onEntitySelect={onEntitySelect}
            onEntityReaffirm={onEntityReaffirm}
          />
        );
      case 'version':
        return (
          <VersionItem
            version={item.version}
            entityId={item.entityId}
            isExpanded={expandedVersions.has(item.id)}
            selectedCombinations={selectedCombinations}
            onToggle={() => onVersionToggle(item.id)}
            onVersionSelect={onVersionSelect}
            onCombinationSelect={onCombinationSelect}
            onCombinationReaffirm={onCombinationReaffirm}
            onVersionReaffirm={onVersionReaffirm}
          />
        );
      case 'combination':
        return (
          <div style={{ marginLeft: '40px' }}>
            {/* Combination item will be rendered by VersionItem */}
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div key={key} style={style}>
      {renderItem()}
    </div>
  );
};

const VirtualizedEntityList: React.FC<VirtualizedEntityListProps> = ({
  entities,
  expandedEntities,
  expandedVersions,
  selectedVersions,
  selectedCombinations,
  loadingVersions,
  onEntityToggle,
  onVersionToggle,
  onEntitySelect,
  onVersionSelect,
  onCombinationSelect,
  onEntityReaffirm,
  onVersionReaffirm,
  onCombinationReaffirm,
  height
}) => {
  const listRef = useRef<List>(null);

  // Flatten tree structure for virtualization
  const flattenedItems = useMemo(() => 
    flattenTreeStructure(entities, expandedEntities, expandedVersions),
    [entities, expandedEntities, expandedVersions]
  );

  // Create a function that calculates item size
  const getItemSizeWithData = (index: number) => getItemSize(index, flattenedItems);

  // Reset the list when expanded items change
  useEffect(() => {
    if (listRef.current) {
      listRef.current.recomputeRowHeights(0);
    }
  }, [expandedEntities, expandedVersions, loadingVersions]);

  return (
    <ListContainer>
      <AutoSizer>
        {({ width }) => (
          <List
            ref={listRef}
            height={height}
            width={width}
            rowCount={flattenedItems.length}
            rowHeight={({ index }) => getItemSizeWithData(index)}
            rowRenderer={({ index, key, style }) => (
              <TreeItemRenderer
                key={key}
                index={index}
                style={style}
                flattenedItems={flattenedItems}
                expandedEntities={expandedEntities}
                expandedVersions={expandedVersions}
                selectedVersions={selectedVersions}
                selectedCombinations={selectedCombinations}
                onEntityToggle={onEntityToggle}
                onVersionToggle={onVersionToggle}
                onEntitySelect={onEntitySelect}
                onVersionSelect={onVersionSelect}
                onCombinationSelect={onCombinationSelect}
                onEntityReaffirm={onEntityReaffirm}
                onVersionReaffirm={onVersionReaffirm}
                onCombinationReaffirm={onCombinationReaffirm}
              />
            )}
            overscanRowCount={5}
          />
        )}
      </AutoSizer>
    </ListContainer>
  );
};

export default VirtualizedEntityList;
