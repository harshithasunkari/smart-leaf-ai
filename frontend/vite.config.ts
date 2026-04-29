import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const apiTarget = env.VITE_API_URL || 'http://localhost:8000';

  return {
    plugins: [react()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    css: {
      postcss: './postcss.config.js',
    },
    server: {
      port: 5173,
      hmr: true,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
        '/predict-single': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
        '/predict-multiple': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
        '/recommendation': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
        '/history': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
        '/health': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});