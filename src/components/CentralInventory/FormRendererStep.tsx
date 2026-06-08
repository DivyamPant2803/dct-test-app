import { useEffect, useState } from 'react';
import { FormRenderer } from '@form-builder/renderer';
import '@form-builder/renderer/styles';
import { fetchFormSchema } from '../../services/formBuilderService';
import { ApplicationData } from '../../services/applicationDataService';

interface FormRendererStepProps {
  formId: string;
  prefillData?: ApplicationData | null;
  onContinue: (
    filledData: Record<string, unknown>,
    tableData: Record<string, unknown[]>,
    fileData: Record<string, unknown[]>
  ) => void;
}

function toFileAttachments(fieldId: string, value: unknown): Record<string, unknown>[] {
  const now = new Date().toISOString();
  const toEntry = (f: File) => ({
    id: `file-${fieldId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    fieldId,
    fileName: f.name,
    fileSize: f.size,
    fileType: f.type,
    uploadedAt: now,
  });

  if (typeof File !== 'undefined' && value instanceof File) return [toEntry(value)];
  if (typeof FileList !== 'undefined' && value instanceof FileList) return Array.from(value).map(toEntry);
  if (Array.isArray(value)) return value.filter((f): f is File => typeof File !== 'undefined' && f instanceof File).map(toEntry);
  return [];
}

export default function FormRendererStep({ formId, prefillData, onContinue }: FormRendererStepProps) {
  const [schema, setSchema] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setSchema(null);
    setError(null);

    fetchFormSchema(formId)
      .then(s => { if (!cancelled) setSchema(s); })
      .catch(e => { if (!cancelled) setError((e as Error).message); });

    return () => { cancelled = true; };
  }, [formId]);

  const handleSubmit = (payload: Record<string, unknown>) => {
    const tableFieldIds = new Set<string>();
    const fileFieldIds = new Set<string>();

    if (schema && typeof schema === 'object' && 'sections' in (schema as object)) {
      const s = schema as { sections: { fields: { id: string; type: string }[] }[] };
      for (const section of s.sections) {
        for (const field of section.fields) {
          if (field.type === 'table') tableFieldIds.add(field.id);
          if (field.type === 'file') fileFieldIds.add(field.id);
        }
      }
    }

    const filledData: Record<string, unknown> = { __formBuilderId: formId };
    const tableData: Record<string, unknown[]> = {};
    const fileData: Record<string, unknown[]> = {};

    for (const [key, value] of Object.entries(payload)) {
      if (tableFieldIds.has(key) && Array.isArray(value)) {
        tableData[key] = value;
      } else if (fileFieldIds.has(key) && value != null) {
        fileData[key] = toFileAttachments(key, value);
      } else {
        filledData[key] = value;
      }
    }

    onContinue(filledData, tableData, fileData);
  };

  // Build initial values from applicationData prefill
  const initialValues: Record<string, unknown> = {};
  if (prefillData) {
    const pd = prefillData as unknown as Record<string, unknown>;
    Object.keys(pd).forEach(k => { initialValues[k] = pd[k]; });
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', color: '#b91c1c', fontSize: '0.875rem' }}>
        Failed to load form: {error}
      </div>
    );
  }

  if (!schema) {
    return (
      <div style={{ padding: '2rem', color: '#6b7280', fontSize: '0.875rem' }}>
        Loading form…
      </div>
    );
  }

  return (
    <FormRenderer
      schema={schema}
      initialValues={initialValues}
      onSubmit={handleSubmit}
    />
  );
}
