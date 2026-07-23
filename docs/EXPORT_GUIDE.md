# Export- und Benennungsregeln

## Automatischer Export

Server starten, dann exportieren:

```bash
npm run build && npm run preview
```

In einem zweiten Terminal:

```bash
npm run export
```

Alle Dateien landen als PNG in `export/`. Gegen den Dev-Server:

```bash
npm run export -- --base=http://localhost:5173
```

### Optionen

| Option | Wirkung |
|---|---|
| `--base=<url>` | Serveradresse, Standard `http://localhost:4173` |
| `--only=<gruppe>` | nur eine Gruppe: `channel`, `thumbs`, `social`, `cards` |
| `--episode=<nr>` | Episodennummer in Dateinamen und Grafik, Standard `001` |

Beispiel für eine neue Folge:

```bash
npm run export -- --only=thumbs --episode=007
```

Das Skript wartet auf geladene Schriften und abgeschlossene Reveal-Animationen,
bevor es auslöst. Es exportiert exakt den Stage-Bereich, nicht das Browserfenster.

---

## Benennung

```
bop-<typ>-<detail>.png
```

| Typ | Beispiel | Format |
|---|---|---|
| Banner | `bop-banner-2560x1440.png` | 2560 × 1440 |
| Profilbild | `bop-avatar-800x800.png` | 800 × 800 |
| Endscreen | `bop-endscreen-1920x1080.png` | 1920 × 1080 |
| Thumbnail | `bop-thumb-007-live-build.png` | 1280 × 720 |
| Social | `bop-social-story-heute-live.png` | 1080 × 1920 |
| Sendekarte | `bop-card-standby-1920x1080.png` | 1920 × 1080 |

Episodennummer immer dreistellig: `001`, `042`, `137`.

---

## Was wohin gehört

| Datei | Ziel | Hinweis |
|---|---|---|
| `bop-banner-2560x1440.png` | YouTube Kanalbanner | YouTube schneidet je Gerät zu, die Botschaft liegt in der 1546 × 423 Safe Area |
| `bop-avatar-800x800.png` | YouTube Profilbild | wird rund beschnitten, das Monogramm sitzt zentriert |
| `bop-thumb-*.png` | Video-Thumbnail | unter 2 MB, PNG oder JPG |
| `bop-endscreen-*.png` | letzte 20 Sekunden im Schnittprogramm | die dunklen Felder markieren, wo YouTube die Elemente platziert |
| `bop-social-*.png` | Community-Tab, Instagram, LinkedIn | square für Feed, portrait für LinkedIn, story für Instagram und Shorts-Ankündigung |

### Endscreen-Zonen

Die Slots im Export entsprechen den YouTube-Elementen. Beim Setzen im YouTube-Studio
die Elemente auf die dunklen Felder ziehen:

| Element | Position (1920 × 1080) | Größe |
|---|---|---|
| Video 1 | x 860, y 200 | 480 × 270 |
| Video 2 | x 1380, y 200 | 480 × 270 |
| Abonnieren | x 860, y 560 | 196 × 196 |

---

## Manueller Export, falls nötig

1. Route im Browser öffnen, Fenster auf die Zielgröße bringen
2. Auf `#/yt/banner?guides=1` blendet der Banner seine Safe Areas ein, das nur zur Kontrolle
3. Screenshot ausschließlich des Stage-Bereichs, nie des Fensters
4. Als PNG speichern, Benennung wie oben

Der automatische Weg ist genauer. Manuell nur, wenn Playwright nicht läuft.

---

## Prüfliste vor dem Hochladen

- [ ] Portrait im Thumbnail eingesetzt, kein Platzhalter mehr sichtbar
- [ ] Headline höchstens sechs Wörter, höchstens drei Zeilen
- [ ] Episodennummer stimmt in Grafik und Dateiname
- [ ] Thumbnail auf 210 px verkleinert angesehen, Kernaussage noch lesbar
- [ ] Banner im Handy-Ausschnitt geprüft, nichts Wichtiges außerhalb der Safe Area
- [ ] Orange nur als einzelner Punkt, nicht als Fläche
- [ ] keine Gedankenstriche im Text
- [ ] Umlaute korrekt (ä ö ü ß)
