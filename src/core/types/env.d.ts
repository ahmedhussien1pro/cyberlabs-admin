/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_API_TIMEOUT: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_URL: string
  readonly VITE_STORAGE_PREFIX: string
  readonly VITE_ENCRYPTION_KEY: string
  readonly VITE_ENABLE_DEVTOOLS: string
  readonly VITE_ENABLE_MOCK_API: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
