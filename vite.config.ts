import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
    // tsconfigPaths は Sass の @use には効かないため、Sass 用に @/ を設定する
    alias: { '@/': fileURLToPath(new URL('./src/', import.meta.url)) },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    // vi.spyOn で差し替えた window.confirm などを、テストごとに元へ戻す
    restoreMocks: true,
  },
})
