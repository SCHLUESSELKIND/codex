import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/*
  Ports:
    5173 = Entwicklung (npm run dev)
    4830 = Sendebetrieb (npm run preview), eigener Port nur für diese Show,
           damit keine andere lokale Vorschau ihn belegen kann.

  strictPort ist bei beiden Pflicht. Weicht der Server still auf einen
  anderen Port aus, zeigen die OBS-Quellen mitten in der Sendung nichts mehr.
  Lieber ein klarer Fehler beim Start als ein schwarzes Overlay um 19:00 Uhr.

  base './' erlaubt zusätzlich statisches Hosting aus dist/ ohne Serverkonfiguration.
*/
export default defineConfig({
  plugins: [react()],
  base: './',
  server: { port: 5173, strictPort: true },
  preview: { port: 4830, strictPort: true },
})
