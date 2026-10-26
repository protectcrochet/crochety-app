import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.[jt]sx?$/,
    exclude: []
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: { '.js': 'jsx' }
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/uploads': { target: 'http://localhost:3100', changeOrigin: true },
      '/api': {
        target: 'http://localhost:3100',
        changeOrigin: true
      }
    }
  }
})