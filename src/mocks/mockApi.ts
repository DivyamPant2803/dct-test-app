/**
 * Mock API layer — simulates all backend endpoints in-memory.
 * Active when VITE_USE_MOCK_API=true.
 *
 * Assumptions: stub data — replace with real call when the .NET backend is
 * available by setting VITE_USE_MOCK_API=false and VITE_API_BASE_URL.
 */
import {
  ConfigJson,
  HomepageResponse,
  BatchDataRequest,
  BatchDataResponse,
  CardDataResult,
  RoleMeta,
  DraftMeta,
  HomepageVersionSummary,
  DraftStatus,
  DiffResult,
  DiffChange,
  DiffChangeType,
  VersionEvent,
  AdminStateResponse,
  Card,
} from '../shared/types';
import { SEED_CONFIG, SEED_ROLES, SEED_LIVE_VERSION } from './mockData';

// ─── In-memory state ──────────────────────────────────────────────────────────

interface MockStore {
  liveVersion: HomepageVersionSummary | null;
  liveConfig: ConfigJson;
  /** Snapshot of ConfigJson for each version that was Live (used by rollback). */
  versionConfigs: Record<number, ConfigJson>;
  roles: RoleMeta[];
  draft: DraftMeta | null;
  versions: HomepageVersionSummary[];
  events: VersionEvent[];
  nextVersionId: number;
  nextVersionNo: number;
  nextEventId: number;
  etag: number;
}

const STORAGE_KEY = 'dct-mock-homepage-store';

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

function createDefaultStore(): MockStore {
  return {
    liveVersion: { ...SEED_LIVE_VERSION },
    liveConfig: deepClone(SEED_CONFIG),
    versionConfigs: { 1: deepClone(SEED_CONFIG) },
    roles: [...SEED_ROLES],
    draft: null,
    versions: [{ ...SEED_LIVE_VERSION }],
    events: [
      {
        versionEventId: 1,
        versionId: 1,
        eventType: 'Created',
        performedBy: 'system-seed',
        performedAtUtc: '2026-01-01T00:00:00Z',
        comments: null,
      },
      {
        versionEventId: 2,
        versionId: 1,
        eventType: 'Approved',
        performedBy: 'system-seed',
        performedAtUtc: '2026-01-01T00:00:00Z',
        comments: null,
      },
    ],
    nextVersionId: 2,
    nextVersionNo: 2,
    nextEventId: 3,
    etag: 1,
  };
}

function loadStore(): MockStore {
  if (typeof sessionStorage === 'undefined') return createDefaultStore();
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return normalizeStore(JSON.parse(raw) as Partial<MockStore>);
  } catch {
    // ignore corrupt storage
  }
  return createDefaultStore();
}

/** Backfill versionConfigs for stores persisted before snapshots were added. */
function normalizeStore(loaded: Partial<MockStore>): MockStore {
  const defaults = createDefaultStore();
  const merged: MockStore = {
    ...defaults,
    ...loaded,
    versionConfigs: loaded.versionConfigs ?? {},
  };

  if (Object.keys(merged.versionConfigs).length === 0) {
    merged.versionConfigs = { ...defaults.versionConfigs };
    for (const v of merged.versions) {
      if (v.status === 'Live') {
        merged.versionConfigs[v.versionId] = deepClone(merged.liveConfig);
      }
    }
    if (merged.versions.some((v) => v.versionId === 1)) {
      merged.versionConfigs[1] = deepClone(SEED_CONFIG);
    }
  }

  return merged;
}

function snapshotVersionConfig(versionId: number, config: ConfigJson): void {
  store.versionConfigs[versionId] = deepClone(config);
}

function persistStore(): void {
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // ignore quota errors
  }
}

const store: MockStore = loadStore();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function delay(ms = 250): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function now(): string {
  return new Date().toISOString();
}

function makeEtag(): string {
  store.etag++;
  return `"etag-${store.etag}"`;
}

function appendEvent(
  versionId: number,
  eventType: VersionEvent['eventType'],
  performedBy: string,
  comments: string | null = null
): void {
  store.events.push({
    versionEventId: store.nextEventId++,
    versionId,
    eventType,
    performedBy,
    performedAtUtc: now(),
    comments,
  });
}

/** §5.3 Role resolution: lowest-precedence enabled role with non-empty cards */
function resolveRole(userRoles: string[], configOverride?: ConfigJson): string {
  const config = configOverride ?? store.liveConfig;
  const enabledRoles = store.roles
    .filter((r) => r.isEnabled)
    .sort((a, b) => a.precedence - b.precedence);

  for (const meta of enabledRoles) {
    if (userRoles.includes(meta.roleKey)) {
      const layout = config.roles[meta.roleKey];
      if (layout && layout.cards.length > 0) return meta.roleKey;
    }
  }

  const fallback = store.roles.find((r) => r.isFallback && r.isEnabled);
  return fallback?.roleKey ?? Object.keys(config.roles)[0] ?? 'GeneralUser';
}

/** Filter enabled cards and apply effective-date window */
function filterCards(cards: Card[]): Card[] {
  const nowMs = Date.now();
  return cards
    .filter((c) => c.enabled)
    .map((c) => {
      if (c.items && c.items.length > 0) {
        const filtered = c.items.filter((item) => {
          const from = item.effectiveFromUtc ? new Date(item.effectiveFromUtc).getTime() : -Infinity;
          const to = item.effectiveToUtc ? new Date(item.effectiveToUtc).getTime() : Infinity;
          return nowMs >= from && nowMs <= to;
        });
        return { ...c, items: filtered };
      }
      return c;
    })
    .sort((a, b) => a.order - b.order);
}

// ─── Mock stub data for card data providers ───────────────────────────────────

function stubCardData(providerKey: string): CardDataResult {
  // Assumptions: stub data — replace with real call when the data contract is supplied.
  const stubs: Record<string, CardDataResult> = {
    'total-requests': {
      value: 1284,
      trend: { deltaPct: 5.3, vs: 'last month' },
      asOfUtc: now(),
    },
    'pending-approvals': {
      value: 23,
      trend: { deltaPct: -8.1, vs: 'yesterday' },
      asOfUtc: now(),
    },
    'active-transfers': {
      value: 47,
      trend: { deltaPct: 2.4, vs: 'last week' },
      asOfUtc: now(),
    },
    'completed-30d': {
      value: 318,
      trend: { deltaPct: 12.0, vs: 'previous 30d' },
      asOfUtc: now(),
    },
    'sla-performance': {
      series: [
        { name: 'Week 1', onTime: 85, breached: 5, approaching: 10 },
        { name: 'Week 2', onTime: 90, breached: 3, approaching: 7 },
        { name: 'Week 3', onTime: 78, breached: 8, approaching: 14 },
        { name: 'Week 4', onTime: 92, breached: 2, approaching: 6 },
      ],
      asOfUtc: now(),
    },
    'escalations': {
      value: 4,
      trend: { deltaPct: -25.0, vs: 'last week' },
      asOfUtc: now(),
    },
    'team-workload': {
      series: [
        { name: 'Alice', open: 8, pending: 3 },
        { name: 'Bob', open: 12, pending: 5 },
        { name: 'Carol', open: 6, pending: 2 },
      ],
      asOfUtc: now(),
    },
    'approval-queue': {
      value: 19,
      trend: { deltaPct: 11.8, vs: 'yesterday' },
      asOfUtc: now(),
    },
    'my-open-requests': {
      value: 3,
      trend: { deltaPct: 0, vs: 'yesterday' },
      asOfUtc: now(),
    },
    'requests-awaiting-action': {
      value: 7,
      trend: { deltaPct: 16.7, vs: 'last week' },
      asOfUtc: now(),
    },
    'recently-completed': {
      items: [
        { id: 'rc-1', title: 'Transfer TRF-0042 approved', date: '2026-06-05T10:00:00Z' },
        { id: 'rc-2', title: 'MER-13 submission reviewed', date: '2026-06-04T14:30:00Z' },
        { id: 'rc-3', title: 'Evidence package accepted', date: '2026-06-03T09:15:00Z' },
      ],
      asOfUtc: now(),
    },
    'transfer-status-summary': {
      series: [
        { name: 'Approved', value: 42 },
        { name: 'Pending', value: 18 },
        { name: 'Rejected', value: 3 },
        { name: 'Draft', value: 11 },
      ],
      asOfUtc: now(),
    },
  };

  return stubs[providerKey] ?? { error: 'unavailable', asOfUtc: now() };
}

// ─── Diff engine ──────────────────────────────────────────────────────────────

function computeDiff(draftConfig: ConfigJson, liveConfig: ConfigJson): DiffChange[] {
  const changes: DiffChange[] = [];

  const allRoles = new Set([
    ...Object.keys(draftConfig.roles),
    ...Object.keys(liveConfig.roles),
  ]);

  for (const role of allRoles) {
    const draftCards = draftConfig.roles[role]?.cards ?? [];
    const liveCards = liveConfig.roles[role]?.cards ?? [];

    const liveById = new Map(liveCards.map((c) => [c.id, c]));
    const draftById = new Map(draftCards.map((c) => [c.id, c]));

    // Added
    for (const c of draftCards) {
      if (!liveById.has(c.id)) {
        changes.push({ role, cardId: c.id, change: 'Added' as DiffChangeType, header: c.header });
      }
    }

    // Removed
    for (const c of liveCards) {
      if (!draftById.has(c.id)) {
        changes.push({ role, cardId: c.id, change: 'Removed' as DiffChangeType, header: c.header });
      }
    }

    // Edited / Reordered
    for (const draft of draftCards) {
      const live = liveById.get(draft.id);
      if (!live) continue;

      const changedFields: string[] = [];
      const fieldsToCheck: (keyof typeof draft)[] = [
        'type', 'header', 'subtitle', 'size', 'enabled', 'bodyHtml', 'dataProviderKey',
      ];

      for (const field of fieldsToCheck) {
        if (JSON.stringify(draft[field]) !== JSON.stringify(live[field])) {
          changedFields.push(field);
        }
      }

      // Check items
      if (JSON.stringify(draft.items) !== JSON.stringify(live.items)) {
        changedFields.push('items');
      }

      if (changedFields.length > 0) {
        changes.push({
          role,
          cardId: draft.id,
          change: 'Edited' as DiffChangeType,
          header: draft.header,
          fields: changedFields,
        });
      } else if (draft.order !== live.order) {
        changes.push({ role, cardId: draft.id, change: 'Reordered' as DiffChangeType, header: draft.header });
      }
    }
  }

  return changes;
}

// ─── Public API functions ─────────────────────────────────────────────────────

export async function mockGetRoles(): Promise<RoleMeta[]> {
  await delay(150);
  return deepClone(store.roles.filter((r) => r.isEnabled));
}

export async function mockGetHomepage(
  userRoles: string[],
  roleOverride?: string
): Promise<HomepageResponse> {
  await delay(200);

  const effectiveRole =
    roleOverride && userRoles.includes(roleOverride)
      ? roleOverride
      : resolveRole(userRoles);

  const layout = store.liveConfig.roles[effectiveRole];
  const cards = filterCards(layout?.cards ?? []);

  return {
    versionNo: store.liveVersion?.versionNo ?? 1,
    role: effectiveRole,
    cards,
  };
}

export async function mockBatchCardData(
  req: BatchDataRequest
): Promise<BatchDataResponse> {
  await delay(300);

  const results: Record<string, CardDataResult> = {};

  // Map card IDs to provider keys by looking up live config
  for (const cardId of req.cardIds) {
    let providerKey: string | null = null;

    for (const layout of Object.values(store.liveConfig.roles)) {
      const card = layout.cards.find((c) => c.id === cardId);
      if (card?.dataProviderKey) {
        providerKey = card.dataProviderKey;
        break;
      }
    }

    if (providerKey) {
      results[cardId] = stubCardData(providerKey);
    } else {
      results[cardId] = { error: 'Card not found or has no data provider', asOfUtc: now() };
    }
  }

  return { results };
}

export async function mockGetAdminState(): Promise<AdminStateResponse> {
  await delay(150);
  return {
    live: store.liveVersion ? deepClone(store.liveVersion) : null,
    inFlight: store.draft
      ? {
          versionId: store.draft.versionId,
          versionNo: store.draft.versionNo,
          title: store.draft.title,
          status: store.draft.status,
          createdBy: store.draft.createdBy,
          createdAtUtc: store.draft.createdAtUtc,
          submittedBy: store.draft.submittedBy,
          submittedAtUtc: store.draft.submittedAtUtc,
          reviewedBy: store.draft.reviewedBy,
          reviewedAtUtc: store.draft.reviewedAtUtc,
          wentLiveAtUtc: store.draft.wentLiveAtUtc,
        }
      : null,
  };
}

export async function mockCreateDraft(createdBy: string): Promise<DraftMeta> {
  await delay(300);

  // §5.2: at most one in-flight
  if (store.draft) {
    throw new Error('409: A draft or submitted changeset is already in flight.');
  }

  const versionId = store.nextVersionId++;
  const versionNo = store.nextVersionNo++;
  const etag = makeEtag();

  const draft: DraftMeta = {
    versionId,
    versionNo,
    title: null,
    status: 'Draft' as DraftStatus,
    createdBy,
    createdAtUtc: now(),
    submittedBy: null,
    submittedAtUtc: null,
    reviewedBy: null,
    reviewedAtUtc: null,
    wentLiveAtUtc: null,
    config: deepClone(store.liveConfig),
    etag,
  };

  store.draft = draft;
  store.versions.unshift({
    versionId: draft.versionId,
    versionNo: draft.versionNo,
    title: draft.title,
    status: draft.status,
    createdBy: draft.createdBy,
    createdAtUtc: draft.createdAtUtc,
    submittedBy: null,
    submittedAtUtc: null,
    reviewedBy: null,
    reviewedAtUtc: null,
    wentLiveAtUtc: null,
  });

  appendEvent(versionId, 'Created', createdBy);
  persistStore();

  return deepClone(draft);
}

export async function mockGetDraft(versionId: number): Promise<DraftMeta> {
  await delay(150);
  if (!store.draft || store.draft.versionId !== versionId) {
    throw new Error('404: Draft not found.');
  }
  return deepClone(store.draft);
}

export async function mockSaveDraft(
  versionId: number,
  title: string | null,
  config: ConfigJson,
  etag: string,
  callerUserId: string
): Promise<{ etag: string }> {
  await delay(250);

  if (!store.draft || store.draft.versionId !== versionId) {
    throw new Error('404: Draft not found.');
  }
  if (store.draft.status !== 'Draft') {
    throw new Error('400: Draft is not editable in its current state.');
  }
  if (store.draft.createdBy !== callerUserId) {
    throw new Error('403: Only the draft author can save edits.');
  }
  if (store.draft.etag !== etag) {
    throw new Error('412: ETag mismatch — the draft has been modified concurrently.');
  }

  store.draft.title = title;
  store.draft.config = deepClone(config);
  store.draft.etag = makeEtag();

  // Update version summary in history
  const summary = store.versions.find((v) => v.versionId === versionId);
  if (summary) summary.title = title;

  persistStore();
  return { etag: store.draft.etag };
}

export async function mockSubmitDraft(
  versionId: number,
  submittedBy: string
): Promise<void> {
  await delay(200);

  if (!store.draft || store.draft.versionId !== versionId) {
    throw new Error('404: Draft not found.');
  }
  if (store.draft.status !== 'Draft') {
    throw new Error('400: Only a Draft can be submitted.');
  }

  store.draft.status = 'Submitted';
  store.draft.submittedBy = submittedBy;
  store.draft.submittedAtUtc = now();

  const summary = store.versions.find((v) => v.versionId === versionId);
  if (summary) {
    summary.status = 'Submitted';
    summary.submittedBy = submittedBy;
    summary.submittedAtUtc = store.draft.submittedAtUtc;
  }

  appendEvent(versionId, 'Submitted', submittedBy);
  persistStore();
}

export async function mockApproveDraft(
  versionId: number,
  approvedBy: string
): Promise<void> {
  await delay(300);

  if (!store.draft || store.draft.versionId !== versionId) {
    throw new Error('404: Draft not found.');
  }
  if (store.draft.status !== 'Submitted') {
    throw new Error('400: Only a Submitted draft can be approved.');
  }

  const approvedAt = now();

  // Live → Superseded (preserve config snapshot for rollback)
  if (store.liveVersion) {
    snapshotVersionConfig(store.liveVersion.versionId, store.liveConfig);
    store.liveVersion.status = 'Superseded';
    const oldSummary = store.versions.find((v) => v.versionId === store.liveVersion!.versionId);
    if (oldSummary) oldSummary.status = 'Superseded';
  }

  store.draft.status = 'Live';
  store.draft.reviewedBy = approvedBy;
  store.draft.reviewedAtUtc = approvedAt;
  store.draft.wentLiveAtUtc = approvedAt;

  const newLive: HomepageVersionSummary = {
    versionId: store.draft.versionId,
    versionNo: store.draft.versionNo,
    title: store.draft.title,
    status: 'Live',
    createdBy: store.draft.createdBy,
    createdAtUtc: store.draft.createdAtUtc,
    submittedBy: store.draft.submittedBy,
    submittedAtUtc: store.draft.submittedAtUtc,
    reviewedBy: approvedBy,
    reviewedAtUtc: approvedAt,
    wentLiveAtUtc: approvedAt,
  };

  store.liveVersion = newLive;
  store.liveConfig = deepClone(store.draft.config);
  snapshotVersionConfig(versionId, store.draft.config);

  const summary = store.versions.find((v) => v.versionId === versionId);
  if (summary) {
    Object.assign(summary, newLive);
  }

  appendEvent(versionId, 'Approved', approvedBy);
  store.draft = null;
  persistStore();
}

export async function mockRejectDraft(
  versionId: number,
  rejectedBy: string,
  comments: string
): Promise<void> {
  await delay(200);

  if (!store.draft || store.draft.versionId !== versionId) {
    throw new Error('404: Draft not found.');
  }
  if (store.draft.status !== 'Submitted') {
    throw new Error('400: Only a Submitted draft can be rejected.');
  }
  if (!comments || comments.trim().length === 0) {
    throw new Error('400: Rejection comments are required.');
  }

  store.draft.status = 'Draft';
  store.draft.reviewedBy = rejectedBy;
  store.draft.reviewedAtUtc = now();

  const summary = store.versions.find((v) => v.versionId === versionId);
  if (summary) {
    summary.status = 'Draft';
    summary.reviewedBy = rejectedBy;
    summary.reviewedAtUtc = store.draft.reviewedAtUtc;
  }

  appendEvent(versionId, 'Rejected', rejectedBy, comments);
  persistStore();
}

export async function mockDiscardDraft(
  versionId: number,
  discardedBy: string
): Promise<void> {
  await delay(200);

  if (!store.draft || store.draft.versionId !== versionId) {
    throw new Error('404: Draft not found.');
  }
  if (store.draft.status === 'Live') {
    throw new Error('400: Cannot discard a live version.');
  }
  if (store.draft.createdBy !== discardedBy) {
    throw new Error('403: Only the draft author can discard it.');
  }

  store.versions = store.versions.filter((v) => v.versionId !== versionId);
  appendEvent(versionId, 'Discarded', discardedBy, 'Draft discarded by author');
  store.draft = null;
  persistStore();
}

export async function mockGetDiff(versionId: number): Promise<DiffResult> {
  await delay(200);

  if (!store.draft || store.draft.versionId !== versionId) {
    throw new Error('404: Draft not found.');
  }

  const changes = computeDiff(store.draft.config, store.liveConfig);

  return {
    vsVersionNo: store.liveVersion?.versionNo ?? 0,
    changes,
  };
}

export async function mockGetPreview(
  versionId: number,
  userRoles: string[],
  roleOverride?: string
): Promise<HomepageResponse> {
  await delay(200);

  if (!store.draft || store.draft.versionId !== versionId) {
    throw new Error('404: Draft not found.');
  }

  const effectiveRole =
    roleOverride && userRoles.includes(roleOverride)
      ? roleOverride
      : resolveRole(userRoles, store.draft.config);

  const layout = store.draft.config.roles[effectiveRole];
  const cards = filterCards(layout?.cards ?? []);

  return {
    versionNo: store.draft.versionNo,
    role: effectiveRole,
    cards,
  };
}

export async function mockGetVersions(): Promise<HomepageVersionSummary[]> {
  await delay(150);
  return deepClone(store.versions);
}

export async function mockGetVersionEvents(versionId: number): Promise<VersionEvent[]> {
  await delay(150);
  return deepClone(store.events.filter((e) => e.versionId === versionId));
}

export async function mockRollback(
  fromVersionId: number,
  createdBy: string
): Promise<DraftMeta> {
  await delay(300);

  if (store.draft) {
    throw new Error('409: A draft is already in flight.');
  }

  const fromVersion = store.versions.find((v) => v.versionId === fromVersionId);
  if (!fromVersion) {
    throw new Error('404: Version not found.');
  }

  const historicalConfig = store.versionConfigs[fromVersionId];
  if (!historicalConfig) {
    throw new Error('404: Historical configuration not found for this version.');
  }

  const versionId = store.nextVersionId++;
  const versionNo = store.nextVersionNo++;
  const etag = makeEtag();

  const draft: DraftMeta = {
    versionId,
    versionNo,
    title: `Rollback from v${fromVersion.versionNo}`,
    status: 'Draft',
    createdBy,
    createdAtUtc: now(),
    submittedBy: null,
    submittedAtUtc: null,
    reviewedBy: null,
    reviewedAtUtc: null,
    wentLiveAtUtc: null,
    config: deepClone(historicalConfig),
    etag,
  };

  store.draft = draft;
  store.versions.unshift({
    versionId: draft.versionId,
    versionNo: draft.versionNo,
    title: draft.title,
    status: draft.status,
    createdBy: draft.createdBy,
    createdAtUtc: draft.createdAtUtc,
    submittedBy: null,
    submittedAtUtc: null,
    reviewedBy: null,
    reviewedAtUtc: null,
    wentLiveAtUtc: null,
  });

  appendEvent(versionId, 'RolledBack', createdBy, `From version ${fromVersion.versionNo}`);
  persistStore();

  return deepClone(draft);
}

export async function mockUpdateRoleMeta(
  roleKey: string,
  updates: Partial<Pick<RoleMeta, 'displayName' | 'precedence' | 'isEnabled' | 'isFallback'>>
): Promise<RoleMeta> {
  await delay(200);

  const role = store.roles.find((r) => r.roleKey === roleKey);
  if (!role) {
    throw new Error('404: Role not found.');
  }

  // If setting isFallback=true, unset others
  if (updates.isFallback === true) {
    for (const r of store.roles) {
      r.isFallback = false;
    }
  }

  Object.assign(role, updates);
  persistStore();
  return deepClone(role);
}
