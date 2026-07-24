import type { Plugin, ViteDevServer, PreviewServer } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

/*
  Sendezustand über Prozessgrenzen hinweg.

  Warum das nötig ist: BroadcastChannel und localStorage gelten pro
  Browser-Instanz, nicht pro Adresse. OBS bringt ein eigenes Chromium mit
  eigenem Speicher. Ein Regie-Panel in Safari oder Chrome erreicht die
  OBS-Quellen damit NIE. Dieser Relay ist der gemeinsame Nenner, den alle
  Beteiligten erreichen: der Server, der die Seiten ohnehin ausliefert.

  Damit ist es egal, wo die Regie läuft. Zweiter Bildschirm, anderer Browser,
  bei --host sogar Tablet oder Handy im selben Netz.

    GET  /api/state   → aktueller Zustand oder null
    POST /api/state   → Zustand setzen, an alle Hörer verteilen
    GET  /api/events  → Server-Sent-Events-Strom

  Der Zustand liegt zusätzlich in .bop-state.json. Stürzt der Server mitten
  in der Sendung ab und wird neu gestartet, kommt er mit demselben Stand
  zurück, statt alle Overlays auf Folge 001 zurückzuwerfen.
*/

const STATE_FILE = '.bop-state.json'
const HEARTBEAT_MS = 25_000

interface Listener {
  id: number
  res: ServerResponse
}

function createRelay(root: string) {
  const file = resolve(root, STATE_FILE)
  let state: unknown = null
  let nextId = 1
  const listeners = new Set<Listener>()

  if (existsSync(file)) {
    try {
      state = JSON.parse(readFileSync(file, 'utf8'))
    } catch {
      // Beschädigte Datei ist kein Grund, den Start zu verhindern.
      state = null
    }
  }

  function persist() {
    try {
      writeFileSync(file, JSON.stringify(state))
    } catch {
      // Sendung läuft weiter, auch wenn die Platte nicht schreibbar ist.
    }
  }

  function broadcast() {
    const payload = `data: ${JSON.stringify(state)}\n\n`
    for (const listener of listeners) {
      try {
        listener.res.write(payload)
      } catch {
        listeners.delete(listener)
      }
    }
  }

  function readBody(req: IncomingMessage): Promise<string> {
    return new Promise((resolveBody, reject) => {
      let raw = ''
      req.on('data', (chunk) => {
        raw += chunk
        // 512 kB reichen für jeden Sendezustand um ein Vielfaches.
        if (raw.length > 512_000) reject(new Error('zu groß'))
      })
      req.on('end', () => resolveBody(raw))
      req.on('error', reject)
    })
  }

  return async function middleware(
    req: IncomingMessage,
    res: ServerResponse,
    next: () => void,
  ) {
    const url = req.url?.split('?')[0]
    if (!url?.startsWith('/api/')) return next()

    if (url === '/api/state' && req.method === 'GET') {
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Cache-Control', 'no-store')
      res.end(JSON.stringify(state))
      return
    }

    if (url === '/api/state' && req.method === 'POST') {
      try {
        const raw = await readBody(req)
        state = JSON.parse(raw)
        persist()
        broadcast()
        res.setHeader('Content-Type', 'application/json')
        res.end('{"ok":true}')
      } catch {
        res.statusCode = 400
        res.end('{"ok":false}')
      }
      return
    }

    if (url === '/api/events' && req.method === 'GET') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-store',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      })

      const listener: Listener = { id: nextId++, res }
      listeners.add(listener)

      // Sofort den aktuellen Stand schicken, damit eine frisch geladene
      // OBS-Quelle nicht bis zur nächsten Änderung im Defaultzustand steht.
      res.write(`data: ${JSON.stringify(state)}\n\n`)

      // Kommentarzeilen halten die Verbindung offen, wenn lange nichts passiert.
      const beat = setInterval(() => {
        try {
          res.write(': beat\n\n')
        } catch {
          clearInterval(beat)
          listeners.delete(listener)
        }
      }, HEARTBEAT_MS)

      req.on('close', () => {
        clearInterval(beat)
        listeners.delete(listener)
      })
      return
    }

    next()
  }
}

export function stateRelay(): Plugin {
  return {
    name: 'bop-state-relay',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(createRelay(server.config.root))
    },
    configurePreviewServer(server: PreviewServer) {
      server.middlewares.use(createRelay(server.config.root))
    },
  }
}
