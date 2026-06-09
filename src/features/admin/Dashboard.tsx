import React, { useState } from 'react';
import styled from 'styled-components';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useHostUser, useGetAccessToken } from '../../host-integration/HostContext';
import {
  getAdminState,
  getVersions,
  createDraft,
  rollback,
  discardDraft,
} from '../../api/adminApi';
import { HomepageVersionSummary, AdminStateResponse } from '../../shared/types';
import { adminDraftPath, adminReviewPath } from './routes';
import { useToast } from '../../components/common';

const Page = styled.div`
  padding: 1.5rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const PageTitle = styled.h1`
  font-size: 1.4rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 1.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 1rem;
  font-weight: 700;
  color: #374151;
  margin: 0 0 0.75rem;
`;

const Grid2 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) { grid-template-columns: 1fr; }
`;

const Card = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 1.25rem;
`;

const StatusBadge = styled.span<{ status: string }>`
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  background: ${({ status }) => {
    if (status === 'Live') return '#d1fae5';
    if (status === 'Submitted') return '#dbeafe';
    if (status === 'Draft') return '#fef9c3';
    return '#f3f4f6';
  }};
  color: ${({ status }) => {
    if (status === 'Live') return '#065f46';
    if (status === 'Submitted') return '#1e40af';
    if (status === 'Draft') return '#92400e';
    return '#6b7280';
  }};
`;

const MetaRow = styled.div`
  font-size: 0.82rem;
  color: #6b7280;
  margin-top: 0.4rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1rem;
`;

const ActionRow = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 1rem;
`;

const Btn = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 6px 16px;
  border-radius: 7px;
  font-size: 0.83rem;
  font-weight: 600;
  cursor: pointer;
  border: 1.5px solid;
  transition: all 0.15s;

  ${({ variant }) =>
    variant === 'primary'
      ? `background:#2563eb;color:white;border-color:#2563eb;
         &:hover{background:#1d4ed8;border-color:#1d4ed8;}`
      : variant === 'danger'
      ? `background:#fef2f2;color:#b91c1c;border-color:#fca5a5;
         &:hover{background:#fee2e2;}`
      : `background:white;color:#374151;border-color:#d1d5db;
         &:hover{border-color:#9ca3af;}`}

  &:disabled { opacity: 0.5; cursor: not-allowed; }
  &:focus-visible { outline: 2px solid #2563eb; outline-offset: 2px; }
`;

const ErrorMsg = styled.div`
  color: #b91c1c;
  background: #fef2f2;
  border: 1px solid #fca5a5;
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  font-size: 0.82rem;
  margin-top: 0.5rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.83rem;
`;

const Th = styled.th`
  text-align: left;
  padding: 0.5rem 0.75rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  color: #6b7280;
  font-weight: 600;
`;

const Td = styled.td`
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid #f3f4f6;
  color: #374151;
`;

const EmptyMsg = styled.div`
  color: #9ca3af;
  font-size: 0.85rem;
  text-align: center;
  padding: 2rem;
`;

function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString([], {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = useHostUser();
  const getToken = useGetAccessToken();
  const qc = useQueryClient();
  const [mutError, setMutError] = useState<string | null>(null);
  const { showToast } = useToast();

  const stateQ = useQuery<AdminStateResponse, Error>({
    queryKey: ['admin-state'],
    queryFn: () => getAdminState(getToken),
    refetchOnMount: 'always',
  });

  const versionsQ = useQuery<HomepageVersionSummary[], Error>({
    queryKey: ['admin-versions'],
    queryFn: () => getVersions(getToken),
    refetchOnMount: 'always',
  });

  const createMut = useMutation({
    mutationFn: () => createDraft(getToken, user.id),
    onSuccess: (draft) => {
      qc.invalidateQueries({ queryKey: ['admin-state'] });
      navigate(adminDraftPath(draft.versionId));
    },
    onError: (e: Error) => setMutError(e.message),
  });

  const rollbackMut = useMutation({
    mutationFn: (versionId: number) => rollback(versionId, getToken, user.id),
    onSuccess: (draft) => {
      qc.invalidateQueries({ queryKey: ['admin-state'] });
      qc.invalidateQueries({ queryKey: ['admin-versions'] });
      navigate(adminDraftPath(draft.versionId));
    },
    onError: (e: Error) => setMutError(e.message),
  });

  const discardMut = useMutation({
    mutationFn: (versionId: number) => discardDraft(versionId, getToken, user.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-state'] });
      qc.invalidateQueries({ queryKey: ['admin-versions'] });
      showToast('Draft discarded.', 'success');
    },
    onError: (e: Error) => setMutError(e.message),
  });

  const handleDiscard = (versionId: number, versionNo: number) => {
    if (!window.confirm(`Discard draft v${versionNo}? This cannot be undone.`)) return;
    setMutError(null);
    discardMut.mutate(versionId);
  };

  const { live, inFlight } = stateQ.data ?? { live: null, inFlight: null };
  const isMyDraft = inFlight?.createdBy === user.id;

  return (
    <Page>
      <PageTitle>Homepage Configuration</PageTitle>

      {mutError && <ErrorMsg role="alert">{mutError}</ErrorMsg>}

      <Grid2>
        {/* Live version card */}
        <Card>
          <SectionTitle>Live Version</SectionTitle>
          {live ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <strong style={{ fontSize: '1rem' }}>v{live.versionNo}</strong>
                {live.title && (
                  <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>— {live.title}</span>
                )}
                <StatusBadge status="Live">Live</StatusBadge>
              </div>
              <MetaRow>
                <span>Published by <strong>{live.reviewedBy}</strong></span>
                <span>{fmtDate(live.wentLiveAtUtc)}</span>
              </MetaRow>
              <MetaRow>
                <span>Created by {live.createdBy}</span>
              </MetaRow>
            </>
          ) : (
            <EmptyMsg>No live version yet.</EmptyMsg>
          )}
        </Card>

        {/* In-flight draft card */}
        <Card>
          <SectionTitle>In-Flight Changeset</SectionTitle>
          {inFlight ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <strong>v{inFlight.versionNo}</strong>
                {inFlight.title && (
                  <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>— {inFlight.title}</span>
                )}
                <StatusBadge status={inFlight.status}>{inFlight.status}</StatusBadge>
              </div>
              <MetaRow>
                <span>By {inFlight.createdBy}</span>
                <span>Started {fmtDate(inFlight.createdAtUtc)}</span>
              </MetaRow>

              {isMyDraft ? (
                <ActionRow>
                  <Btn variant="primary" onClick={() => navigate(adminDraftPath(inFlight.versionId))}>
                    {inFlight.status === 'Draft' ? 'Continue Editing' : 'View Draft'}
                  </Btn>
                  {inFlight.status === 'Draft' && (
                    <Btn variant="secondary" onClick={() => navigate(adminReviewPath(inFlight.versionId))}>
                      Submit for Review
                    </Btn>
                  )}
                  {inFlight.status === 'Submitted' && (
                    <Btn variant="secondary" onClick={() => navigate(adminReviewPath(inFlight.versionId))}>
                      Review &amp; Approve
                    </Btn>
                  )}
                  <Btn
                    variant="danger"
                    onClick={() => handleDiscard(inFlight.versionId, inFlight.versionNo)}
                    disabled={discardMut.isPending}
                  >
                    {discardMut.isPending ? 'Discarding…' : 'Discard Draft'}
                  </Btn>
                </ActionRow>
              ) : (
                <>
                  <div style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: '0.75rem' }}>
                    A changeset by <strong>{inFlight.createdBy}</strong> is pending review. You can review it.
                  </div>
                  {inFlight.status === 'Submitted' && (
                    <ActionRow>
                      <Btn variant="secondary" onClick={() => navigate(adminReviewPath(inFlight.versionId))}>
                        Review &amp; Approve
                      </Btn>
                    </ActionRow>
                  )}
                </>
              )}
            </>
          ) : (
            <>
              <EmptyMsg>No changeset in progress.</EmptyMsg>
              <ActionRow>
                <Btn
                  variant="primary"
                  onClick={() => { setMutError(null); createMut.mutate(); }}
                  disabled={createMut.isPending}
                >
                  {createMut.isPending ? 'Creating…' : 'Create New Draft'}
                </Btn>
              </ActionRow>
            </>
          )}
        </Card>
      </Grid2>

      {/* Version history */}
      <SectionTitle>Version History</SectionTitle>
      <Card>
        {versionsQ.isLoading && <EmptyMsg>Loading…</EmptyMsg>}
        {versionsQ.isError && <ErrorMsg>Failed to load version history.</ErrorMsg>}
        {versionsQ.data && versionsQ.data.length === 0 && (
          <EmptyMsg>No versions yet.</EmptyMsg>
        )}
        {versionsQ.data && versionsQ.data.length > 0 && (
          <Table>
            <thead>
              <tr>
                <Th>Version</Th>
                <Th>Title</Th>
                <Th>Status</Th>
                <Th>Created by</Th>
                <Th>Date</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {versionsQ.data.map((v) => (
                <tr key={v.versionId}>
                  <Td><strong>v{v.versionNo}</strong></Td>
                  <Td>{v.title ?? '—'}</Td>
                  <Td><StatusBadge status={v.status}>{v.status}</StatusBadge></Td>
                  <Td>{v.createdBy}</Td>
                  <Td>{fmtDate(v.createdAtUtc)}</Td>
                  <Td>
                    {v.status === 'Superseded' && !inFlight && (
                      <Btn
                        variant="secondary"
                        onClick={() => {
                          setMutError(null);
                          rollbackMut.mutate(v.versionId);
                        }}
                        disabled={rollbackMut.isPending}
                      >
                        Rollback
                      </Btn>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </Page>
  );
};

export default Dashboard;
