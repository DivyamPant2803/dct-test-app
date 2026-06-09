import React, { useState } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useHostUser, useHostRoles, useGetAccessToken } from '../../host-integration/HostContext';
import {
  getDraft,
  getDiff,
  getPreview,
  approveDraft,
  rejectDraft,
  discardDraft,
} from '../../api/adminApi';
import { getRoles } from '../../api/homepageApi';
import {
  DraftMeta,
  DiffResult,
  HomepageResponse,
  RoleMeta,
  DiffChangeType,
} from '../../shared/types';
import CardGrid from '../homepage/CardGrid';
import { useToast } from '../../components/common';
import { ADMIN_HOME, adminDraftPath } from './routes';

const Page = styled.div`
  padding: 1.5rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
`;

const PageTitle = styled.h1`
  font-size: 1.3rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
`;

const Btn = styled.button<{ variant?: 'primary' | 'secondary' | 'ghost' | 'danger' }>`
  padding: 6px 18px;
  border-radius: 7px;
  font-size: 0.83rem;
  font-weight: 600;
  cursor: pointer;
  border: 1.5px solid;
  transition: all 0.15s;

  ${({ variant }) =>
    variant === 'primary'
      ? `background:#2563eb;color:white;border-color:#2563eb;&:hover{background:#1d4ed8;}`
      : variant === 'danger'
      ? `background:#fef2f2;color:#b91c1c;border-color:#fca5a5;&:hover{background:#fee2e2;}`
      : variant === 'ghost'
      ? `background:transparent;color:#6b7280;border-color:transparent;&:hover{color:#111827;background:#f3f4f6;}`
      : `background:white;color:#374151;border-color:#d1d5db;&:hover{border-color:#9ca3af;}`}

  &:disabled { opacity: 0.5; cursor: not-allowed; }
  &:focus-visible { outline: 2px solid #2563eb; outline-offset: 2px; }
`;

const SectionTitle = styled.h2`
  font-size: 0.95rem;
  font-weight: 700;
  color: #374151;
  margin: 1.5rem 0 0.75rem;
`;

const Card = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 1.25rem;
`;

const MetaRow = styled.div`
  font-size: 0.82rem;
  color: #6b7280;
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1rem;
  margin-top: 0.4rem;
`;

const StatusBadge = styled.span<{ status: string }>`
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  background: ${({ status }) => (status === 'Submitted' ? '#dbeafe' : '#fef9c3')};
  color: ${({ status }) => (status === 'Submitted' ? '#1e40af' : '#92400e')};
`;

const Tabs = styled.div`
  display: flex;
  gap: 0;
  border-bottom: 2px solid #e5e7eb;
  margin-bottom: 1rem;
`;

const DiffTable = styled.table`
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

const ChangeBadge = styled.span<{ change: DiffChangeType }>`
  display: inline-block;
  padding: 1px 8px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  background: ${({ change }) =>
    change === 'Added' ? '#d1fae5' :
    change === 'Removed' ? '#fee2e2' :
    change === 'Edited' ? '#dbeafe' :
    '#fef9c3'};
  color: ${({ change }) =>
    change === 'Added' ? '#065f46' :
    change === 'Removed' ? '#991b1b' :
    change === 'Edited' ? '#1e40af' :
    '#92400e'};
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 8px 18px;
  border: none;
  background: none;
  font-size: 0.88rem;
  font-weight: ${({ active }) => (active ? 700 : 500)};
  color: ${({ active }) => (active ? '#2563eb' : '#6b7280')};
  border-bottom: 2px solid ${({ active }) => (active ? '#2563eb' : 'transparent')};
  margin-bottom: -2px;
  cursor: pointer;
  &:hover { color: #2563eb; }
  &:focus-visible { outline: 2px solid #2563eb; outline-offset: -2px; }
`;

const RejectArea = styled.div`
  border-top: 1px solid #e5e7eb;
  padding-top: 1rem;
  margin-top: 1rem;
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 8px 10px;
  border: 1.5px solid #d1d5db;
  border-radius: 7px;
  font-size: 0.88rem;
  resize: vertical;
  min-height: 72px;
  &:focus { outline: none; border-color: #2563eb; }
`;

const ErrorMsg = styled.div`
  color: #b91c1c;
  background: #fef2f2;
  border: 1px solid #fca5a5;
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  font-size: 0.82rem;
  margin-bottom: 0.75rem;
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

const ReviewScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const draftId = Number(id);
  const navigate = useNavigate();
  const user = useHostUser();
  const userRoles = useHostRoles();
  const getToken = useGetAccessToken();
  const qc = useQueryClient();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'diff' | 'preview'>('diff');
  const [previewRole, setPreviewRole] = useState<string>('');
  const [showReject, setShowReject] = useState(false);
  const [rejectComment, setRejectComment] = useState('');
  const [mutError, setMutError] = useState<string | null>(null);

  const draftQ = useQuery<DraftMeta, Error>({
    queryKey: ['draft', draftId],
    queryFn: () => getDraft(draftId, getToken),
  });

  const diffQ = useQuery<DiffResult, Error>({
    queryKey: ['draft-diff', draftId],
    queryFn: () => getDiff(draftId, getToken),
  });

  const rolesQ = useQuery<RoleMeta[], Error>({
    queryKey: ['roles'],
    queryFn: () => getRoles(getToken),
    onSuccess: (data: RoleMeta[]) => {
      if (!previewRole && data.length > 0) setPreviewRole(data[0].roleKey);
    },
  } as Parameters<typeof useQuery>[0]);

  const previewQ = useQuery<HomepageResponse, Error>({
    queryKey: ['draft-preview', draftId, previewRole],
    queryFn: () => getPreview(draftId, userRoles, getToken, previewRole),
    enabled: activeTab === 'preview' && !!previewRole,
  });

  const approveMut = useMutation({
    mutationFn: () => approveDraft(draftId, getToken, user.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-state'] });
      qc.invalidateQueries({ queryKey: ['admin-versions'] });
      qc.invalidateQueries({ queryKey: ['homepage'] });
      showToast('Draft approved and published.', 'success');
      navigate(ADMIN_HOME);
    },
    onError: (e: Error) => setMutError(e.message),
  });

  const rejectMut = useMutation({
    mutationFn: () => rejectDraft(draftId, rejectComment, getToken, user.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-state'] });
      qc.invalidateQueries({ queryKey: ['admin-versions'] });
      qc.invalidateQueries({ queryKey: ['draft', draftId] });
      setShowReject(false);
      setRejectComment('');
      showToast('Draft returned for editing.', 'success');
      navigate(ADMIN_HOME);
    },
    onError: (e: Error) => setMutError(e.message),
  });

  const discardMut = useMutation({
    mutationFn: () => discardDraft(draftId, getToken, user.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-state'] });
      qc.invalidateQueries({ queryKey: ['admin-versions'] });
      qc.removeQueries({ queryKey: ['draft', draftId] });
      showToast('Draft discarded.', 'success');
      navigate(ADMIN_HOME);
    },
    onError: (e: Error) => setMutError(e.message),
  });

  const draft = draftQ.data;
  const isAuthor = draft?.createdBy === user.id;
  const canApprove = draft?.status === 'Submitted';

  const handleDiscard = () => {
    if (!window.confirm(`Discard draft v${draft?.versionNo}? This cannot be undone.`)) return;
    setMutError(null);
    discardMut.mutate();
  };

  if (draftQ.isLoading) return <div style={{ padding: '2rem', color: '#9ca3af' }}>Loading…</div>;
  if (draftQ.isError || !draft) return <div style={{ padding: '2rem', color: '#b91c1c' }}>Draft not found.</div>;

  return (
    <Page>
      <TopBar>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Btn variant="ghost" onClick={() => navigate(ADMIN_HOME)} aria-label="Back">← Back</Btn>
          <PageTitle>Review Draft v{draft.versionNo}</PageTitle>
          <StatusBadge status={draft.status}>{draft.status}</StatusBadge>
        </div>
      </TopBar>

      {mutError && <ErrorMsg role="alert">{mutError}</ErrorMsg>}

      {/* Draft meta */}
      <Card style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#111827' }}>
          {draft.title ?? `v${draft.versionNo}`}
        </div>
        <MetaRow>
          <span>Created by <strong>{draft.createdBy}</strong></span>
          <span>{fmtDate(draft.createdAtUtc)}</span>
          {draft.submittedBy && (
            <span>Submitted by <strong>{draft.submittedBy}</strong> at {fmtDate(draft.submittedAtUtc)}</span>
          )}
        </MetaRow>

        {/* Approve / Reject actions */}
        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {canApprove && (
            <Btn
              variant="primary"
              onClick={() => { setMutError(null); approveMut.mutate(); }}
              disabled={approveMut.isPending}
            >
              {approveMut.isPending ? 'Approving…' : 'Approve & Publish'}
            </Btn>
          )}
          {draft.status === 'Submitted' && (
            <Btn
              variant="danger"
              onClick={() => setShowReject(!showReject)}
            >
              Reject
            </Btn>
          )}
          {isAuthor && (draft.status === 'Draft' || draft.status === 'Submitted') && (
            <Btn
              variant="danger"
              onClick={handleDiscard}
              disabled={discardMut.isPending}
            >
              {discardMut.isPending ? 'Discarding…' : 'Discard Draft'}
            </Btn>
          )}
          {draft.status === 'Draft' && draft.createdBy === user.id && (
            <Btn variant="secondary" onClick={() => navigate(adminDraftPath(draft.versionId))}>
              Continue Editing
            </Btn>
          )}
        </div>

        {showReject && (
          <RejectArea>
            <label htmlFor="reject-comment" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>
              Rejection reason (required)
            </label>
            <Textarea
              id="reject-comment"
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              placeholder="Explain why this draft is being rejected…"
              aria-required="true"
            />
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <Btn
                variant="danger"
                onClick={() => { setMutError(null); rejectMut.mutate(); }}
                disabled={!rejectComment.trim() || rejectMut.isPending}
              >
                {rejectMut.isPending ? 'Rejecting…' : 'Confirm Rejection'}
              </Btn>
              <Btn variant="secondary" onClick={() => setShowReject(false)}>Cancel</Btn>
            </div>
          </RejectArea>
        )}
      </Card>

      {/* Diff / Preview tabs */}
      <Tabs role="tablist" aria-label="Review tabs">
        <Tab active={activeTab === 'diff'} role="tab" aria-selected={activeTab === 'diff'} onClick={() => setActiveTab('diff')}>
          Changes ({diffQ.data?.changes.length ?? '…'})
        </Tab>
        <Tab active={activeTab === 'preview'} role="tab" aria-selected={activeTab === 'preview'} onClick={() => setActiveTab('preview')}>
          Preview
        </Tab>
      </Tabs>

      {/* Diff view */}
      {activeTab === 'diff' && (
        <>
          {diffQ.isLoading && <EmptyMsg>Computing diff…</EmptyMsg>}
          {diffQ.isError && <ErrorMsg>Failed to load diff.</ErrorMsg>}
          {diffQ.data && diffQ.data.changes.length === 0 && (
            <EmptyMsg>No changes detected between this draft and the live version.</EmptyMsg>
          )}
          {diffQ.data && diffQ.data.changes.length > 0 && (
            <Card>
              <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.75rem' }}>
                Compared to live v{diffQ.data.vsVersionNo}
              </div>
              <DiffTable>
                <thead>
                  <tr>
                    <Th>Role</Th>
                    <Th>Card</Th>
                    <Th>Change</Th>
                    <Th>Affected fields</Th>
                  </tr>
                </thead>
                <tbody>
                  {diffQ.data.changes.map((c, i) => (
                    <tr key={i}>
                      <Td>{c.role}</Td>
                      <Td>{c.header}</Td>
                      <Td><ChangeBadge change={c.change}>{c.change}</ChangeBadge></Td>
                      <Td>
                        {c.fields ? (
                          <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#4b5563' }}>
                            {c.fields.join(', ')}
                          </span>
                        ) : '—'}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </DiffTable>
            </Card>
          )}
        </>
      )}

      {/* Preview view */}
      {activeTab === 'preview' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.83rem', color: '#6b7280' }}>Preview as:</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {(rolesQ.data ?? []).map((r) => (
                <Btn
                  key={r.roleKey}
                  variant={previewRole === r.roleKey ? 'primary' : 'secondary'}
                  onClick={() => setPreviewRole(r.roleKey)}
                  style={{ padding: '4px 12px' }}
                >
                  {r.displayName}
                </Btn>
              ))}
            </div>
          </div>
          {previewQ.isLoading && <EmptyMsg>Loading preview…</EmptyMsg>}
          {previewQ.isError && <ErrorMsg>Failed to load preview.</ErrorMsg>}
          {previewQ.data && (
            <CardGrid cards={previewQ.data.cards} />
          )}
        </>
      )}
    </Page>
  );
};

export default ReviewScreen;
