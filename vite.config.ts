import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    allowedHosts: true,
    proxy: {
      '/api/sepay-proxy': {
        target: 'https://userapi.sepay.vn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/sepay-proxy/, ''),
      },
    },
  },
});
