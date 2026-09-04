import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  root: '.',
  // GitHub Pages 프로젝트 사이트 하위 경로 배포(TRD §6.4). import.meta.env.BASE_URL로
  // 코드에서 참조하며(assets.ts), index.html의 아이콘 링크는 `./` 상대 경로로 따로 맞춘다.
  base: '/persora/',
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
