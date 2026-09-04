import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  root: '.',
  base: '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2020',
  },
  server: {
    host: '0.0.0.0',
    port: 4121,
    strictPort: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 8000,
  },
  test: {
    // 이 프로젝트의 순수 모듈 단위 테스트만 대상으로 한다(TRD §9.2).
    include: ['src/**/*.test.ts'],
  },
});
