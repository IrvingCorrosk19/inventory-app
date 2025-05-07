import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    open: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://inventory-app-backend-jzkd.onrender.com',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
