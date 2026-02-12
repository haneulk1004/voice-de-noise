import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  build: {
    target: 'es2015',
    outDir: 'dist',
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['noise-repellent-m.js', 'noise-repellent-m.wasm', 'vite.svg'],
      manifest: {
        name: 'Voice De-noise',
        short_name: 'De-noise',
        description: 'Real-time Voice De-noise Web App',
        theme_color: '#242424',
        icons: [
          {
            src: 'vite.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,wasm}']
      }
    })
  ],
  server: {
    host: true
  }
});
