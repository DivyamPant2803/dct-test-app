import { USE_MOCK, apiFetch, FetchOptions } from './client';
import {
  HomepageResponse,
  BatchDataRequest,
  BatchDataResponse,
  RoleMeta,
} from '../shared/types';
import {
  mockGetHomepage,
  mockBatchCardData,
  mockGetRoles,
} from '../mocks/mockApi';

type GetToken = () => Promise<string>;

export async function getHomepage(
  userRoles: string[],
  getToken: GetToken,
  roleOverride?: string
): Promise<HomepageResponse> {
  if (USE_MOCK) return mockGetHomepage(userRoles, roleOverride);

  const query = roleOverride ? `?role=${encodeURIComponent(roleOverride)}` : '';
  const opts: FetchOptions = { getToken };
  return apiFetch<HomepageResponse>(`/api/homepage${query}`, opts);
}

export async function batchCardData(
  req: BatchDataRequest,
  getToken: GetToken
): Promise<BatchDataResponse> {
  if (USE_MOCK) return mockBatchCardData(req);

  const opts: FetchOptions = {
    method: 'POST',
    body: JSON.stringify(req),
    getToken,
  };
  return apiFetch<BatchDataResponse>('/api/homepage/data:batch', opts);
}

export async function getRoles(getToken: GetToken): Promise<RoleMeta[]> {
  if (USE_MOCK) return mockGetRoles();

  return apiFetch<RoleMeta[]>('/api/roles', { getToken });
}
