/*
  Export aller Grafiken als PNG.

  Voraussetzung: ein laufender Server (npm run dev oder npm run preview).
  Aufruf:
    npm run export                      → gegen http://localhost:4173
    npm run export -- --base=http://localhost:5173
    npm run export -- --only=thumbs

  Ergebnis liegt in export/ und ist nach EXPORT_GUIDE.md benannt.
*/

import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=')
    return [k, v ?? true]
  }),
)

const BASE = args.base ?? 'http://localhost:4173'
const ONLY = args.only ?? null
const EPISODE = args.episode ?? '001'
const OUT = resolve(process.cwd(), 'export')

const THUMB_TEMPLATES = ['live-build', 'news', 'test', 'talk', 'signal']

const JOBS = [
  { group: 'channel', name: `bop-banner-2560x1440`, url: '/yt/banner', w: 2560, h: 1440 },
  { group: 'channel', name: `bop-avatar-800x800`, url: '/yt/avatar', w: 800, h: 800 },
  { group: 'channel', name: `bop-endscreen-1920x1080`, url: '/yt/endscreen', w: 1920, h: 1080 },

  ...THUMB_TEMPLATES.map((t) => ({
    group: 'thumbs',
    name: `bop-thumb-${EPISODE}-${t}`,
    url: `/yt/thumb/${t}?episode=${EPISODE}`,
    w: 1280,
    h: 720,
  })),

  ...[
    ['square', 1080, 1080],
    ['portrait', 1080, 1350],
    ['story', 1080, 1920],
  ].flatMap(([format, w, h]) =>
    ['neue-folge', 'heute-live', 'kernaussage', 'build-ergebnis', 'frage'].map((type) => ({
      group: 'social',
      name: `bop-social-${format}-${type}`,
      url: `/social/${format}?type=${type}&episode=${EPISODE}`,
      w,
      h,
    })),
  ),

  ...['standby', 'topic', 'statement', 'break', 'end', 'technical'].map((scene) => ({
    group: 'cards',
    name: `bop-card-${scene}-1920x1080`,
    url: `/${scene}`,
    w: 1920,
    h: 1080,
  })),
]

const selected = ONLY ? JOBS.filter((j) => j.group === ONLY) : JOBS

if (selected.length === 0) {
  console.error(`Keine Jobs für --only=${ONLY}. Erlaubt: channel, thumbs, social, cards.`)
  process.exit(1)
}

await mkdir(OUT, { recursive: true })

const browser = await chromium.launch()
console.log(`Export nach ${OUT} (Basis ${BASE})`)

let failed = 0

for (const job of selected) {
  const page = await browser.newPage({
    viewport: { width: job.w, height: job.h },
    deviceScaleFactor: 1,
  })
  try {
    const response = await page.goto(`${BASE}/#${job.url}`, { waitUntil: 'networkidle' })
    if (response && !response.ok()) throw new Error(`HTTP ${response.status()}`)

    // Fonts und Reveal-Animationen abwarten, sonst exportiert man Zwischenzustände.
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(1400)

    const stage = page.locator('.broadcast > div').first()
    const shot = await stage.screenshot({ type: 'png' })
    await writeFile(resolve(OUT, `${job.name}.png`), shot)
    console.log(`  ok   ${job.name}.png  (${job.w}x${job.h})`)
  } catch (error) {
    failed += 1
    console.error(`  FEHL ${job.name}: ${error.message}`)
  } finally {
    await page.close()
  }
}

await browser.close()

console.log(`\nFertig: ${selected.length - failed} von ${selected.length} exportiert.`)
if (failed > 0) process.exit(1)
