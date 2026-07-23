# BUILD ON PURPOSE

Design- und Broadcast-System der wöchentlichen KI-Live-Show von Thomas Frerich.

> Ich baue KI, die im echten Arbeitsalltag funktioniert. Live, ehrlich, mit Absicht.
> Kein Hype, keine Buzzwords.

Kanal: [youtube.com/@tom_frerich](https://youtube.com/@tom_frerich) · Von ZehnX, Köln

---

## Was das hier ist

Ein geschlossenes visuelles System für eine deutsche KI-Live-Show, ausgelegt auf
mindestens 50 Folgen. Es enthält:

- **OBS-Broadcast-System** · zehn Sendeansichten als Browser-Sources, live steuerbar
- **Regie-Panel** · alle Sendedaten während der Sendung änderbar, ohne Codeänderung
- **YouTube-System** · Kanalbanner, Profilbild, fünf Thumbnail-Sorten, Endscreen, Social
- **Design-Tokens** · Farbe, Typografie, Raum, Motion als CSS Custom Properties und JSON
- **Export** · ein Befehl erzeugt alle Grafiken pixelgenau als PNG

Leitidee: **Operational Intelligence**. BRIEFING analysiert, BUILD ON PURPOSE baut.

---

## Schnellstart

```bash
npm install
npm run dev
```

Dann im Browser:

| Was | Adresse |
|---|---|
| Regie | http://localhost:5173/#/control |
| Standby | http://localhost:5173/#/standby |
| Kamera-Overlay | http://localhost:5173/#/camera |
| Alle Ansichten | siehe Tabelle unten |

Für den echten Sendebetrieb die gebaute Fassung nehmen, sie ist stabiler:

```bash
npm run build && npm run preview
```

---

## Alle Ansichten

### Sendung (OBS Browser-Source, 1920 × 1080)

| Route | Zweck | Hintergrund |
|---|---|---|
| `/standby` | vor Sendebeginn, mit Ablauf und Countdown | deckend |
| `/camera` | Kamera-Overlay, Kamera bleibt dominant | transparent |
| `/build` | Bildschirmfreigabe mit Kamera-PiP und Build-Ziel | transparent |
| `/screen` | reine Bildschirmfreigabe, minimal | transparent |
| `/topic` | Themenkarte für Segmentwechsel | deckend |
| `/lower-third` | Bauchbinde einzeln, sieben Varianten | transparent |
| `/statement` | Kernaussagen-Karte | deckend |
| `/break` | Pause | deckend |
| `/end` | Endkarte | deckend |
| `/technical` | technischer Fehlerzustand | deckend |

### Regie und Abnahme

| Route | Zweck |
|---|---|
| `/control` | Regie-Panel, steuert alle Ansichten live |
| `/preview/:scene?bg=light\|dark\|code\|web\|busy` | Overlay über simuliertem Videobild prüfen |

### Export-Vorlagen

| Route | Format |
|---|---|
| `/yt/banner` (`?guides=1` für Safe Areas) | 2560 × 1440 |
| `/yt/avatar` | 800 × 800 |
| `/yt/thumb/:template` | 1280 × 720 |
| `/yt/endscreen` | 1920 × 1080 |
| `/social/:format` | 1080 × 1080, 1350, 1920 |

Thumbnail-Templates: `live-build`, `news`, `test`, `talk`, `signal`.

---

## Grafiken exportieren

```bash
npm run build && npm run preview      # Terminal 1
npm run export                        # Terminal 2
```

Ergebnis in `export/`. Details und Benennungsregeln: [docs/EXPORT_GUIDE.md](docs/EXPORT_GUIDE.md).

---

## Portraits einsetzen

Die Thumbnails zeigen einen markierten Platzhalter, solange keine Bilddatei vorliegt.
Es wird bewusst kein Gesicht erfunden und kein Stockbild verwendet.

Ablegen unter:

```
public/portraits/tom-thumb.png     # 520 × 720, Freisteller, für Thumbnails
public/portraits/tom-01.png        # allgemeiner Slot
```

Anforderungen an die Aufnahmen: [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md), Abschnitt 8.

---

## Dokumentation

| Datei | Inhalt |
|---|---|
| [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) | Idee, Logo, Farbe, Typografie, Raster, Bildbehandlung, Do's und Don'ts |
| [docs/OBS_SETUP.md](docs/OBS_SETUP.md) | OBS-Einrichtung, PiP-Koordinaten, Sendeablauf, Fehlerbehebung |
| [docs/THUMBNAIL_GUIDE.md](docs/THUMBNAIL_GUIDE.md) | die fünf Sorten, harte Regeln, Beispieltexte |
| [docs/EXPORT_GUIDE.md](docs/EXPORT_GUIDE.md) | Export, Benennung, Zielorte, Prüfliste |
| [docs/MOTION.md](docs/MOTION.md) | Bewegungsvokabular und Timings |

---

## Technik

Vite · React · TypeScript · CSS Custom Properties · SVG-freie Umsetzung über
Layout-Primitive. Keine Komponentenbibliothek, kein Backend, keine externen Inhalte,
die während einer Sendung ausfallen können. Schriften liegen lokal im Paket.

Der Abgleich zwischen Regie und Sendebild läuft über `BroadcastChannel` mit
`localStorage` als Persistenz. Eine Fehler-Boundary sorgt dafür, dass ein Renderfehler
das Videobild nie durch eine weiße Fläche ersetzt.

```
src/
  components/   Stage, Logo, Bauchbinde, Metaleiste, Portrait-Slot, Boundary
  scenes/       die zehn Sendeansichten und die Abnahme-Route
  control/      Regie-Panel
  hooks/        Zustand, Countdown
  state/        Sendezustand und Ablauf-Parser
  styles/       Tokens, Basis, Motion
  data/         Thumbnail-Templates, Textpool
  yt/           Banner, Profilbild, Thumbnails, Endscreen, Social
docs/           Dokumentation
scripts/        Export
public/         Portraits, Logos
```
