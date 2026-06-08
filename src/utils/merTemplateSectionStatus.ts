import type {
  FileAttachment,
  TemplateField,
  UploadedTemplate,
  TableColumn,
} from '../types/index';

export type MerSectionStatus = 'complete' | 'in_progress' | 'error' | 'not_started';

function shouldShowField(field: TemplateField, formData: Record<string, unknown>): boolean {
  if (!field.condition) return true;
  const dependsOnValue = formData[field.condition.dependsOn];
  const showWhen = field.condition.showWhen;
  if (Array.isArray(showWhen)) {
    return showWhen.includes(dependsOnValue as string);
  }
  return dependsOnValue === showWhen;
}

function isEmptyVal(v: unknown): boolean {
  if (v === undefined || v === null) return true;
  if (typeof v === 'string') return v.trim() === '';
  if (Array.isArray(v)) return v.length === 0;
  return false;
}

function fieldSatisfied(
  field: TemplateField,
  formData: Record<string, unknown>,
  tableData: Record<string, unknown[]>,
  fileData: Record<string, FileAttachment[]>
): boolean {
  if (field.type === 'table' && field.tableConfig) {
    const rows = tableData[field.id] || [];
    const requiredCols = field.tableConfig.columns.filter((c: TableColumn) => c.required);
    if (rows.length === 0) return requiredCols.length === 0;
    return rows.every(row => {
      const r = row as Record<string, unknown>;
      return requiredCols.every(col => !isEmptyVal(r[col.id]));
    });
  }
  if (field.type === 'file' || field.type === 'file-multiple') {
    const files = fileData[field.id] || [];
    return !field.required || files.length > 0;
  }
  return !field.required || !isEmptyVal(formData[field.id]);
}

/**
 * Aggregates per-section completion for MER template dynamic forms.
 */
export function computeMerSectionStatuses(
  template: UploadedTemplate | null,
  formData: Record<string, unknown>,
  tableData: Record<string, unknown[]>,
  fileData: Record<string, FileAttachment[]>,
  options?: { markErrors?: boolean }
): Record<string, MerSectionStatus> {
  const out: Record<string, MerSectionStatus> = {};
  if (!template?.sections?.length) return out;

  const markErrors = options?.markErrors ?? false;

  for (const section of template.sections) {
    const visibleFields = section.fields.filter((f: TemplateField) => shouldShowField(f, formData));
    const required = visibleFields.filter((f: TemplateField) => f.required);
    if (required.length === 0) {
      out[section.id] = 'complete';
      continue;
    }

    let filled = 0;
    let anyTouched = false;
    for (const f of required) {
      const ok = fieldSatisfied(f, formData, tableData, fileData);
      if (ok) filled++;
      const raw =
        f.type === 'table'
          ? tableData[f.id]
          : f.type === 'file' || f.type === 'file-multiple'
            ? fileData[f.id]
            : formData[f.id];
      if (!isEmptyVal(raw)) anyTouched = true;
    }

    const allOk = filled === required.length;
    if (allOk) {
      out[section.id] = 'complete';
    } else if (markErrors && anyTouched) {
      out[section.id] = 'error';
    } else if (anyTouched || filled > 0) {
      out[section.id] = 'in_progress';
    } else {
      out[section.id] = 'not_started';
    }
  }

  return out;
}

export function mergeSectionStatusesWithErrors(
  base: Record<string, MerSectionStatus>,
  errorSectionIds: Set<string>
): Record<string, MerSectionStatus> {
  const next = { ...base };
  errorSectionIds.forEach(id => {
    next[id] = 'error';
  });
  return next;
}
