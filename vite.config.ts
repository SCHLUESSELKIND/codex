import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// OBS Browser Source läuft gegen http://localhost:5173 (dev) oder 4173 (preview).
// base './' erlaubt zusätzlich statisches Hosting aus dist/ ohne Serverkonfiguration.
export default defineConfig({
  plugins: [react()],
  base: './',
  server: { port: 5173, strictPort: true },
})
