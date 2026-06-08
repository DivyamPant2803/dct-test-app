import { MERType } from '../../types/index';
import { ControlMetadata } from '../../services/controlService';

const ALL_MER_TYPES: MERType[] = ['MER-13', 'MER-14'];

/**
 * MER types allowed for the intersection of selected MER controls.
 * A control with `merType` set only permits that type; others allow the full catalog.
 */
export function getAllowedMerTypesForControls(controls: ControlMetadata[]): MERType[] {
  const merOnly = controls.filter(c => c.controlType === 'MER');
  if (merOnly.length === 0) return [];

  return merOnly.reduce<MERType[]>((acc, c) => {
    const allowed = c.merType ? [c.merType] : [...ALL_MER_TYPES];
    if (acc.length === 0) return allowed;
    return acc.filter(t => allowed.includes(t));
  }, []);
}

const RECENT_KEY = 'mer_recent_control_ids';
const RECENT_MAX = 8;

export function readRecentControlIds(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export function rememberControlUsage(controlIds: string[]): void {
  if (controlIds.length === 0) return;
  const prev = readRecentControlIds();
  const merged = [...controlIds.filter(Boolean), ...prev.filter(id => !controlIds.includes(id))];
  const next = merged.slice(0, RECENT_MAX);
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota */
  }
}
