// Enhanced types for the new API structure

import { RequirementCombination, ReaffirmationStatus } from './index';

// New version-based structure
export interface RequirementVersion {
  id: string;
  versionNo: number;
  status: 'CURRENT' | 'DUE_SOON' | 'OVERDUE';
  lastReaffirmedDate?: string;
  nextReaffirmationDate: string;
  combinations: RequirementCombination[];
  totalCombinations: number;
  dueCombinations: number;
  overdueCombinations: number;
  isActive: boolean;
  supersededByVersion?: number;
  createdAt: string;
  createdBy: string;
}

export interface EntitySummary {
  id: string;
  name: string;
  totalRequirements: number;
  dueRequirements: number;
  overdueRequirements: number;
  versionsLoaded: boolean;
  versions: RequirementVersion[];
  totalVersions: number;
  // Keep combinations for backward compatibility during transition
  combinationsLoaded: boolean;
  combinations: RequirementCombination[];
  totalCombinations: number;
}

// Tree structure interfaces
export interface TreeItem {
  id: string;
  type: 'entity' | 'version' | 'combination';
  level: number; // 0 = entity, 1 = version, 2 = combination
  isExpanded: boolean;
  isVisible: boolean;
  parentId?: string;
}

export interface EntityTreeItem extends TreeItem {
  type: 'entity';
  entity: EntitySummary;
  versions: VersionTreeItem[];
}

export interface VersionTreeItem extends TreeItem {
  type: 'version';
  version: RequirementVersion;
  entityId: string;
  combinations: CombinationTreeItem[];
}

export interface CombinationTreeItem extends TreeItem {
  type: 'combination';
  combination: RequirementCombination;
  versionId: string;
  entityId: string;
}

// Legacy interface for backward compatibility
export interface VirtualizedEntityItem {
  id: string;
  type: 'entity';
  entity: EntitySummary;
  isExpanded: boolean;
}

export interface RequirementsApiResponse<T> {
  data: T;
  total: number;
  hasMore: boolean;
  nextOffset?: number;
}

// Selection and action interfaces
export interface TreeSelectionState {
  selectedEntities: Set<string>;
  selectedVersions: Set<string>;
  selectedCombinations: Set<string>;
  expandedEntities: Set<string>;
  expandedVersions: Set<string>;
}

export interface TreeActionHandlers {
  onEntityToggle: (entityId: string) => Promise<void>;
  onVersionToggle: (versionId: string) => Promise<void>;
  onEntitySelect: (entityId: string, selectAll: boolean) => void;
  onVersionSelect: (versionId: string, selectAll: boolean) => void;
  onCombinationSelect: (combinationId: string) => void;
  onEntityReaffirm: (entityId: string) => Promise<void>;
  onVersionReaffirm: (versionId: string) => Promise<void>;
  onCombinationReaffirm: (combinationId: string) => Promise<void>;
}

export interface EntityCombinationsResponse {
  combinations: RequirementCombination[];
  total: number;
  hasMore: boolean;
  nextOffset?: number;
}

export interface EntitiesResponse {
  entities: EntitySummary[];
  totalEntities: number;
  summary: {
    totalRequirements: number;
    currentCount: number;
    dueSoonCount: number;
    overdueCount: number;
  };
}

export interface FilterCriteria {
  entities: string[];
  dataSubjectTypes: string[];
  transferLocations: string[];
  recipientTypes: string[];
  reviewDataTransferPurposes: string[];
  reaffirmationStatuses: ReaffirmationStatus[];
}

// Re-export existing types
export type { 
  RequirementCombination, 
  EntityGroup, 
  BulkReaffirmationRequest,
  ReaffirmationStatus 
} from './index';
