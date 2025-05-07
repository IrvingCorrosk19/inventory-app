import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    open: true, // ✅ Esto abrirá el navegador automáticamente
    port: 5173  // (opcional) puedes cambiar el puerto si es necesario
  }
})
