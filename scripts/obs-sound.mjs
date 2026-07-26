/*
  Legt die elf Klangsignale als Medienquellen in OBS an.

  Alle liegen in einer eigenen Szene "SOUND". Diese Szene wird nie auf Sendung
  geschaltet, sie ist nur der Ort, an dem die Quellen wohnen. Abgefeuert wird
  über Hotkeys, die OBS pro Quelle unter Einstellungen → Hotkeys anbietet.

  Warum eine eigene Szene und nicht je Sendeszene eine Kopie: So gibt es jedes
  Signal genau einmal, mit genau einem Regler. Ändert sich ein Pegel, ändert er
  sich überall.

  Die Reglerwerte stehen unten und stammen aus der geprüften Tabelle in
  docs/SOUND.md. Das lauteste Signal steht auf 0 dB, alles andere darunter,
  damit im Mixer nichts übersteuern kann.

    node scripts/obs-sound.mjs          → anlegen und Pegel setzen
    node scripts/obs-sound.mjs --dry    → nur zeigen
*/

import { readFileSync, existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { createHash } from 'node:crypto'
import { WebSocket } from 'ws'
import { PROJECT_ROOT } from './lib/port.mjs'

const DRY = process.argv.includes('--dry')
const SZENE = 'SOUND'

/*
  Datei, Reglerwert in dB, Zweck.

  Die Reglerwerte stammen aus der geprüften Tabelle in docs/SOUND.md. Sie sind
  NICHT einfach "Ziel minus Hausnorm": maßgeblich ist der gemessene Ist-Pegel
  jeder Datei, und bezogen wird auf das lauteste Signal, das auf 0 dB steht.

  Deshalb ist kein Wert positiv. Damit kann der OBS-Mixer nicht übersteuern,
  egal welche Kombination gleichzeitig läuft.
*/
const SIGNALE = [
  ['bop-challenge-start', 0.0, 'mit "Ziel locken und starten"'],
  ['bop-sting-marke', -0.9, 'Sendungsanfang und Sendungsende'],
  ['bop-geschafft', -1.1, 'vor Ablauf fertig'],
  ['bop-zeit-aus', -2.1, 'Uhr abgelaufen'],
  ['bop-segment-wechsel', -2.9, 'auf jedem Bumper'],
  ['bop-kriterium-klick', -4.2, 'Kriterium abgehakt'],
  ['bop-intro-bett', -10.9, 'unter der Begrüßung, endet in Stille'],
  ['bop-intro-bett-loop', -11.0, 'langes Standby, nahtlos schleifbar'],
  ['bop-warnung-2min', -15.1, 'Restzeit 2 Minuten'],
  ['bop-warnung-10min', -19.3, 'Restzeit 10 Minuten'],
  ['bop-frage-einblendung', -20.9, 'Zuschauerfrage eingeblendet'],
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

/** Dezibel in den linearen Multiplikator, den obs-websocket erwartet. */
function dbToMul(db) {
  return Math.pow(10, db / 20)
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

console.log(`Klangsignale in OBS${DRY ? ' (Probelauf)' : ''}\n`)

const { scenes } = await send('GetSceneList', {})
if (!scenes.some((s) => s.sceneName === SZENE)) {
  if (DRY) console.log(`  + Szene "${SZENE}" würde angelegt`)
  else {
    await send('CreateScene', { sceneName: SZENE })
    console.log(`  + Szene "${SZENE}" angelegt`)
  }
} else {
  console.log(`  · Szene "${SZENE}" existiert bereits`)
}

const { inputs } = await send('GetInputList', {})
const vorhanden = inputs.map((i) => i.inputName)
let fehlend = 0

for (const [datei, regler, zweck] of SIGNALE) {
  const pfad = `${PROJECT_ROOT}/public/sound/${datei}.wav`
  if (!existsSync(pfad)) {
    console.log(`  ! ${datei}.wav fehlt, übersprungen`)
    fehlend += 1
    continue
  }

  const name = `SND · ${datei.replace('bop-', '')}`

  const settings = {
    local_file: pfad,
    is_local_file: true,
    looping: datei.endsWith('-loop'),
    restart_on_activate: false, // sonst spielt es bei jedem Szenenwechsel neu
    close_when_inactive: true,
  }

  if (DRY) {
    console.log(`  + "${name}"  Regler ${regler.toFixed(1)} dB  · ${zweck}`)
    continue
  }

  if (vorhanden.includes(name)) {
    await send('SetInputSettings', { inputName: name, inputSettings: settings, overlay: true })
  } else {
    await send('CreateInput', {
      sceneName: SZENE,
      inputName: name,
      inputKind: 'ffmpeg_source',
      inputSettings: settings,
      sceneItemEnabled: true,
    })
  }

  await send('SetInputVolume', { inputName: name, inputVolumeMul: dbToMul(regler) })
  // Monitor aus, Ton geht in den Stream. Wer mithören will, stellt das je Quelle um.
  await send('SetInputAudioMonitorType', {
    inputName: name,
    monitorType: 'OBS_MONITORING_TYPE_MONITOR_AND_OUTPUT',
  })
  console.log(`  ✓ "${name}"  Regler ${regler.toFixed(1)} dB  · ${zweck}`)
}

console.log(
  `\n${SIGNALE.length - fehlend} Signale bereit.` +
    (fehlend ? ` ${fehlend} fehlen, "python3 scripts/sound.py" erzeugt sie.` : ''),
)
console.log('\nNoch von Hand: OBS → Einstellungen → Hotkeys, dort je Quelle')
console.log('"Wiedergabe neu starten" auf eine Taste legen. Vorschlag:')
console.log('  F1 Sting · F2 Segmentwechsel · F3 Challenge-Start')
console.log('  F4 Warnung 10 · F5 Warnung 2 · F6 Zeit aus · F7 Geschafft')
socket.close()
