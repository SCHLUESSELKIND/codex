/*
  Holt einen Screenshot einer Szene direkt aus dem laufenden OBS.
  Damit lässt sich prüfen, was tatsächlich im Programm ankommt,
  ohne die Vorschau abfilmen zu müssen.

    node scripts/obs-shot.mjs "01 Standby"
    node scripts/obs-shot.mjs "03 Build" --out=/pfad/bild.png
*/

import { readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { createHash } from 'node:crypto'
import { WebSocket } from 'ws'

const positional = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const flags = Object.fromEntries(
  process.argv
    .slice(2)
    .filter((a) => a.startsWith('--'))
    .map((a) => {
      const [k, v] = a.replace(/^--/, '').split('=')
      return [k, v ?? true]
    }),
)

const SCENE = positional[0] ?? '01 Standby'
const OUT = flags.out ?? `obs-${SCENE.replace(/[^\w]+/g, '-').toLowerCase()}.png`

const CONFIG_PATH = `${homedir()}/Library/Application Support/obs-studio/plugin_config/obs-websocket/config.json`

let socket
let nextId = 1
const pending = new Map()

function send(type, data) {
  return new Promise((resolve, reject) => {
    const id = String(nextId++)
    pending.set(id, { resolve, reject })
    socket.send(JSON.stringify({ op: 6, d: { requestType: type, requestId: id, requestData: data } }))
  })
}

const cfg = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'))
socket = new WebSocket(`ws://127.0.0.1:${cfg.server_port ?? 4455}`)

await new Promise((resolve, reject) => {
  socket.on('error', reject)
  socket.on('message', (raw) => {
    const msg = JSON.parse(raw.toString())
    if (msg.op === 0) {
      const auth = msg.d.authentication
      const identify = { rpcVersion: 1 }
      if (auth) {
        const secret = createHash('sha256')
          .update((cfg.server_password ?? '') + auth.salt)
          .digest('base64')
        identify.authentication = createHash('sha256').update(secret + auth.challenge).digest('base64')
      }
      socket.send(JSON.stringify({ op: 1, d: identify }))
    } else if (msg.op === 2) {
      resolve()
    } else if (msg.op === 7) {
      const entry = pending.get(msg.d.requestId)
      if (!entry) return
      pending.delete(msg.d.requestId)
      if (msg.d.requestStatus.result) entry.resolve(msg.d.responseData ?? {})
      else entry.reject(new Error(msg.d.requestStatus.comment ?? msg.d.requestStatus.code))
    }
  })
})

const { imageData } = await send('GetSourceScreenshot', {
  sourceName: SCENE,
  imageFormat: 'png',
  imageWidth: 1920,
  imageHeight: 1080,
})

writeFileSync(OUT, Buffer.from(imageData.split(',')[1], 'base64'))
console.log(`${SCENE} → ${OUT}`)
socket.close()
