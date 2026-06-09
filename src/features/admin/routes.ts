export const ADMIN_HOME = '/central-inventory/home/admin';

export function adminRolesPath(): string {
  return `${ADMIN_HOME}/roles`;
}

export function adminDraftPath(id: number): string {
  return `${ADMIN_HOME}/drafts/${id}`;
}

export function adminReviewPath(id: number): string {
  return `${ADMIN_HOME}/drafts/${id}/review`;
}
