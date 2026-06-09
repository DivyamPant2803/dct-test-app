import React, { useState } from 'react';
import styled from 'styled-components';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useGetAccessToken } from '../../host-integration/HostContext';
import { getRoles } from '../../api/homepageApi';
import { updateRoleMeta } from '../../api/adminApi';
import { RoleMeta } from '../../shared/types';

const Page = styled.div`
  padding: 1.5rem 2rem;
  max-width: 900px;
  margin: 0 auto;
`;

const PageTitle = styled.h1`
  font-size: 1.3rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.5rem;
`;

const Subtitle = styled.p`
  font-size: 0.85rem;
  color: #6b7280;
  margin: 0 0 1.5rem;
`;

const Card = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
`;

const Th = styled.th`
  text-align: left;
  padding: 0.625rem 1rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  color: #6b7280;
  font-weight: 600;
`;

const Tr = styled.tr`
  &:last-child td { border-bottom: none; }
`;

const Td = styled.td`
  padding: 0.625rem 1rem;
  border-bottom: 1px solid #f3f4f6;
  color: #374151;
  vertical-align: middle;
`;

const Input = styled.input`
  padding: 4px 8px;
  border: 1.5px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.83rem;
  width: 140px;
  &:focus { outline: none; border-color: #2563eb; }
`;

const NumberInput = styled.input`
  padding: 4px 6px;
  border: 1.5px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.83rem;
  width: 60px;
  text-align: center;
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

const Btn = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 4px 14px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  border: 1.5px solid;
  transition: all 0.15s;

  ${({ variant }) =>
    variant === 'primary'
      ? `background:#2563eb;color:white;border-color:#2563eb;&:hover{background:#1d4ed8;}`
      : `background:white;color:#374151;border-color:#d1d5db;&:hover{border-color:#9ca3af;}`}

  &:disabled { opacity: 0.5; cursor: not-allowed; }
  &:focus-visible { outline: 2px solid #2563eb; outline-offset: 2px; }
`;

const ValidationError = styled.div`
  color: #b91c1c;
  font-size: 0.78rem;
  margin-top: 3px;
`;

const SuccessMsg = styled.div`
  background: #d1fae5;
  border: 1px solid #6ee7b7;
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  font-size: 0.82rem;
  color: #065f46;
  margin-bottom: 0.75rem;
`;

const ErrorMsg = styled.div`
  background: #fef2f2;
  border: 1px solid #fca5a5;
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  font-size: 0.82rem;
  color: #b91c1c;
  margin-bottom: 0.75rem;
`;

const FallbackBadge = styled.span`
  font-size: 0.68rem;
  padding: 1px 7px;
  border-radius: 999px;
  background: #ede9fe;
  color: #5b21b6;
  font-weight: 700;
`;

interface RowEdit {
  displayName: string;
  precedence: number;
  isEnabled: boolean;
  isFallback: boolean;
}

const RoleSettings: React.FC = () => {
  const getToken = useGetAccessToken();
  const qc = useQueryClient();

  const rolesQ = useQuery<RoleMeta[], Error>({
    queryKey: ['roles'],
    queryFn: () => getRoles(getToken),
  });

  const [edits, setEdits] = useState<Record<string, RowEdit>>({});
  const [saved, setSaved] = useState<string | null>(null);
  const [mutError, setMutError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const saveMut = useMutation({
    mutationFn: async ({ roleKey, edit }: { roleKey: string; edit: RowEdit }) => {
      return updateRoleMeta(roleKey, edit, getToken);
    },
    onSuccess: (_, { roleKey }) => {
      setSaved(roleKey);
      setMutError(null);
      qc.invalidateQueries({ queryKey: ['roles'] });
      setEdits((prev) => {
        const next = { ...prev };
        delete next[roleKey];
        return next;
      });
      setTimeout(() => setSaved(null), 2500);
    },
    onError: (e: Error) => setMutError(e.message),
  });

  const getRow = (r: RoleMeta): RowEdit =>
    edits[r.roleKey] ?? {
      displayName: r.displayName,
      precedence: r.precedence,
      isEnabled: r.isEnabled,
      isFallback: r.isFallback,
    };

  const updateRow = (roleKey: string, field: keyof RowEdit, value: string | number | boolean) => {
    const current = getRow(rolesQ.data!.find((r) => r.roleKey === roleKey)!);
    setEdits((prev) => ({ ...prev, [roleKey]: { ...current, [field]: value } }));
    setValidationErrors((prev) => {
      const next = { ...prev };
      delete next[roleKey];
      return next;
    });
  };

  const validate = (roleKey: string, edit: RowEdit): string | null => {
    if (!edit.displayName.trim()) return 'Display name is required';
    if (edit.precedence < 1) return 'Precedence must be ≥ 1';

    if (edit.isFallback) {
      const otherFallbacks = (rolesQ.data ?? []).filter(
        (r) => r.roleKey !== roleKey && (edits[r.roleKey]?.isFallback ?? r.isFallback)
      );
      if (otherFallbacks.length > 0) return 'Only one role can be the fallback';
    }

    const allPrecedences = (rolesQ.data ?? []).map((r) => ({
      roleKey: r.roleKey,
      precedence: edits[r.roleKey]?.precedence ?? r.precedence,
    }));

    const duplicates = allPrecedences.filter(
      (p) => p.roleKey !== roleKey && p.precedence === edit.precedence
    );
    if (duplicates.length > 0) return 'Precedence must be unique across all roles';

    return null;
  };

  const handleSave = (roleKey: string) => {
    const edit = edits[roleKey];
    if (!edit) return;

    const err = validate(roleKey, edit);
    if (err) {
      setValidationErrors((prev) => ({ ...prev, [roleKey]: err }));
      return;
    }

    setMutError(null);
    saveMut.mutate({ roleKey, edit });
  };

  if (rolesQ.isLoading) return <div style={{ padding: '2rem', color: '#9ca3af' }}>Loading roles…</div>;

  return (
    <Page>
      <PageTitle>Role Settings</PageTitle>
      <Subtitle>
        Configure display names, precedence, and fallback for each role. Roles are seeded from Entra ID — you cannot add or remove them here.
      </Subtitle>

      {saved && <SuccessMsg role="status">Role "{saved}" saved successfully.</SuccessMsg>}
      {mutError && <ErrorMsg role="alert">{mutError}</ErrorMsg>}

      <Card>
        <Table>
          <thead>
            <tr>
              <Th>Role Key</Th>
              <Th>Display Name</Th>
              <Th>Precedence</Th>
              <Th>Enabled</Th>
              <Th>Fallback</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody>
            {(rolesQ.data ?? []).map((r) => {
              const row = getRow(r);
              const isDirty = !!edits[r.roleKey];
              const errMsg = validationErrors[r.roleKey];

              return (
                <Tr key={r.roleKey}>
                  <Td>
                    <code style={{ fontSize: '0.8rem', color: '#374151' }}>{r.roleKey}</code>
                  </Td>
                  <Td>
                    <div>
                      <Input
                        value={row.displayName}
                        onChange={(e) => updateRow(r.roleKey, 'displayName', e.target.value)}
                        aria-label={`Display name for ${r.roleKey}`}
                      />
                      {errMsg && <ValidationError>{errMsg}</ValidationError>}
                    </div>
                  </Td>
                  <Td>
                    <NumberInput
                      type="number"
                      min={1}
                      value={row.precedence}
                      onChange={(e) => updateRow(r.roleKey, 'precedence', parseInt(e.target.value) || 1)}
                      aria-label={`Precedence for ${r.roleKey}`}
                    />
                  </Td>
                  <Td>
                    <Toggle
                      on={row.isEnabled}
                      onClick={() => updateRow(r.roleKey, 'isEnabled', !row.isEnabled)}
                      aria-label={row.isEnabled ? `Disable ${r.roleKey}` : `Enable ${r.roleKey}`}
                      aria-pressed={row.isEnabled}
                    />
                  </Td>
                  <Td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="radio"
                        name="fallback-role"
                        checked={row.isFallback}
                        onChange={() => {
                          // Set this role as fallback, clear others
                          (rolesQ.data ?? []).forEach((other) => {
                            if (other.roleKey !== r.roleKey) {
                              const otherRow = getRow(other);
                              if (otherRow.isFallback) {
                                setEdits((prev) => ({
                                  ...prev,
                                  [other.roleKey]: { ...otherRow, isFallback: false },
                                }));
                              }
                            }
                          });
                          updateRow(r.roleKey, 'isFallback', true);
                        }}
                        aria-label={`Set ${r.roleKey} as fallback`}
                      />
                      {r.isFallback && !edits[r.roleKey]?.isFallback && (
                        <FallbackBadge>current</FallbackBadge>
                      )}
                    </div>
                  </Td>
                  <Td>
                    {isDirty && (
                      <Btn
                        variant="primary"
                        onClick={() => handleSave(r.roleKey)}
                        disabled={saveMut.isPending}
                      >
                        Save
                      </Btn>
                    )}
                  </Td>
                </Tr>
              );
            })}
          </tbody>
        </Table>
      </Card>

      <p style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: '0.75rem' }}>
        Lower precedence number = higher priority when resolving homepage for multi-role users.
      </p>
    </Page>
  );
};

export default RoleSettings;
