// ConfigJson document model — mirrors §4 of the spec exactly.

export type CardType =
  | 'RichText'
  | 'LinkList'
  | 'NoticeList'
  | 'Timeline'
  | 'Metric'
  | 'Chart'
  | 'ActivityFeed';

export type CardSize = 'Small' | 'Medium' | 'Large' | 'FullWidth';

export type ContentModel = 'Prose' | 'Structured' | 'Data';

export const CARD_TYPE_CONTENT_MODEL: Record<CardType, ContentModel> = {
  RichText: 'Prose',
  LinkList: 'Structured',
  NoticeList: 'Structured',
  Timeline: 'Structured',
  Metric: 'Data',
  Chart: 'Data',
  ActivityFeed: 'Data',
};

export const DATA_PROVIDER_KEYS = [
  'total-requests',
  'pending-approvals',
  'active-transfers',
  'completed-30d',
  'sla-performance',
  'escalations',
  'team-workload',
  'approval-queue',
  'my-open-requests',
  'requests-awaiting-action',
  'recently-completed',
  'transfer-status-summary',
] as const;

export type DataProviderKey = (typeof DATA_PROVIDER_KEYS)[number];

export interface CardItem {
  id: string;
  order: number;
  title: string | null;
  bodyHtml: string | null;
  url: string | null;
  iconKey: string | null;
  badgeText: string | null;
  effectiveFromUtc: string | null;
  effectiveToUtc: string | null;
  extra: Record<string, unknown>;
}

export interface Card {
  id: string;
  type: CardType;
  header: string;
  subtitle: string | null;
  size: CardSize;
  order: number;
  enabled: boolean;
  // Prose
  bodyHtml: string | null;
  // Structured
  items: CardItem[];
  // Data
  dataProviderKey: DataProviderKey | null;
  settings: Record<string, unknown>;
}

export interface RoleLayout {
  cards: Card[];
}

export interface ConfigJson {
  schemaVersion: number;
  roles: Record<string, RoleLayout>;
}

// API response shapes
export interface HomepageResponse {
  versionNo: number;
  role: string;
  cards: Card[];
}

export interface BatchDataRequest {
  cardIds: string[];
}

export interface CardTrend {
  deltaPct: number;
  vs: string;
}

export interface CardDataResult {
  value?: number | string | null;
  trend?: CardTrend;
  series?: unknown[];
  items?: unknown[];
  error?: string;
  asOfUtc: string;
}

export interface BatchDataResponse {
  results: Record<string, CardDataResult>;
}

export interface RoleMeta {
  roleKey: string;
  displayName: string;
  precedence: number;
  isEnabled: boolean;
  isFallback: boolean;
}

// Admin API shapes
export type DraftStatus = 'Draft' | 'Submitted' | 'Live' | 'Superseded';

export interface HomepageVersionSummary {
  versionId: number;
  versionNo: number;
  title: string | null;
  status: DraftStatus;
  createdBy: string;
  createdAtUtc: string;
  submittedBy: string | null;
  submittedAtUtc: string | null;
  reviewedBy: string | null;
  reviewedAtUtc: string | null;
  wentLiveAtUtc: string | null;
}

export interface DraftMeta extends HomepageVersionSummary {
  config: ConfigJson;
  etag: string;
}

export type DiffChangeType = 'Added' | 'Removed' | 'Edited' | 'Reordered';

export interface DiffChange {
  role: string;
  cardId: string;
  change: DiffChangeType;
  header: string;
  fields?: string[];
}

export interface DiffResult {
  vsVersionNo: number;
  changes: DiffChange[];
}

export interface VersionEvent {
  versionEventId: number;
  versionId: number;
  eventType: 'Created' | 'Submitted' | 'Approved' | 'Rejected' | 'RolledBack' | 'Discarded';
  performedBy: string;
  performedAtUtc: string;
  comments: string | null;
}

export interface AdminStateResponse {
  live: HomepageVersionSummary | null;
  inFlight: HomepageVersionSummary | null;
}
