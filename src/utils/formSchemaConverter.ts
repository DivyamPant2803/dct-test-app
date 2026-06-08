import type { TemplateSection, TemplateField } from '../types/index';

// Minimal inline types matching @form-builder/types — avoids deep import coupling
interface FormSchemaField {
  id: string;
  type: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  width?: string;
  options?: { label: string; value: string }[];
  multiple?: boolean;
  accept?: string[];
  maxSizeMB?: number;
  columns?: { key: string; label: string }[];
  allowAdd?: boolean;
  allowDelete?: boolean;
}

interface FormSchemaSection {
  id: string;
  title: string;
  description?: string;
  fields: FormSchemaField[];
}

interface FormSchemaLike {
  sections: FormSchemaSection[];
}

export function convertFormSchemaToTemplateSections(schema: unknown): TemplateSection[] {
  const s = schema as FormSchemaLike;
  if (!s?.sections) return [];

  return s.sections.map((section, sectionIdx) => ({
    id: section.id,
    title: section.title,
    description: section.description,
    order: sectionIdx,
    collapsible: true,
    defaultCollapsed: false,
    fields: section.fields
      .filter(f => f.type !== 'heading')
      .map((f, fieldIdx) => convertField(f, fieldIdx)),
  }));
}

function convertField(f: FormSchemaField, order: number): TemplateField {
  const base = {
    id: f.id,
    label: f.label,
    required: f.required ?? false,
    order,
    helpText: f.helpText,
    placeholder: f.placeholder,
    width: (f.width as TemplateField['width']) ?? 'full',
  };

  switch (f.type) {
    case 'text':
      return { ...base, type: 'text' };
    case 'textarea':
      return { ...base, type: 'textarea' };
    case 'checkbox':
      return { ...base, type: 'checkbox' };
    case 'date':
      return { ...base, type: 'date' };
    case 'radio':
    case 'checkbox-group':
      return {
        ...base,
        type: 'radio-group',
        options: (f.options ?? []).map(o => o.label),
      };
    case 'dropdown':
      return {
        ...base,
        type: 'select',
        options: (f.options ?? []).map(o => o.label),
      };
    case 'file':
      return {
        ...base,
        type: f.multiple ? 'file-multiple' : 'file',
        fileConfig: {
          accept: f.accept ?? [],
          maxSizeMB: f.maxSizeMB ?? 10,
          multiple: f.multiple ?? false,
        },
      };
    case 'table':
      return {
        ...base,
        type: 'table',
        tableConfig: {
          // Use column.key as col.id so TemplateDataDisplay reads row[col.key] correctly
          columns: (f.columns ?? []).map(col => ({
            id: col.key,
            label: col.label,
            type: 'text' as const,
            required: false,
          })),
          minRows: 1,
          allowAddRows: f.allowAdd ?? false,
          allowDeleteRows: f.allowDelete ?? false,
        },
      };
    default:
      return { ...base, type: 'text' };
  }
}
