import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // This is the crucial proxy setup
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Redirects all /api requests to the backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
