import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import pkg from './package.json' with { type: 'json' }

export default defineConfig({
  plugins: [react()],
  // One source of truth for the version: package.json. Settings used to
  // carry its own copy, and the two had already drifted apart.
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __APP_BUILD__: JSON.stringify(String(pkg.buildNumber ?? '')),
  },
  server: {
    proxy: {
      '/geocode': {
        target: 'https://geocoding.geo.census.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/geocode/, '/geocoder'),
      },
    },
  },
})