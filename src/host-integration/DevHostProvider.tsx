/**
 * DevHostProvider: supplies a fake HostContext for local development.
 * Controlled by VITE_DEV_USER and VITE_DEV_ROLES env vars.
 *
 * Assumptions: Only active when VITE_USE_MOCK_API=true. Never bundled into
 * a production build that disables mock API.
 */
import React from 'react';
import { HostContextProvider } from './HostContext';

const DEV_USER_ID = import.meta.env.VITE_DEV_USER ?? 'dev-user';
const DEV_ROLES: string[] = (import.meta.env.VITE_DEV_ROLES ?? 'Admin')
  .split(',')
  .map((r: string) => r.trim())
  .filter(Boolean);

const devGetAccessToken = async (): Promise<string> => 'dev-mock-token';

const DevHostProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <HostContextProvider
    value={{
      user: { id: DEV_USER_ID, displayName: `Dev User (${DEV_USER_ID})` },
      roles: DEV_ROLES,
      getAccessToken: devGetAccessToken,
    }}
  >
    {children}
  </HostContextProvider>
);

export default DevHostProvider;
