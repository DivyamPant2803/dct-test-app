/// <reference types="vite/client" />

declare module '@form-builder/renderer/styles';

interface ImportMetaEnv {
  readonly VITE_USE_FORM_RENDERER: string;
  readonly VITE_FORM_BUILDER_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
