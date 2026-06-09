import React, { useState } from 'react';
import styled from 'styled-components';
import { useQuery } from '@tanstack/react-query';
import { useHostUser, useHostRoles, useGetAccessToken } from '../../host-integration/HostContext';
import { getRoles } from '../../api/homepageApi';
import { useHomepage } from './hooks/useHomepage';
import CardGrid from './CardGrid';
import CardSkeleton from './CardSkeleton';
import { RoleMeta } from '../../shared/types';

const BRAND = '#c5152a';

const Page = styled.div`
  background: #f5f7fa;
  min-height: 100%;
  width: 100%;
`;

const PageWrapper = styled.div`
  padding: 1.5rem 2rem 2.5rem;
  max-width: 1440px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) { padding: 1rem; }
`;

const GreetingBar = styled.div`
  margin-bottom: 1.5rem;
`;

const GreetingTitle = styled.h1`
  font-size: 1.3rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 2px;
`;

const GreetingSubtitle = styled.p`
  font-size: 0.85rem;
  color: #6b7280;
  margin: 0;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;
`;

const RoleSwitcher = styled.div`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  flex-wrap: wrap;
`;

const RolePill = styled.button<{ active: boolean }>`
  padding: 4px 14px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  border: 1.5px solid ${({ active }) => (active ? BRAND : '#d1d5db')};
  background: ${({ active }) => (active ? BRAND : 'white')};
  color: ${({ active }) => (active ? 'white' : '#6b7280')};
  transition: all 0.15s;

  &:hover {
    border-color: ${BRAND};
    color: ${({ active }) => (active ? 'white' : BRAND)};
  }
  &:focus-visible { outline: 2px solid ${BRAND}; outline-offset: 2px; }
`;

const VersionBadge = styled.span`
  font-size: 0.7rem;
  color: #9ca3af;
  padding: 2px 8px;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  background: white;
`;

const AdminLink = styled.a`
  font-size: 0.78rem;
  color: ${BRAND};
  text-decoration: none;
  padding: 4px 12px;
  border: 1.5px solid ${BRAND};
  border-radius: 6px;
  font-weight: 600;
  background: white;

  &:hover { background: #fff1f2; }
  &:focus-visible { outline: 2px solid ${BRAND}; outline-offset: 2px; }
`;

const ErrorBox = styled.div`
  padding: 1.5rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #991b1b;
  text-align: center;
`;

const SkeletonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  align-items: stretch;

  @media (max-width: 768px) { grid-template-columns: 1fr; }
`;

const HomepageModule: React.FC = () => {
  const user = useHostUser();
  const userRoles = useHostRoles();
  const getToken = useGetAccessToken();
  const [roleOverride, setRoleOverride] = useState<string | undefined>(undefined);

  const rolesQuery = useQuery<RoleMeta[], Error>({
    queryKey: ['roles'],
    queryFn: () => getRoles(getToken),
    staleTime: 300_000,
  });

  const { data, isLoading, isError, error } = useHomepage(roleOverride);

  const availableRoles = (rolesQuery.data ?? []).filter((r) =>
    userRoles.includes(r.roleKey)
  );

  const effectiveRole = data?.role ?? roleOverride ?? userRoles[0] ?? 'GeneralUser';
  const effectiveRoleMeta = rolesQuery.data?.find((r) => r.roleKey === effectiveRole);

  return (
    <Page>
      <PageWrapper>
        <GreetingBar>
          <GreetingTitle>Welcome back, {user.displayName}! 👋</GreetingTitle>
          <GreetingSubtitle>Here's what's happening in Central Inventory today.</GreetingSubtitle>
        </GreetingBar>

        <TopBar>
          {data && <VersionBadge>v{data.versionNo}</VersionBadge>}

          {availableRoles.length > 1 && (
            <RoleSwitcher role="group" aria-label="View as role">
              {availableRoles.map((r) => (
                <RolePill
                  key={r.roleKey}
                  active={effectiveRole === r.roleKey}
                  onClick={() =>
                    setRoleOverride(r.roleKey === effectiveRole ? undefined : r.roleKey)
                  }
                  aria-pressed={effectiveRole === r.roleKey}
                >
                  {r.displayName}
                </RolePill>
              ))}
            </RoleSwitcher>
          )}

          {userRoles.includes('Admin') && (
            <AdminLink href="/central-inventory/home/admin">
              ⚙ Configure
            </AdminLink>
          )}
        </TopBar>

        {effectiveRoleMeta && availableRoles.length <= 1 && (
          <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.75rem' }}>
            Viewing as <strong style={{ color: '#374151' }}>{effectiveRoleMeta.displayName}</strong>
          </div>
        )}

        {isLoading && (
          <SkeletonGrid>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ gridColumn: 'span 1' }}><CardSkeleton /></div>
            ))}
            {[5, 6].map((i) => (
              <div key={i} style={{ gridColumn: 'span 2' }}><CardSkeleton /></div>
            ))}
          </SkeletonGrid>
        )}

        {isError && (
          <ErrorBox role="alert">
            Failed to load homepage: {error?.message ?? 'Unknown error'}
          </ErrorBox>
        )}

        {data && data.cards.length === 0 && (
          <div style={{ color: '#9ca3af', textAlign: 'center', padding: '3rem' }}>
            No cards configured for your role.
          </div>
        )}

        {data && data.cards.length > 0 && (
          <CardGrid cards={data.cards} />
        )}
      </PageWrapper>
    </Page>
  );
};

export default HomepageModule;
