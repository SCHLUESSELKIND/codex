/*
  Deploy für den Sendebetrieb.

  Was hier passiert und warum:

  Während einer Live-Sendung darf der Server, der die Overlays liefert, nicht
  an einem offenen Terminalfenster hängen. Ein versehentlich geschlossenes
  Fenster oder ein Neustart des Rechners würde alle OBS-Quellen schwarz
  schalten. Deshalb wird der Server als LaunchAgent registriert: macOS startet
  ihn beim Anmelden automatisch und hält ihn am Leben, falls er abstürzt.

  Ein LaunchAgent ist eine reine Nutzer-Installation in
  ~/Library/LaunchAgents. Kein sudo, keine Systemeinstellung, jederzeit mit
  "npm run deploy:stop" rückstandsfrei zu entfernen.

    npm run deploy          → bauen, installieren, starten, prüfen
    npm run deploy:status   → läuft er? seit wann? auf welchem Port?
    npm run deploy:stop     → Dienst anhalten und Autostart entfernen
*/

import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname } from 'node:path'
import { previewUrl, PROJECT_ROOT } from './lib/port.mjs'

const flags = new Set(process.argv.slice(2).map((a) => a.replace(/^--/, '')))

const PROJECT = PROJECT_ROOT
const LABEL = 'me.zehnx.buildonpurpose'
const PLIST = `${homedir()}/Library/LaunchAgents/${LABEL}.plist`
const LOG = `${homedir()}/Library/Logs/build-on-purpose.log`
const URL = previewUrl()
const TARGET = `gui/${process.getuid()}/${LABEL}`

function launchctl(args, { leise = false } = {}) {
  try {
    return execFileSync('launchctl', args, { encoding: 'utf8', stdio: leise ? 'pipe' : 'pipe' })
  } catch (error) {
    if (leise) return ''
    throw error
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function erreichbar(pfad = '/') {
  try {
    const response = await fetch(`${URL}${pfad}`, { signal: AbortSignal.timeout(2000) })
    return response.status
  } catch {
    return 0
  }
}

// ---------- Status ----------

if (flags.has('status')) {
  const liste = launchctl(['list'], { leise: true })
  const zeile = liste.split('\n').find((l) => l.includes(LABEL))
  const status = await erreichbar()

  console.log(`BUILD ON PURPOSE · Sendeserver`)
  console.log(`  Autostart:    ${existsSync(PLIST) ? 'eingerichtet' : 'nicht eingerichtet'}`)
  console.log(`  Dienst:       ${zeile ? zeile.trim().split(/\s+/)[0] === '-' ? 'geladen' : `läuft (PID ${zeile.trim().split(/\s+/)[0]})` : 'nicht geladen'}`)
  console.log(`  Erreichbar:   ${status === 200 ? `ja, HTTP 200 auf ${URL}` : `NEIN (${URL})`}`)
  console.log(`  Protokoll:    ${LOG}`)
  process.exit(status === 200 ? 0 : 1)
}

// ---------- Stoppen ----------

if (flags.has('stop')) {
  launchctl(['bootout', TARGET], { leise: true })
  if (existsSync(PLIST)) rmSync(PLIST)
  console.log('Sendeserver angehalten, Autostart entfernt.')
  console.log('Für die Entwicklung weiterhin: npm run dev')
  process.exit(0)
}

// ---------- Einrichten ----------

if (!existsSync(`${PROJECT}/dist/index.html`)) {
  console.error('Kein dist/ gefunden. Zuerst "npm run build" ausführen.')
  process.exit(1)
}

mkdirSync(dirname(LOG), { recursive: true })
mkdirSync(dirname(PLIST), { recursive: true })

// process.execPath ist der absolute Pfad zum laufenden Node. Ein LaunchAgent
// startet mit minimalem PATH, deshalb wird hier nichts geraten.
const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${LABEL}</string>
  <key>ProgramArguments</key>
  <array>
    <string>${process.execPath}</string>
    <string>${PROJECT}/node_modules/vite/bin/vite.js</string>
    <string>preview</string>
  </array>
  <key>WorkingDirectory</key>
  <string>${PROJECT}</string>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>StandardOutPath</key>
  <string>${LOG}</string>
  <key>StandardErrorPath</key>
  <string>${LOG}</string>
  <key>ProcessType</key>
  <string>Interactive</string>
</dict>
</plist>
`

writeFileSync(PLIST, plist)
console.log(`Autostart geschrieben: ${PLIST}`)

/*
  Neu laden. launchd braucht nach dem Entladen einen Moment, bis das Label
  wieder frei ist. Ein sofortiges bootstrap quittiert sonst mit
  "Bootstrap failed: 5: Input/output error". Deshalb wird gewartet und
  wiederholt, und ein bereits geladener Dienst gilt nicht als Fehler:
  kickstart startet ihn ohnehin mit der neuen plist durch.
*/
launchctl(['bootout', TARGET], { leise: true })

let geladen = false
for (let versuch = 0; versuch < 8; versuch += 1) {
  await sleep(400)
  try {
    launchctl(['bootstrap', `gui/${process.getuid()}`, PLIST])
    geladen = true
    break
  } catch (error) {
    const text = String(error.stderr ?? error.message ?? '')
    // 37 = "Service already bootstrapped": auch das ist ein brauchbarer Zustand.
    if (text.includes('already bootstrapped') || text.includes(': 37:')) {
      geladen = true
      break
    }
  }
}

if (!geladen) {
  console.error('Dienst konnte nicht geladen werden.')
  console.error(`Von Hand prüfen: launchctl print ${TARGET}`)
  process.exit(1)
}

launchctl(['kickstart', '-k', TARGET], { leise: true })
console.log('Dienst geladen und gestartet.')

process.stdout.write('Warte auf Antwort ')
let status = 0
for (let versuch = 0; versuch < 20; versuch += 1) {
  status = await erreichbar()
  if (status === 200) break
  process.stdout.write('.')
  await sleep(500)
}
console.log('')

if (status !== 200) {
  console.error(`\nServer antwortet nicht auf ${URL}.`)
  console.error(`Protokoll ansehen: tail -n 40 ${LOG}`)
  process.exit(1)
}

console.log(`\nSendeserver läuft: ${URL}`)
console.log('Er startet ab jetzt bei jeder Anmeldung automatisch mit.\n')
console.log('Regie:    ' + `${URL}/#/control`)
console.log('Standby:  ' + `${URL}/#/standby`)
console.log('\nOBS auf diese Adressen umstellen:')
console.log(`  npm run obs:setup -- --base=${URL}`)
