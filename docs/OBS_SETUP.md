# OBS-Einrichtung

Ausgabe: **1920 × 1080, 30 fps**. Alle Overlays sind exakt auf diese Stage gebaut.

---

## 1. Server starten

```bash
npm install
npm run dev
```

Läuft dann auf `http://localhost:5173`. Der Server muss während der Sendung laufen.

Für maximale Stabilität im Livebetrieb besser die gebaute Fassung nehmen:

```bash
npm run build
npm run preview
```

Die läuft auf `http://localhost:4173` und hat keinen Dev-Server-Overhead und kein HMR.
**Empfehlung: für echte Sendungen immer `preview` nutzen, nicht `dev`.**

---

## 2a. Automatisch einrichten (empfohlen)

Bei laufendem OBS und laufendem Dev-Server richtet ein Befehl alles ein:

```bash
npm run obs:setup
```

Das Skript spricht obs-websocket an und **ergänzt nur**. Es löscht und benennt nie
etwas um. Es legt die fünf Overlay-Quellen in den bestehenden Szenen `01 Standby`
bis `04 Nur Screen` an, erstellt die Karten-Szenen `05` bis `09` und richtet den
Kamera-PiP in der Build-Szene millimetergenau aus.

Vorher ansehen, ohne etwas zu ändern:

```bash
npm run obs:setup -- --dry
```

Auf den Produktions-Server umstellen (erneut ausführen aktualisiert nur die URLs):

```bash
npm run obs:setup -- --base=http://localhost:4173
```

Prüfen, ob alles in OBS wirklich rendert:

```bash
npm run obs:verify -- --out=/tmp/obs-check
```

Der Test schaltet dafür kurz durch die reinen Kartenszenen und danach zurück.
Er fasst bewusst keine Szene mit Kamera oder Bildschirmfreigabe an, damit kein
geteilter Bildschirminhalt in einem Prüfbild landet. Läuft Stream oder Aufnahme,
bricht er ab, ohne etwas umzuschalten.

Voraussetzung: In OBS unter `Werkzeuge → WebSocket-Servereinstellungen` muss der
Server aktiviert sein. Das Passwort liest das Skript selbst aus der lokalen
OBS-Konfiguration, es muss nirgends eingetragen werden.

## 2b. Browser-Sources von Hand anlegen

Für jede Quelle in OBS: `+ → Browserquelle`, Breite **1920**, Höhe **1080**.

| OBS-Szene | URL | Hinweis |
|---|---|---|
| 01 Standby | `http://localhost:4173/#/standby` | Vollbild, deckt alles ab |
| 02 Kamera | `http://localhost:4173/#/camera` | über die Kameraquelle legen |
| 03 Build | `http://localhost:4173/#/build` | über Screen und Kamera-PiP legen |
| 04 Nur Screen | `http://localhost:4173/#/screen` | über die Screenquelle legen |

Zusätzliche Karten, je als eigene Szene oder als umschaltbare Quelle:

| Zweck | URL |
|---|---|
| Themenkarte (Segmentwechsel) | `http://localhost:4173/#/topic` |
| Kernaussage | `http://localhost:4173/#/statement` |
| Bauchbinde einzeln | `http://localhost:4173/#/lower-third` |
| Pause | `http://localhost:4173/#/break` |
| Ende | `http://localhost:4173/#/end` |
| Technischer Check | `http://localhost:4173/#/technical` |

Regie im normalen Browser, nicht in OBS: `http://localhost:4173/#/control`

---

## 3. Einstellungen je Browserquelle

Diese vier Haken entscheiden, ob es im Livebetrieb sauber läuft:

- [x] **Quelle beim Nichtanzeigen deaktivieren** · spart CPU, wenn die Szene nicht dran ist
- [x] **Browser beim Szenenwechsel aktualisieren** · lässt die Reveal-Animation bei jedem
      Einblenden neu laufen. Ohne diesen Haken läuft die Einblendung nur einmal beim Start.
- [ ] Audio der Quelle steuern · aus, die Overlays haben keinen Ton
- **Eigenes CSS:** leer lassen. Der transparente Hintergrund kommt schon aus dem Projekt.

Für Karten, die stehen bleiben sollen (Standby über mehrere Minuten), den Haken
„Browser beim Szenenwechsel aktualisieren" **weglassen**, sonst startet der Countdown neu.

---

## 4. Kamera-PiP in der Build-Szene positionieren

Das Overlay zeichnet nur die Eckmarken. Die Kameraquelle muss exakt darin sitzen:

| Wert | Zahl |
|---|---|
| Größe | 480 × 270 |
| Position X | 1344 |
| Position Y | 714 |

In OBS: Kameraquelle auswählen, `Transformation bearbeiten`, Position und Größe
eintragen. Danach sitzt das Bild millimetergenau im Rahmen.

Der Screen-Share liegt darunter und bleibt vollflächig, das Overlay verdeckt nur
die Build-Ziel-Platte unten links (etwa 730 × 66 px) und die Kopfzeile.

---

## 5. Regie während der Sendung

Das Control Panel auf einem zweiten Bildschirm im Browser offen lassen:
`http://localhost:4173/#/control`

Jede Eingabe wirkt sofort in allen OBS-Quellen, ohne Reload, ohne Szenenwechsel.
Der Abgleich läuft über `BroadcastChannel` und `localStorage` auf derselben Origin.
Kein Backend, keine Internetverbindung nötig.

**Wichtig:** OBS-Browserquellen und das Control Panel müssen dieselbe Adresse benutzen.
Wenn OBS `localhost` nutzt, muss die Regie auch `localhost` nutzen, nicht `127.0.0.1`.
Sonst sind es zwei getrennte Speicher und der Abgleich greift nicht.

---

## 6. Ablauf einer Sendung

1. **Vor Sendebeginn** · Im Control Panel Episodennummer, Titel, Standby-Thema und
   Ablauf eintragen. Countdown-Minuten setzen, `Start` drücken. Szene 01 Standby fahren.
2. **Start** · `Live: AN` schalten. Auf Szene 02 Kamera wechseln.
3. **Segmentwechsel** · Segment-Label und Segmenttitel setzen, kurz auf die Themenkarte
   schneiden, dann in die Zielszene.
4. **Build** · Build-Ziel eintragen, Schrittzähler mitführen. Szene 03.
5. **Kernaussage** · Satz eintragen, auf `/statement` schneiden, 4 bis 6 Sekunden stehen lassen.
6. **Pause** · Countdown neu starten, Szene Pause.
7. **Ende** · Text für die nächste Folge prüfen, Szene Ende.
8. **Störung** · Szene Technischer Check. Ruhig bleiben, der Stream läuft weiter.

---

## 7. Wenn etwas nicht läuft

| Symptom | Ursache | Lösung |
|---|---|---|
| Overlay bleibt weiß statt transparent | Vollbildkarte statt Overlay-Route | `/camera`, `/build`, `/screen`, `/lower-third` sind transparent, die übrigen sind absichtlich deckend |
| Regie ändert nichts | unterschiedliche Adresse | beide auf `localhost` mit gleichem Port |
| Text zu klein oder zu groß | Browserquelle nicht auf 1920 × 1080 | Größe in der Quelle korrigieren, nicht skalieren |
| Countdown springt zurück | Haken „beim Szenenwechsel aktualisieren" | für Standby und Pause abwählen |
| Szene bleibt leer | Renderfehler | Boundary hat abgefangen, Konsole der Browserquelle prüfen, Quelle neu laden |
| Schrift wirkt falsch | Fonts nicht geladen | `npm install` erneut, Fonts liegen lokal im Paket, nicht im Netz |
