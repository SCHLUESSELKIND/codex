/*
  Richtet BUILD ON PURPOSE direkt in einem laufenden OBS ein (obs-websocket v5).

  Grundsatz: Es wird ausschließlich ERGÄNZT. Bestehende Szenen und Quellen
  werden nie gelöscht oder umbenannt. Existiert eine Quelle mit gleichem Namen
  bereits, wird nur ihre URL aktualisiert.

  Aufruf:
    node scripts/obs-setup.mjs                  → gegen http://localhost:5173
    node scripts/obs-setup.mjs --base=http://localhost:4173
    node scripts/obs-setup.mjs --dry            → nur zeigen, nichts ändern

  Das Passwort wird aus der lokalen OBS-Konfiguration gelesen:
  ~/Library/Application Support/obs-studio/plugin_config/obs-websocket/config.json
*/

import { readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { createHash } from 'node:crypto'
import { WebSocket } from 'ws'

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=')
    return [k, v ?? true]
  }),
)

const BASE = args.base ?? 'http://localhost:5173'
const DRY = Boolean(args.dry)
const STAGE_W = 1920
const STAGE_H = 1080

// Kamera-PiP in der Build-Szene, passend zu den Eckmarken im Overlay
const PIP = { w: 480, h: 270, x: 1344, y: 714 }

const CONFIG_PATH = `${homedir()}/Library/Application Support/obs-studio/plugin_config/obs-websocket/config.json`

/*
  Die Overlays, die in BESTEHENDE Szenen ergänzt werden.
  Sie liegen immer ganz oben, damit Kamera und Bildschirm darunter sichtbar bleiben.
*/
const OVERLAYS = [
  { scene: '01 Standby', source: 'BOP Overlay · Standby', route: '/standby' },
  { scene: '02 Kamera', source: 'BOP Overlay · Kamera', route: '/camera' },
  { scene: '03 Build', source: 'BOP Overlay · Build', route: '/build' },
  { scene: '04 Nur Screen', source: 'BOP Overlay · Screen', route: '/screen' },
]

/*
  Vollbildkarten als neue Szenen, in der bestehenden Nummerierung weitergezählt.
  refreshOnActive: bei jedem Einblenden neu laden, damit die Reveal-Animation läuft.
  Bei Pause bewusst aus, sonst startet der Countdown bei jedem Wechsel neu.
*/
const CARDS = [
  { scene: '05 Themenkarte', source: 'BOP Karte · Thema', route: '/topic', refresh: true },
  { scene: '06 Kernaussage', source: 'BOP Karte · Kernaussage', route: '/statement', refresh: true },
  { scene: '07 Pause', source: 'BOP Karte · Pause', route: '/break', refresh: false },
  { scene: '08 Ende', source: 'BOP Karte · Ende', route: '/end', refresh: true },
  { scene: '09 Technischer Check', source: 'BOP Karte · Technik', route: '/technical', refresh: true },
]

// Bauchbinde als eigene Quelle, die über jede Szene gelegt werden kann
const LOWER_THIRD = { source: 'BOP Overlay · Bauchbinde', route: '/lower-third' }

function browserSettings(route, refresh = true) {
  return {
    url: `${BASE}/#${route}`,
    width: STAGE_W,
    height: STAGE_H,
    fps_custom: false,
    reroute_audio: false,
    restart_when_active: refresh,
    shutdown: true, // Quelle beim Nichtanzeigen deaktivieren, spart CPU
    webpage_control_level: 1,
  }
}

// ---------- obs-websocket v5 ----------

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

async function connect() {
  const cfg = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'))
  if (!cfg.server_enabled) {
    throw new Error('obs-websocket ist in OBS deaktiviert (Werkzeuge → WebSocket-Servereinstellungen).')
  }
  const port = cfg.server_port ?? 4455
  const password = cfg.server_password ?? ''

  socket = new WebSocket(`ws://127.0.0.1:${port}`)

  await new Promise((resolve, reject) => {
    socket.on('error', reject)
    socket.on('message', (raw) => {
      const msg = JSON.parse(raw.toString())

      if (msg.op === 0) {
        const auth = msg.d.authentication
        let identify = { rpcVersion: 1 }
        if (auth) {
          const secret = createHash('sha256')
            .update(password + auth.salt)
            .digest('base64')
          identify.authentication = createHash('sha256')
            .update(secret + auth.challenge)
            .digest('base64')
        }
        socket.send(JSON.stringify({ op: 1, d: identify }))
        return
      }

      if (msg.op === 2) {
        resolve()
        return
      }

      if (msg.op === 7) {
        const entry = pending.get(msg.d.requestId)
        if (!entry) return
        pending.delete(msg.d.requestId)
        if (msg.d.requestStatus.result) entry.resolve(msg.d.responseData ?? {})
        else entry.reject(new Error(`${msg.d.requestType}: ${msg.d.requestStatus.comment ?? msg.d.requestStatus.code}`))
      }
    })
  })
}

// ---------- Einrichtung ----------

async function ensureScene(name, existingScenes) {
  if (existingScenes.includes(name)) {
    console.log(`  · Szene "${name}" existiert bereits, bleibt unverändert`)
    return false
  }
  if (DRY) {
    console.log(`  + Szene "${name}" würde angelegt`)
    return true
  }
  await send('CreateScene', { sceneName: name })
  console.log(`  + Szene "${name}" angelegt`)
  return true
}

async function ensureBrowserSource(sceneName, sourceName, route, refresh, existingInputs) {
  const settings = browserSettings(route, refresh)

  if (existingInputs.includes(sourceName)) {
    if (DRY) {
      console.log(`  ~ "${sourceName}" würde auf ${settings.url} aktualisiert`)
    } else {
      await send('SetInputSettings', { inputName: sourceName, inputSettings: settings, overlay: true })
      console.log(`  ~ "${sourceName}" auf ${settings.url} aktualisiert`)
    }
  } else if (DRY) {
    console.log(`  + "${sourceName}" würde in "${sceneName}" angelegt (${settings.url})`)
    return
  } else {
    await send('CreateInput', {
      sceneName,
      inputName: sourceName,
      inputKind: 'browser_source',
      inputSettings: settings,
      sceneItemEnabled: true,
    })
    console.log(`  + "${sourceName}" in "${sceneName}" angelegt`)
    return
  }

  // Quelle existiert: sicherstellen, dass sie auch in dieser Szene liegt
  if (DRY) return
  const { sceneItems } = await send('GetSceneItemList', { sceneName })
  if (!sceneItems.some((i) => i.sourceName === sourceName)) {
    await send('CreateSceneItem', { sceneName, sourceName, sceneItemEnabled: true })
    console.log(`  + "${sourceName}" zusätzlich in "${sceneName}" eingefügt`)
  }
}

async function raiseToTop(sceneName, sourceName) {
  const { sceneItems } = await send('GetSceneItemList', { sceneName })
  const item = sceneItems.find((i) => i.sourceName === sourceName)
  if (!item) return
  const topIndex = sceneItems.length - 1
  if (item.sceneItemIndex !== topIndex) {
    await send('SetSceneItemIndex', {
      sceneName,
      sceneItemId: item.sceneItemId,
      sceneItemIndex: topIndex,
    })
    console.log(`  ↑ "${sourceName}" in "${sceneName}" nach oben gelegt`)
  }
}

async function placeCameraPip(sceneName) {
  const { sceneItems } = await send('GetSceneItemList', { sceneName })
  const cam = sceneItems.find((i) => /kamera|camera|zv-1/i.test(i.sourceName))
  if (!cam) {
    console.log(`  ! keine Kameraquelle in "${sceneName}" gefunden, PiP nicht gesetzt`)
    return
  }

  const { sceneItemTransform: t } = await send('GetSceneItemTransform', {
    sceneName,
    sceneItemId: cam.sceneItemId,
  })
  const srcW = t.sourceWidth || 1920
  const srcH = t.sourceHeight || 1080

  await send('SetSceneItemTransform', {
    sceneName,
    sceneItemId: cam.sceneItemId,
    sceneItemTransform: {
      positionX: PIP.x,
      positionY: PIP.y,
      scaleX: PIP.w / srcW,
      scaleY: PIP.h / srcH,
      boundsType: 'OBS_BOUNDS_SCALE_INNER',
      boundsWidth: PIP.w,
      boundsHeight: PIP.h,
      alignment: 5, // oben links
    },
  })
  console.log(`  ▣ "${cam.sourceName}" als PiP gesetzt (${PIP.w}×${PIP.h} @ ${PIP.x},${PIP.y})`)
}

async function main() {
  console.log(`BUILD ON PURPOSE → OBS${DRY ? '  (Probelauf, es wird nichts geändert)' : ''}`)
  console.log(`Basis: ${BASE}\n`)

  await connect()
  const { obsVersion } = await send('GetVersion', {})
  console.log(`Verbunden mit OBS ${obsVersion}\n`)

  const { scenes } = await send('GetSceneList', {})
  const sceneNames = scenes.map((s) => s.sceneName)
  const { inputs } = await send('GetInputList', {})
  const inputNames = inputs.map((i) => i.inputName)

  console.log('Overlays in bestehende Szenen ergänzen:')
  for (const o of OVERLAYS) {
    if (!sceneNames.includes(o.scene)) {
      console.log(`  ! Szene "${o.scene}" fehlt, wird angelegt`)
      await ensureScene(o.scene, sceneNames)
      sceneNames.push(o.scene)
    }
    await ensureBrowserSource(o.scene, o.source, o.route, o.scene !== '01 Standby', inputNames)
    if (!DRY) await raiseToTop(o.scene, o.source)
  }

  console.log('\nBauchbinde als eigene Quelle (in 02 Kamera, standardmäßig sichtbar):')
  await ensureBrowserSource('02 Kamera', LOWER_THIRD.source, LOWER_THIRD.route, false, inputNames)
  if (!DRY) await raiseToTop('02 Kamera', LOWER_THIRD.source)

  console.log('\nKarten-Szenen anlegen:')
  for (const c of CARDS) {
    await ensureScene(c.scene, sceneNames)
    await ensureBrowserSource(c.scene, c.source, c.route, c.refresh, inputNames)
  }

  if (!DRY) {
    console.log('\nKamera-PiP in "03 Build" ausrichten:')
    await placeCameraPip('03 Build')
  }

  console.log('\nFertig. Bestehende Szenen wurden nicht gelöscht oder umbenannt.')
  socket.close()
}

main().catch((error) => {
  console.error(`\nFehler: ${error.message}`)
  socket?.close()
  process.exit(1)
})
