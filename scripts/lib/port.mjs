import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/*
  Der Sendeport steht nur an einer Stelle: vite.config.ts.
  Alle Skripte lesen ihn von dort, damit eine Änderung nie dazu führt,
  dass Export oder Deploy auf einen toten Port zeigen.
*/

const PROJECT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')

export function previewPort() {
  const config = readFileSync(`${PROJECT}/vite.config.ts`, 'utf8')
  const match = config.match(/preview:\s*\{[^}]*port:\s*(\d+)/)
  if (!match) throw new Error('Kein preview.port in vite.config.ts gefunden.')
  return Number(match[1])
}

export function previewUrl() {
  return `http://localhost:${previewPort()}`
}

export const PROJECT_ROOT = PROJECT
