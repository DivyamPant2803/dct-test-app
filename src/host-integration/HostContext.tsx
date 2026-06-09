import React, { createContext, useContext } from 'react';

export interface HostUser {
  id: string;
  displayName: string;
}

export interface HostContextValue {
  user: HostUser;
  roles: string[];
  getAccessToken: () => Promise<string>;
}

const HostContext = createContext<HostContextValue | null>(null);

export const HostContextProvider: React.FC<{
  value: HostContextValue;
  children: React.ReactNode;
}> = ({ value, children }) => (
  <HostContext.Provider value={value}>{children}</HostContext.Provider>
);

function useHostContext(): HostContextValue {
  const ctx = useContext(HostContext);
  if (!ctx) {
    throw new Error('useHostContext must be used inside a HostContextProvider or DevHostProvider');
  }
  return ctx;
}

export function useHostUser(): HostUser {
  return useHostContext().user;
}

export function useHostRoles(): string[] {
  return useHostContext().roles;
}

export function useGetAccessToken(): () => Promise<string> {
  return useHostContext().getAccessToken;
}

export default HostContext;
