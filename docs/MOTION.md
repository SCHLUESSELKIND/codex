# Motion-System

Bewegung heißt hier: **ein System wird aktiviert, Information rastet ein.**
Nicht: etwas hüpft ins Bild.

Grundregel: Das Design muss ohne jede Animation vollständig und hochwertig wirken.
Motion ist Verstärkung, nie Voraussetzung.

---

## Timings

| Klasse | Dauer | Kurve | Wofür |
|---|---|---|---|
| Micro Interaction | 120 bis 180 ms | `--ease-snap` | Zustandswechsel, Schrittzähler, Schalter |
| Standard Reveal | 240 bis 360 ms | `--ease-snap` | einzelne Elemente, Bauchbinden-Opazität |
| Segment Transition | 450 bis 700 ms | `--ease-snap` | Kartenwechsel, maskierte Typografie |
| Standby Ambient | 24 s | `--ease-scan` | eine Scanlinie, nahtlos, kaum wahrnehmbar |

Tokens: `--motion-micro: 150ms`, `--motion-reveal: 300ms`, `--motion-segment: 550ms`.
Kurven: `--ease-snap: cubic-bezier(0.2, 0, 0, 1)` (einrasten),
`--ease-scan: cubic-bezier(0.65, 0, 0.35, 1)` (gleichmäßig durchlaufen).

---

## Das Vokabular

| Baustein | Klasse | Verhalten |
|---|---|---|
| Maskiertes Reveal | `.reveal-up` | `clip-path` von unten öffnen, 18 px Versatz nach oben |
| Gestaffeltes Reveal | `.reveal-up--d1/d2/d3` | 90, 180, 270 ms Versatz, erzeugt Lesereihenfolge |
| Linien-Reveal | `.draw-x` | Haarlinie wächst von links, 200 ms Versatz |
| Bauchbinde | inline | `clip-path` von links plus Opazität, 550 ms |
| LIVE-Puls | `live-pulse` | 1.6 s, Opazität 1 zu 0.35, **nur hier** |
| Scanlinie | `.scanline` | wandert alle 24 s einmal durchs Standby-Bild |
| Fortschritt | inline | Baustein füllt sich in 150 ms, kein Wachsen, kein Blenden |

---

## Regeln

1. **Der Baustein in der Wortmarke blinkt nicht.** Ein Standbild muss die Marke
   vollständig zeigen. Bewegung gehört dem LIVE-Indikator.
2. **Kein Bounce, kein Spring, kein Overshoot.** Die Kurve rastet ein, sie federt nicht.
3. **Keine dauerhaft bewegten Hintergründe.** Die Scanlinie ist die einzige Ausnahme,
   und sie läuft alle 24 Sekunden genau einmal durch.
4. **Keine Glitches, keine Zooms, keine langen Logoanimationen.**
5. **Nichts bewegt sich, während gelesen wird.** Reveals laufen an, dann steht das Bild.
6. **Reihenfolge ist Bedeutung.** Wenn drei Elemente gestaffelt erscheinen, ist die
   Staffelung die Lesereihenfolge, nicht Dekoration.

---

## Verhalten in OBS

Die Reveal-Animationen laufen beim Laden der Browserquelle. Damit sie bei jedem
Einblenden neu starten, in OBS pro Quelle **„Browser beim Szenenwechsel aktualisieren"**
aktivieren.

Ausnahme: Standby und Pause. Dort würde der Countdown bei jedem Wechsel neu beginnen,
deshalb dort ohne diesen Haken arbeiten.
