import React, { useEffect, useCallback, useState, useRef } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Heading from '@tiptap/extension-heading';
import { useHostUser, useGetAccessToken } from '../../host-integration/HostContext';
import { getDraft, saveDraft, submitDraft, discardDraft } from '../../api/adminApi';
import { getRoles } from '../../api/homepageApi';
import { useDraftStore } from './store/draftStore';
import {
  DraftMeta,
  Card,
  CardType,
  CardSize,
  ConfigJson,
  RoleMeta,
  CardItem,
} from '../../shared/types';
import { sanitizeHtml, isSafeUrl } from '../../shared/sanitize';
import { validateConfig } from '../../shared/validateConfig';
import { useToast } from '../../components/common';
import { ADMIN_HOME, adminReviewPath } from './routes';
import { v4 as uuidv4 } from 'uuid';

// ─── Styled components ────────────────────────────────────────────────────────

const Page = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 2rem;
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
  padding: 6px 16px;
  border-radius: 7px;
  font-size: 0.83rem;
  font-weight: 600;
  cursor: pointer;
  border: 1.5px solid;
  transition: all 0.15s;
  display: inline-flex;
  align-items: center;
  gap: 4px;

  ${({ variant }) =>
    variant === 'primary'
      ? `background:#2563eb;color:white;border-color:#2563eb;
         &:hover{background:#1d4ed8;}`
      : variant === 'danger'
      ? `background:#fef2f2;color:#b91c1c;border-color:#fca5a5;
         &:hover{background:#fee2e2;}`
      : variant === 'ghost'
      ? `background:transparent;color:#6b7280;border-color:transparent;
         &:hover{color:#111827;background:#f3f4f6;border-color:#f3f4f6;}`
      : `background:white;color:#374151;border-color:#d1d5db;
         &:hover{border-color:#9ca3af;}`}

  &:disabled { opacity: 0.5; cursor: not-allowed; }
  &:focus-visible { outline: 2px solid #2563eb; outline-offset: 2px; }
`;

const SaveStatus = styled.span<{ status: 'saved' | 'dirty' | 'saving' | 'error' }>`
  font-size: 0.75rem;
  color: ${({ status }) =>
    status === 'saved' ? '#10b981' : status === 'error' ? '#ef4444' : '#9ca3af'};
`;

const RoleSection = styled.section`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 1rem 1.25rem;
  margin-bottom: 1rem;
`;

const RoleSectionTitle = styled.h2`
  font-size: 0.95rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 4px;
`;

const RoleSectionHint = styled.p`
  font-size: 0.82rem;
  color: #6b7280;
  margin: 0 0 0.875rem;
`;

const RolePills = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const RolePill = styled.button<{ active: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 8px 16px;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  border: 1.5px solid ${({ active }) => (active ? '#2563eb' : '#d1d5db')};
  background: ${({ active }) => (active ? '#eff6ff' : 'white')};
  color: ${({ active }) => (active ? '#1d4ed8' : '#374151')};
  transition: all 0.15s;

  &:hover {
    border-color: #2563eb;
    color: #1d4ed8;
  }
  &:focus-visible { outline: 2px solid #2563eb; outline-offset: 2px; }
`;

const RoleCardCount = styled.span`
  font-size: 0.72rem;
  font-weight: 600;
  color: #6b7280;
  background: #f3f4f6;
  padding: 1px 8px;
  border-radius: 999px;
`;

const ActiveRoleBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.625rem 0.875rem;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  font-size: 0.83rem;
  color: #374151;
`;

const TitleInput = styled.input`
  width: 100%;
  padding: 6px 10px;
  border: 1.5px solid #d1d5db;
  border-radius: 7px;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  &:focus { outline: none; border-color: #2563eb; }
`;

const CardList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const CardRow = styled.li`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  padding: 0.625rem 0.75rem;

  &:hover { border-color: #d1d5db; }
`;

const TypeBadge = styled.span`
  font-size: 0.7rem;
  font-weight: 700;
  padding: 1px 8px;
  border-radius: 999px;
  background: #eff6ff;
  color: #1d4ed8;
  white-space: nowrap;
`;

const CardHeaderText = styled.span`
  flex: 1;
  font-size: 0.88rem;
  font-weight: 600;
  color: #111827;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const SizeSelect = styled.select`
  padding: 3px 6px;
  border-radius: 5px;
  border: 1px solid #d1d5db;
  font-size: 0.78rem;
  cursor: pointer;
  &:focus { outline: none; border-color: #2563eb; }
`;

const Toggle = styled.button<{ on: boolean }>`
  width: 36px;
  height: 20px;
  border-radius: 999px;
  border: none;
  background: ${({ on }) => (on ? '#2563eb' : '#d1d5db')};
  position: relative;
  cursor: pointer;
  transition: background 0.15s;
  flex-shrink: 0;

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${({ on }) => (on ? '18px' : '2px')};
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: white;
    transition: left 0.15s;
  }

  &:focus-visible { outline: 2px solid #2563eb; outline-offset: 2px; }
`;

const IconBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 5px;
  font-size: 1rem;
  color: #6b7280;
  &:hover { background: #f3f4f6; color: #111827; }
  &:focus-visible { outline: 2px solid #2563eb; outline-offset: 2px; }
`;

const AddCardBar = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px dashed #e5e7eb;
`;

const TypeSelect = styled.select`
  padding: 6px 10px;
  border: 1.5px solid #d1d5db;
  border-radius: 7px;
  font-size: 0.83rem;
  cursor: pointer;
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

// Modal overlay for card editing
const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  width: 620px;
  max-width: 95vw;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
`;

const Label = styled.label`
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 3px;
`;

const Input = styled.input`
  width: 100%;
  padding: 6px 10px;
  border: 1.5px solid #d1d5db;
  border-radius: 7px;
  font-size: 0.88rem;
  &:focus { outline: none; border-color: #2563eb; }
`;

const EditorWrapper = styled.div`
  border: 1.5px solid #d1d5db;
  border-radius: 7px;
  overflow: hidden;

  .ProseMirror {
    padding: 8px 10px;
    min-height: 80px;
    font-size: 0.88rem;
    outline: none;
    color: #111827;

    h3 { font-size: 1rem; font-weight: 700; }
    h4 { font-size: 0.9rem; font-weight: 700; }
    ul, ol { padding-left: 1.25rem; }
    a { color: #2563eb; }
    p { margin: 0.25rem 0; }
  }
`;

const EditorToolbar = styled.div`
  display: flex;
  gap: 2px;
  padding: 4px 6px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  flex-wrap: wrap;
`;

const ToolbarBtn = styled.button<{ active?: boolean }>`
  padding: 2px 7px;
  border: 1px solid ${({ active }) => (active ? '#2563eb' : 'transparent')};
  background: ${({ active }) => (active ? '#eff6ff' : 'transparent')};
  border-radius: 4px;
  font-size: 0.78rem;
  cursor: pointer;
  color: ${({ active }) => (active ? '#1d4ed8' : '#374151')};
  &:hover { background: #f0f9ff; }
`;

const CARD_TYPES: CardType[] = [
  'RichText', 'LinkList', 'NoticeList', 'Timeline', 'Metric', 'Chart', 'ActivityFeed',
];
const SIZES: CardSize[] = ['Small', 'Medium', 'Large', 'FullWidth'];
const DATA_PROVIDERS = [
  'total-requests', 'pending-approvals', 'active-transfers', 'completed-30d',
  'sla-performance', 'escalations', 'team-workload', 'approval-queue',
  'my-open-requests', 'requests-awaiting-action', 'recently-completed', 'transfer-status-summary',
] as const;

// ─── TipTap Rich Text Editor ──────────────────────────────────────────────────

interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
}

const RichEditor: React.FC<RichEditorProps> = ({ value, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false }),
      Heading.configure({ levels: [3, 4] }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        validate: (href) => isSafeUrl(href),
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(sanitizeHtml(editor.getHTML()));
    },
  });

  if (!editor) return null;

  return (
    <EditorWrapper>
      <EditorToolbar>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}><b>B</b></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}><i>I</i></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })}>H3</ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} active={editor.isActive('heading', { level: 4 })}>H4</ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}>• List</ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}>1. List</ToolbarBtn>
        <ToolbarBtn
          onClick={() => {
            const url = window.prompt('Enter URL (https://...)');
            if (url && isSafeUrl(url)) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          active={editor.isActive('link')}
        >
          Link
        </ToolbarBtn>
        {editor.isActive('link') && (
          <ToolbarBtn onClick={() => editor.chain().focus().unsetLink().run()}>
            Unlink
          </ToolbarBtn>
        )}
      </EditorToolbar>
      <EditorContent editor={editor} />
    </EditorWrapper>
  );
};

// ─── Card Edit Modal ──────────────────────────────────────────────────────────

interface CardEditModalProps {
  card: Card;
  onSave: (updated: Card) => void;
  onClose: () => void;
}

const CardEditModal: React.FC<CardEditModalProps> = ({ card, onSave, onClose }) => {
  const [draft, setDraft] = useState<Card>({ ...card, items: [...(card.items ?? [])] });

  const updateField = <K extends keyof Card>(k: K, v: Card[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const updateItem = (idx: number, update: Partial<CardItem>) =>
    setDraft((d) => {
      const items = [...d.items];
      items[idx] = { ...items[idx], ...update };
      return { ...d, items };
    });

  const addItem = () =>
    setDraft((d) => ({
      ...d,
      items: [
        ...d.items,
        {
          id: uuidv4(),
          order: d.items.length + 1,
          title: '',
          bodyHtml: '',
          url: null,
          iconKey: null,
          badgeText: null,
          effectiveFromUtc: null,
          effectiveToUtc: null,
          extra: {},
        },
      ],
    }));

  const removeItem = (idx: number) =>
    setDraft((d) => ({
      ...d,
      items: d.items.filter((_, i) => i !== idx).map((item, i) => ({ ...item, order: i + 1 })),
    }));

  const isStructured = ['LinkList', 'NoticeList', 'Timeline'].includes(draft.type);
  const isData = ['Metric', 'Chart', 'ActivityFeed'].includes(draft.type);
  const isProse = draft.type === 'RichText';

  return (
    <ModalBackdrop onClick={onClose} role="dialog" aria-modal="true" aria-label={`Edit card: ${card.header}`}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <ModalTitle>Edit Card — {draft.type}</ModalTitle>

        <div>
          <Label htmlFor="card-header">Header *</Label>
          <Input
            id="card-header"
            value={draft.header}
            onChange={(e) => updateField('header', e.target.value)}
            placeholder="Card title"
          />
        </div>

        <div>
          <Label htmlFor="card-subtitle">Subtitle</Label>
          <Input
            id="card-subtitle"
            value={draft.subtitle ?? ''}
            onChange={(e) => updateField('subtitle', e.target.value || null)}
            placeholder="Optional subtitle"
          />
        </div>

        {isProse && (
          <div>
            <Label>Body Content</Label>
            <RichEditor
              value={draft.bodyHtml ?? ''}
              onChange={(html) => updateField('bodyHtml', html || null)}
            />
          </div>
        )}

        {isData && (
          <>
            <div>
              <Label htmlFor="card-provider">Data Provider *</Label>
              <TypeSelect
                id="card-provider"
                value={draft.dataProviderKey ?? ''}
                onChange={(e) => updateField('dataProviderKey', e.target.value as Card['dataProviderKey'])}
              >
                <option value="">— Select provider —</option>
                {DATA_PROVIDERS.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </TypeSelect>
            </div>
            {draft.type === 'Chart' && (
              <div>
                <Label htmlFor="chart-type">Chart Type</Label>
                <TypeSelect
                  id="chart-type"
                  value={(draft.settings?.chartType as string) ?? 'bar'}
                  onChange={(e) =>
                    updateField('settings', { ...draft.settings, chartType: e.target.value })
                  }
                >
                  {['bar', 'line', 'pie', 'donut'].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </TypeSelect>
              </div>
            )}
          </>
        )}

        {isStructured && (
          <div>
            <Label>Items</Label>
            {draft.items.map((item, idx) => (
              <div
                key={item.id}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: 6,
                  padding: '0.625rem',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                }}
              >
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'space-between' }}>
                  <strong style={{ fontSize: '0.78rem', color: '#6b7280' }}>Item {idx + 1}</strong>
                  <Btn variant="ghost" onClick={() => removeItem(idx)} aria-label={`Remove item ${idx + 1}`} style={{ padding: '1px 6px', fontSize: '0.75rem' }}>✕ Remove</Btn>
                </div>
                <Input
                  placeholder="Title"
                  value={item.title ?? ''}
                  onChange={(e) => updateItem(idx, { title: e.target.value || null })}
                  aria-label={`Item ${idx + 1} title`}
                />
                <div>
                  <Label>Body HTML</Label>
                  <RichEditor
                    value={item.bodyHtml ?? ''}
                    onChange={(html) => updateItem(idx, { bodyHtml: html || null })}
                  />
                </div>
                <Input
                  placeholder="URL (https://…)"
                  value={item.url ?? ''}
                  onChange={(e) => updateItem(idx, { url: e.target.value || null })}
                  aria-label={`Item ${idx + 1} URL`}
                />
                <Input
                  placeholder="Badge text"
                  value={item.badgeText ?? ''}
                  onChange={(e) => updateItem(idx, { badgeText: e.target.value || null })}
                  aria-label={`Item ${idx + 1} badge text`}
                />
              </div>
            ))}
            <Btn variant="secondary" onClick={addItem}>+ Add Item</Btn>
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" onClick={() => onSave(draft)}>Save Card</Btn>
        </div>
      </Modal>
    </ModalBackdrop>
  );
};

// ─── Main DraftEditor ──────────────────────────────────────────────────────────

const DraftEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const draftId = Number(id);
  const navigate = useNavigate();
  const user = useHostUser();
  const getToken = useGetAccessToken();
  const qc = useQueryClient();
  const { showToast } = useToast();
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    workingConfig,
    title,
    etag,
    isDirty,
    isSaving,
    saveError,
    lastSavedAt,
    initDraft,
    updateConfig,
    updateTitle,
    setSaving,
    confirmSaved,
    setSaveError,
    clearDraft,
  } = useDraftStore();

  const [activeRole, setActiveRole] = useState<string>('');
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [addType, setAddType] = useState<CardType>('NoticeList');
  const [mutError, setMutError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const draftQ = useQuery<DraftMeta, Error>({
    queryKey: ['draft', draftId],
    queryFn: () => getDraft(draftId, getToken),
    staleTime: 0,
  });

  const rolesQ = useQuery<RoleMeta[], Error>({
    queryKey: ['roles'],
    queryFn: () => getRoles(getToken),
  });

  // Initialise store when draft loads
  useEffect(() => {
    if (draftQ.data) {
      initDraft(
        draftQ.data.versionId,
        draftQ.data.config,
        draftQ.data.title,
        draftQ.data.etag
      );
    }
  }, [draftQ.data, initDraft]);

  // Set default active role once roles are available
  useEffect(() => {
    if (!rolesQ.data?.length) return;
    setActiveRole((current) => {
      if (current && rolesQ.data!.some((r) => r.roleKey === current)) return current;
      return rolesQ.data![0].roleKey;
    });
  }, [rolesQ.data]);

  // Debounced autosave
  const triggerAutosave = useCallback(() => {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(async () => {
      if (!workingConfig || !etag) return;
      setSaving(true);
      try {
        const result = await saveDraft(draftId, title, workingConfig, etag, getToken, user.id);
        confirmSaved(result.etag);
        qc.invalidateQueries({ queryKey: ['admin-state'] });
      } catch (e) {
        const msg = (e as Error).message;
        setSaveError(msg);
        if (msg.includes('412')) {
          // ETag mismatch — reload draft
          qc.invalidateQueries({ queryKey: ['draft', draftId] });
        }
      }
    }, 1000);
  }, [workingConfig, etag, title, draftId, getToken, user.id, setSaving, confirmSaved, setSaveError, qc]);

  useEffect(() => {
    if (isDirty) triggerAutosave();
  }, [isDirty, workingConfig, title, triggerAutosave]);

  const submitMut = useMutation({
    mutationFn: async () => {
      if (!workingConfig || !etag) {
        throw new Error('Draft not loaded.');
      }
      const result = validateConfig(workingConfig);
      if (!result.ok) {
        throw new Error(`Validation failed:\n${result.errors.slice(0, 5).join('\n')}`);
      }
      // Persist latest config before submit so approval publishes the edited UI
      const saved = await saveDraft(draftId, title, workingConfig, etag, getToken, user.id);
      confirmSaved(saved.etag);
      return submitDraft(draftId, getToken, user.id);
    },
    onSuccess: () => {
      setValidationErrors([]);
      qc.invalidateQueries({ queryKey: ['admin-state'] });
      qc.invalidateQueries({ queryKey: ['admin-versions'] });
      qc.invalidateQueries({ queryKey: ['draft', draftId] });
      showToast('Draft submitted for review.', 'success');
      navigate(ADMIN_HOME);
    },
    onError: (e: Error) => {
      const msg = e.message;
      if (msg.startsWith('Validation failed:')) {
        setValidationErrors(msg.replace('Validation failed:\n', '').split('\n'));
        setMutError('Please fix the validation errors below before submitting.');
      } else {
        setMutError(msg);
      }
    },
  });

  const discardMut = useMutation({
    mutationFn: () => discardDraft(draftId, getToken, user.id),
    onSuccess: () => {
      clearDraft();
      qc.invalidateQueries({ queryKey: ['admin-state'] });
      qc.invalidateQueries({ queryKey: ['admin-versions'] });
      qc.removeQueries({ queryKey: ['draft', draftId] });
      showToast('Draft discarded.', 'success');
      navigate(ADMIN_HOME);
    },
    onError: (e: Error) => setMutError(e.message),
  });

  const handleDiscard = () => {
    if (!window.confirm(`Discard draft v${draftQ.data?.versionNo}? This cannot be undone.`)) return;
    setMutError(null);
    discardMut.mutate();
  };

  if (draftQ.isLoading || !workingConfig) {
    return <div style={{ padding: '2rem', color: '#9ca3af' }}>Loading draft…</div>;
  }

  if (draftQ.isError) {
    return <div style={{ padding: '2rem', color: '#b91c1c' }}>Failed to load draft.</div>;
  }

  const isReadOnly = draftQ.data?.status !== 'Draft' || draftQ.data?.createdBy !== user.id;
  const canDiscard =
    draftQ.data?.createdBy === user.id &&
    (draftQ.data?.status === 'Draft' || draftQ.data?.status === 'Submitted');

  const metaByKey = new Map((rolesQ.data ?? []).map((r) => [r.roleKey, r]));
  const editableRoles: RoleMeta[] = [
    ...new Set([
      ...(rolesQ.data ?? []).map((r) => r.roleKey),
      ...Object.keys(workingConfig.roles),
    ]),
  ]
    .map(
      (key) =>
        metaByKey.get(key) ?? {
          roleKey: key,
          displayName: key,
          precedence: 99,
          isEnabled: true,
          isFallback: false,
        }
    )
    .sort((a, b) => a.precedence - b.precedence);

  const activeRoleMeta = editableRoles.find((r) => r.roleKey === activeRole);
  const cards = (workingConfig.roles[activeRole]?.cards ?? []).sort((a, b) => a.order - b.order);

  // ─── Card operations ──────────────────────────────────────────────────────

  const patchCards = (roleKey: string, newCards: Card[]) => {
    const normalized = newCards.map((c, i) => ({ ...c, order: i + 1 }));
    updateConfig({
      ...workingConfig,
      roles: {
        ...workingConfig.roles,
        [roleKey]: { cards: normalized },
      },
    });
  };

  const moveCard = (idx: number, direction: -1 | 1) => {
    const arr = [...cards];
    const target = idx + direction;
    if (target < 0 || target >= arr.length) return;
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    patchCards(activeRole, arr);
  };

  const toggleCard = (cardId: string) => {
    patchCards(
      activeRole,
      cards.map((c) => (c.id === cardId ? { ...c, enabled: !c.enabled } : c))
    );
  };

  const resizeCard = (cardId: string, size: CardSize) => {
    patchCards(
      activeRole,
      cards.map((c) => (c.id === cardId ? { ...c, size } : c))
    );
  };

  const deleteCard = (cardId: string) => {
    patchCards(activeRole, cards.filter((c) => c.id !== cardId));
  };

  const saveEditedCard = (updated: Card) => {
    // Sanitize bodyHtml on save (client-side, mirrors server-side HtmlSanitizer)
    const sanitized: Card = {
      ...updated,
      bodyHtml: updated.bodyHtml ? sanitizeHtml(updated.bodyHtml) : null,
      items: updated.items.map((item) => ({
        ...item,
        bodyHtml: item.bodyHtml ? sanitizeHtml(item.bodyHtml) : null,
      })),
    };
    patchCards(
      activeRole,
      cards.map((c) => (c.id === sanitized.id ? sanitized : c))
    );
    setEditingCard(null);
  };

  const addCard = () => {
    const newCard: Card = {
      id: uuidv4(),
      type: addType,
      header: `New ${addType} Card`,
      subtitle: null,
      size: 'Medium',
      order: cards.length + 1,
      enabled: true,
      bodyHtml: addType === 'RichText' ? '<p>Enter content here.</p>' : null,
      items: [],
      dataProviderKey:
        ['Metric', 'Chart', 'ActivityFeed'].includes(addType) ? 'total-requests' : null,
      settings: addType === 'Chart' ? { chartType: 'bar' } : {},
    };
    patchCards(activeRole, [...cards, newCard]);
  };

  const saveStatus = isSaving
    ? 'saving'
    : saveError
    ? 'error'
    : isDirty
    ? 'dirty'
    : 'saved';

  const saveStatusLabel =
    isSaving ? 'Saving…' :
    saveError ? `Save error: ${saveError}` :
    isDirty ? 'Unsaved changes' :
    lastSavedAt ? `Saved ${lastSavedAt.toLocaleTimeString()}` : '';

  return (
    <Page>
      <TopBar>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Btn variant="ghost" onClick={() => navigate(ADMIN_HOME)} aria-label="Back to dashboard">← Back</Btn>
          <PageTitle>
            {isReadOnly ? 'View Draft' : 'Edit Draft'}{' '}
            <span style={{ fontWeight: 400, color: '#6b7280', fontSize: '0.9rem' }}>
              v{draftQ.data?.versionNo}
            </span>
          </PageTitle>
          <SaveStatus status={saveStatus}>{saveStatusLabel}</SaveStatus>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {canDiscard && (
            <Btn
              variant="danger"
              onClick={handleDiscard}
              disabled={discardMut.isPending}
            >
              {discardMut.isPending ? 'Discarding…' : 'Discard Draft'}
            </Btn>
          )}
          {!isReadOnly && (
            <>
              <Btn
                variant="secondary"
                onClick={() => navigate(adminReviewPath(draftId))}
              >
                Preview &amp; Review
              </Btn>
              <Btn
                variant="primary"
                onClick={() => { setMutError(null); submitMut.mutate(); }}
                disabled={submitMut.isPending || isDirty}
                title={isDirty ? 'Save before submitting' : undefined}
              >
                {submitMut.isPending ? 'Submitting…' : 'Submit for Review'}
              </Btn>
            </>
          )}
        </div>
      </TopBar>

      {isReadOnly && (
        <div style={{
          background: '#fffbeb',
          border: '1px solid #fde68a',
          borderRadius: 8,
          padding: '0.625rem 1rem',
          fontSize: '0.83rem',
          color: '#92400e',
          marginBottom: '0.75rem',
        }}>
          {draftQ.data?.createdBy !== user.id
            ? 'This draft was created by another user. You can view but not edit it.'
            : 'This draft is not in Draft status and cannot be edited.'}
        </div>
      )}

      {!isReadOnly && (
        <div>
          <label htmlFor="draft-title" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 3 }}>
            Draft Title
          </label>
          <TitleInput
            id="draft-title"
            placeholder="E.g. May maintenance banner"
            value={title ?? ''}
            onChange={(e) => updateTitle(e.target.value || null as unknown as string)}
          />
        </div>
      )}

      {mutError && <ErrorMsg role="alert">{mutError}</ErrorMsg>}

      {validationErrors.length > 0 && (
        <ErrorMsg role="alert">
          <strong>Validation errors:</strong>
          <ul style={{ margin: '4px 0 0', paddingLeft: '1.25rem' }}>
            {validationErrors.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </ErrorMsg>
      )}

      {/* Role layout picker */}
      <RoleSection aria-label="Role layout customization">
        <RoleSectionTitle>Customize by role</RoleSectionTitle>
        <RoleSectionHint>
          Each role has its own homepage layout. Select a role below to add, edit, or reorder its cards.
        </RoleSectionHint>

        {rolesQ.isLoading && (
          <div style={{ fontSize: '0.82rem', color: '#9ca3af' }}>Loading roles…</div>
        )}

        {rolesQ.isError && (
          <div style={{ fontSize: '0.82rem', color: '#b91c1c' }}>Failed to load roles.</div>
        )}

        {!rolesQ.isLoading && editableRoles.length > 0 && (
          <RolePills role="tablist" aria-label="Roles">
            {editableRoles.map((r) => {
              const count = workingConfig.roles[r.roleKey]?.cards?.length ?? 0;
              return (
                <RolePill
                  key={r.roleKey}
                  active={activeRole === r.roleKey}
                  role="tab"
                  aria-selected={activeRole === r.roleKey}
                  onClick={() => setActiveRole(r.roleKey)}
                >
                  {r.displayName}
                  <RoleCardCount>{count} {count === 1 ? 'card' : 'cards'}</RoleCardCount>
                </RolePill>
              );
            })}
          </RolePills>
        )}
      </RoleSection>

      {activeRoleMeta && (
        <ActiveRoleBar>
          <span>
            {isReadOnly ? 'Viewing' : 'Editing'} layout for{' '}
            <strong>{activeRoleMeta.displayName}</strong>
            {!activeRoleMeta.isEnabled && (
              <span style={{ color: '#92400e', marginLeft: 6 }}>(role disabled)</span>
            )}
          </span>
          <span style={{ color: '#6b7280' }}>
            {cards.length} {cards.length === 1 ? 'card' : 'cards'}
          </span>
        </ActiveRoleBar>
      )}

      {/* Card list */}
      <CardList role="list" aria-label={`Cards for ${activeRoleMeta?.displayName ?? activeRole}`}>
        {cards.length === 0 && (
          <div style={{ color: '#9ca3af', fontSize: '0.85rem', padding: '1rem 0' }}>
            No cards for this role. Add one below.
          </div>
        )}
        {cards.map((card, idx) => (
          <CardRow key={card.id} role="listitem">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginRight: 4 }}>
              <IconBtn
                onClick={() => moveCard(idx, -1)}
                disabled={idx === 0 || isReadOnly}
                aria-label={`Move ${card.header} up`}
                style={{ padding: '1px 5px', lineHeight: 1 }}
              >
                ▲
              </IconBtn>
              <IconBtn
                onClick={() => moveCard(idx, 1)}
                disabled={idx === cards.length - 1 || isReadOnly}
                aria-label={`Move ${card.header} down`}
                style={{ padding: '1px 5px', lineHeight: 1 }}
              >
                ▼
              </IconBtn>
            </div>

            <TypeBadge>{card.type}</TypeBadge>
            <CardHeaderText title={card.header}>{card.header}</CardHeaderText>

            <SizeSelect
              value={card.size}
              onChange={(e) => resizeCard(card.id, e.target.value as CardSize)}
              disabled={isReadOnly}
              aria-label={`Size for ${card.header}`}
            >
              {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
            </SizeSelect>

            <Toggle
              on={card.enabled}
              onClick={() => !isReadOnly && toggleCard(card.id)}
              aria-label={card.enabled ? `Disable ${card.header}` : `Enable ${card.header}`}
              aria-pressed={card.enabled}
              disabled={isReadOnly}
            />

            {!isReadOnly && (
              <>
                <IconBtn onClick={() => setEditingCard(card)} aria-label={`Edit ${card.header}`}>✏️</IconBtn>
                <IconBtn onClick={() => deleteCard(card.id)} aria-label={`Delete ${card.header}`}>🗑️</IconBtn>
              </>
            )}
          </CardRow>
        ))}
      </CardList>

      {!isReadOnly && (
        <AddCardBar>
          <span style={{ fontSize: '0.82rem', color: '#6b7280', fontWeight: 600 }}>Add card:</span>
          <TypeSelect
            value={addType}
            onChange={(e) => setAddType(e.target.value as CardType)}
            aria-label="New card type"
          >
            {CARD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </TypeSelect>
          <Btn variant="secondary" onClick={addCard}>+ Add</Btn>
        </AddCardBar>
      )}

      {!isReadOnly && (
        <div style={{ marginTop: '1rem', fontSize: '0.78rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          ℹ️ Submit requires another admin to approve. Your changes autosave every second.
        </div>
      )}

      {editingCard && (
        <CardEditModal
          card={editingCard}
          onSave={saveEditedCard}
          onClose={() => setEditingCard(null)}
        />
      )}
    </Page>
  );
};

export default DraftEditor;
