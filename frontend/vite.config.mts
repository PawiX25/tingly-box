import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        // Rewrite the path to remove /api prefix if your backend doesn't expect it
        // rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
