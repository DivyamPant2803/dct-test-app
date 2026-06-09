import { create } from 'zustand';
import { ConfigJson } from '../../../shared/types';

interface DraftStoreState {
  draftId: number | null;
  workingConfig: ConfigJson | null;
  title: string | null;
  etag: string | null;
  isDirty: boolean;
  isSaving: boolean;
  saveError: string | null;
  lastSavedAt: Date | null;
}

interface DraftStoreActions {
  initDraft: (id: number, config: ConfigJson, title: string | null, etag: string) => void;
  updateConfig: (config: ConfigJson) => void;
  updateTitle: (title: string) => void;
  setSaving: (saving: boolean) => void;
  confirmSaved: (etag: string) => void;
  setSaveError: (error: string | null) => void;
  clearDraft: () => void;
}

export type DraftStore = DraftStoreState & DraftStoreActions;

export const useDraftStore = create<DraftStore>((set) => ({
  draftId: null,
  workingConfig: null,
  title: null,
  etag: null,
  isDirty: false,
  isSaving: false,
  saveError: null,
  lastSavedAt: null,

  initDraft: (id, config, title, etag) =>
    set({
      draftId: id,
      workingConfig: config,
      title,
      etag,
      isDirty: false,
      isSaving: false,
      saveError: null,
    }),

  updateConfig: (config) =>
    set({ workingConfig: config, isDirty: true, saveError: null }),

  updateTitle: (title) =>
    set({ title, isDirty: true }),

  setSaving: (saving) => set({ isSaving: saving }),

  confirmSaved: (etag) =>
    set({ etag, isDirty: false, isSaving: false, lastSavedAt: new Date(), saveError: null }),

  setSaveError: (error) =>
    set({ isSaving: false, saveError: error }),

  clearDraft: () =>
    set({
      draftId: null,
      workingConfig: null,
      title: null,
      etag: null,
      isDirty: false,
      isSaving: false,
      saveError: null,
      lastSavedAt: null,
    }),
}));
