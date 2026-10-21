import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The shared catalogue/pricing package is linked from ../shared (see package.json).
const shared = fileURLToPath(new URL('../shared', import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    fs: { allow: ['.', shared] },
    // In development the API runs separately (npm run dev in backend/).
    proxy: { '/api': 'http://localhost:8787' },
  },
})
