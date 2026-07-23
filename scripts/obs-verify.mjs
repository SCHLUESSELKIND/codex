/*
  Prüft, ob die Overlay-Browserquellen in OBS tatsächlich rendern.

  OBS zeichnet eine Quelle nur, während sie in der aktiven Szene liegt.
  Der Test schaltet deshalb kurz durch die reinen Kartenszenen. Diese
  enthalten ausschließlich das Overlay, keinen Bildschirm-Capture und keine
  Kamera, es kann also kein geteilter Bildschirminhalt im Bild landen.

  Läuft Stream oder Aufnahme, bricht der Test ab und schaltet nichts um.
  Am Ende wird die ursprüngliche Szene wiederhergestellt.

    node scripts/obs-verify.mjs --out=/pfad/ordner
*/

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { createHash } from 'node:crypto'
import { WebSocket } from 'ws'

const flags = Object.fromEntries(
  process.argv
    .slice(2)
    .filter((a) => a.startsWith('--'))
    .map((a) => {
      const [k, v] = a.replace(/^--/, '').split('=')
      return [k, v ?? true]
    }),
)

const OUT_DIR = flags.out ?? 'obs-check'

// Nur Szenen ohne Kamera und ohne Bildschirmfreigabe
const SAFE_SCENES = [
  '01 Standby',
  '05 Themenkarte',
  '06 Kernaussage',
  '07 Pause',
  '08 Ende',
  '09 Technischer Check',
]

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

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

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
    } else if (msg.op === 2) resolve()
    else if (msg.op === 7) {
      const entry = pending.get(msg.d.requestId)
      if (!entry) return
      pending.delete(msg.d.requestId)
      if (msg.d.requestStatus.result) entry.resolve(msg.d.responseData ?? {})
      else entry.reject(new Error(msg.d.requestStatus.comment ?? msg.d.requestStatus.code))
    }
  })
})

const stream = await send('GetStreamStatus', {})
const record = await send('GetRecordStatus', {})
if (stream.outputActive || record.outputActive) {
  console.error('Stream oder Aufnahme läuft. Es wird nichts umgeschaltet.')
  socket.close()
  process.exit(1)
}

const { currentProgramSceneName: original } = await send('GetCurrentProgramScene', {})
const { scenes } = await send('GetSceneList', {})
const vorhanden = scenes.map((s) => s.sceneName)

mkdirSync(OUT_DIR, { recursive: true })
let ok = 0
let geprueft = 0

for (const scene of SAFE_SCENES) {
  if (!vorhanden.includes(scene)) {
    console.log(`  ?    "${scene}" existiert nicht`)
    continue
  }
  geprueft += 1
  try {
    await send('SetCurrentProgramScene', { sceneName: scene })
    await sleep(2600) // Laden, Schriften, Reveal-Animation

    const { imageData } = await send('GetSourceScreenshot', {
      sourceName: scene,
      imageFormat: 'png',
      imageWidth: 1920,
      imageHeight: 1080,
    })
    const buffer = Buffer.from(imageData.split(',')[1], 'base64')
    writeFileSync(`${OUT_DIR}/${scene.replace(/[^\w]+/g, '-').toLowerCase()}.png`, buffer)

    const kb = Math.round(buffer.length / 1024)
    const gerendert = kb > 12
    console.log(`  ${gerendert ? 'ok  ' : 'LEER'} ${scene}  (${kb} kB)`)
    if (gerendert) ok += 1
  } catch (error) {
    console.log(`  FEHL ${scene}: ${error.message}`)
  }
}

await send('SetCurrentProgramScene', { sceneName: original })
console.log(`\n${ok} von ${geprueft} Szenen rendern in OBS. Zurück auf "${original}".`)
socket.close()
