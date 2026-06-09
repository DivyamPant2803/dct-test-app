/// <reference types="vite/client" />

declare module '@form-builder/renderer/styles';

interface ImportMetaEnv {
  readonly VITE_USE_FORM_RENDERER: string;
  readonly VITE_FORM_BUILDER_API_URL: string;
  // Central Inventory Homepage Module
  readonly VITE_USE_MOCK_API: string;
  readonly VITE_DEV_USER: string;
  readonly VITE_DEV_ROLES: string;
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
