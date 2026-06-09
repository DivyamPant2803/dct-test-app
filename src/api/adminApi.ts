import { USE_MOCK, apiFetch, FetchOptions } from './client';
import {
  AdminStateResponse,
  DraftMeta,
  DiffResult,
  HomepageResponse,
  HomepageVersionSummary,
  VersionEvent,
  RoleMeta,
  ConfigJson,
} from '../shared/types';
import {
  mockGetAdminState,
  mockCreateDraft,
  mockGetDraft,
  mockSaveDraft,
  mockSubmitDraft,
  mockApproveDraft,
  mockRejectDraft,
  mockGetDiff,
  mockGetPreview,
  mockGetVersions,
  mockGetVersionEvents,
  mockRollback,
  mockUpdateRoleMeta,
  mockDiscardDraft,
} from '../mocks/mockApi';

type GetToken = () => Promise<string>;

export async function getAdminState(getToken: GetToken): Promise<AdminStateResponse> {
  if (USE_MOCK) return mockGetAdminState();
  return apiFetch<AdminStateResponse>('/api/admin/homepage/state', { getToken });
}

export async function createDraft(getToken: GetToken, userId: string): Promise<DraftMeta> {
  if (USE_MOCK) return mockCreateDraft(userId);
  return apiFetch<DraftMeta>('/api/admin/homepage/drafts', {
    method: 'POST',
    body: JSON.stringify({}),
    getToken,
  });
}

export async function getDraft(id: number, getToken: GetToken): Promise<DraftMeta> {
  if (USE_MOCK) return mockGetDraft(id);
  return apiFetch<DraftMeta>(`/api/admin/homepage/drafts/${id}`, { getToken });
}

export async function saveDraft(
  id: number,
  title: string | null,
  config: ConfigJson,
  etag: string,
  getToken: GetToken,
  userId: string
): Promise<{ etag: string }> {
  if (USE_MOCK) return mockSaveDraft(id, title, config, etag, userId);
  const opts: FetchOptions = {
    method: 'PUT',
    body: JSON.stringify({ title, config }),
    headers: { 'If-Match': etag },
    getToken,
  };
  return apiFetch<{ etag: string }>(`/api/admin/homepage/drafts/${id}`, opts);
}

export async function submitDraft(id: number, getToken: GetToken, userId: string): Promise<void> {
  if (USE_MOCK) return mockSubmitDraft(id, userId);
  await apiFetch<void>(`/api/admin/homepage/drafts/${id}/submit`, {
    method: 'POST',
    getToken,
  });
}

export async function approveDraft(id: number, getToken: GetToken, userId: string): Promise<void> {
  if (USE_MOCK) return mockApproveDraft(id, userId);
  await apiFetch<void>(`/api/admin/homepage/drafts/${id}/approve`, {
    method: 'POST',
    getToken,
  });
}

export async function rejectDraft(
  id: number,
  comments: string,
  getToken: GetToken,
  userId: string
): Promise<void> {
  if (USE_MOCK) return mockRejectDraft(id, userId, comments);
  await apiFetch<void>(`/api/admin/homepage/drafts/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ comments }),
    getToken,
  });
}

export async function discardDraft(id: number, getToken: GetToken, userId: string): Promise<void> {
  if (USE_MOCK) return mockDiscardDraft(id, userId);
  await apiFetch<void>(`/api/admin/homepage/drafts/${id}`, {
    method: 'DELETE',
    getToken,
  });
}

export async function getDiff(id: number, getToken: GetToken): Promise<DiffResult> {
  if (USE_MOCK) return mockGetDiff(id);
  return apiFetch<DiffResult>(`/api/admin/homepage/drafts/${id}/diff`, { getToken });
}

export async function getPreview(
  id: number,
  userRoles: string[],
  getToken: GetToken,
  roleOverride?: string
): Promise<HomepageResponse> {
  if (USE_MOCK) return mockGetPreview(id, userRoles, roleOverride);
  const query = roleOverride ? `?role=${encodeURIComponent(roleOverride)}` : '';
  return apiFetch<HomepageResponse>(
    `/api/admin/homepage/drafts/${id}/preview${query}`,
    { getToken }
  );
}

export async function getVersions(getToken: GetToken): Promise<HomepageVersionSummary[]> {
  if (USE_MOCK) return mockGetVersions();
  return apiFetch<HomepageVersionSummary[]>('/api/admin/homepage/versions', { getToken });
}

export async function getVersionEvents(
  versionId: number,
  getToken: GetToken
): Promise<VersionEvent[]> {
  if (USE_MOCK) return mockGetVersionEvents(versionId);
  return apiFetch<VersionEvent[]>(
    `/api/admin/homepage/versions/${versionId}/events`,
    { getToken }
  );
}

export async function rollback(
  fromVersionId: number,
  getToken: GetToken,
  userId: string
): Promise<DraftMeta> {
  if (USE_MOCK) return mockRollback(fromVersionId, userId);
  return apiFetch<DraftMeta>(
    `/api/admin/homepage/versions/${fromVersionId}/rollback`,
    { method: 'POST', getToken }
  );
}

export async function updateRoleMeta(
  roleKey: string,
  updates: Partial<Pick<RoleMeta, 'displayName' | 'precedence' | 'isEnabled' | 'isFallback'>>,
  getToken: GetToken
): Promise<RoleMeta> {
  if (USE_MOCK) return mockUpdateRoleMeta(roleKey, updates);
  return apiFetch<RoleMeta>(`/api/admin/roles/${encodeURIComponent(roleKey)}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
    getToken,
  });
}
