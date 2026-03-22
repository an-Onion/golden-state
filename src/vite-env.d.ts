/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOLD_API_KEY: string
  readonly VITE_GOLD_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
