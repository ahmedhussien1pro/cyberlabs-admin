import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    // Limit workers to prevent OOM crashes with many heavy React test files.
    // 2 workers is safe on most dev machines; bump to 3-4 on CI with >8GB RAM.
    maxWorkers: 2,
    minWorkers: 1,
    poolOptions: {
      forks: {
        // Give each worker enough V8 heap for jsdom + React + TanStack Query
        execArgv: ['--max-old-space-size=1024'],
      },
    },
    setupFiles: [
      './src/test/setup.ts',
      './src/test/setup.tsx',
    ],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/features/**'],
      exclude: ['src/features/**/*.stories.*', 'src/features/**/__tests__/**'],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
