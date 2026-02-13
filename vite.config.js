import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// For GitHub Pages, base should be the repository name
// For Electron, it works best with './' or the full path if possible. 
// However, since we are prioritizing the web link now, let's fix it for GitHub Pages.
export default defineConfig({
  base: '/voice-de-noise/', // MUST match repository name
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
