export const ENV = {
  API_URL: import.meta.env.VITE_API_URL,
  API_TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT),
  APP_NAME: import.meta.env.VITE_APP_NAME,
  APP_URL: import.meta.env.VITE_APP_URL,
  STORAGE_PREFIX: import.meta.env.VITE_STORAGE_PREFIX,
  ENCRYPTION_KEY: import.meta.env.VITE_ENCRYPTION_KEY,
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
  ENABLE_DEVTOOLS: import.meta.env.VITE_ENABLE_DEVTOOLS === 'true',
  ENABLE_MOCK_API: import.meta.env.VITE_ENABLE_MOCK_API === 'true',
  NODE_ENV: import.meta.env.MODE,

  LABS_URL: import.meta.env.VITE_LABS_URL as string,
} as const;
