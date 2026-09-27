/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.ts'],
  },
  plugins: [tailwindcss(), react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        secure: false,
      },
      '/health': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
      '/connections': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
      '/stats': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
      '/chaos': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      }
    }
  }
})
