import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/test/**',
        'src/app/**/layout.tsx',
        'src/app/**/page.tsx',
        'src/proxy.ts',
        'src/i18n/request.ts',
        'src/**/*.d.ts'
      ],
      reporter: [
        'text',
        'html',
        [
          'lcov',
          { projectRoot: fileURLToPath(new URL('..', import.meta.url)) }
        ],
        'json-summary'
      ],
      thresholds: {
        lines: 80,
        statements: 80,
        functions: 80,
        branches: 80
      }
    }
  }
})
