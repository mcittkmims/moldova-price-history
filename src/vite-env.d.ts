/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PRICE_HISTORY_API_URL?: string;
  readonly VITE_IMAGE_PROXY_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
