import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const { VITE_API_URL } = loadEnv(mode, process.cwd(), 'VITE_');

  return {
    plugins: [react()],
    server: {
      proxy: VITE_API_URL
        ? {
            '/api': {
              target: VITE_API_URL,
              changeOrigin: true,
            },
          }
        : undefined,
    },
  };
});
