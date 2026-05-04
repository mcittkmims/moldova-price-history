/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PRICE_HISTORY_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
