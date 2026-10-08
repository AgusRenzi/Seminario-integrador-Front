import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // El backend no tiene CORS: todo lo que empieza con /api se reenvía a Express.
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
