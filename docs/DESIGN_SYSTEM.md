# BUILD ON PURPOSE · Design-System

Leitidee: **OPERATIONAL INTELLIGENCE**.
Die Marke steht für Menschen, die bauen, testen, verwerfen und in den Arbeitsalltag bringen.

BRIEFING analysiert. BUILD ON PURPOSE baut. Deshalb ist dieses System die aktivere
Schwester der ZehnX-BRIEFING-Identität: dieselbe Nacht, dieselbe typografische Disziplin,
aber gerichteter, härter geschnitten, mit einem sichtbaren Aktivzustand.

---

## 1. Die zentrale Idee: der Baustein

Das ganze System hängt an einem einzigen Zeichen: einem roten Balken auf der Grundlinie,
direkt hinter dem Wort BUILD.

Er ist gleichzeitig dreierlei:

1. **Baustein** · der kleinste Schritt, aus dem etwas entsteht
2. **Cursor** · es wird gerade geschrieben, gerade gebaut
3. **Aufnahmezeichen** · Rot heißt in dieser Marke immer: jetzt, live, aktiv

Aus diesem Zeichen leitet sich alles ab: der Fortschrittsbalken der Build-Szene
(fünf Bausteine, gefüllt oder leer), der Marker vor jedem Thumbnail-Label, der
LIVE-Punkt, die Aktivkante der Bauchbinde. Ein Zeichen, viele Anwendungen.

**Regel:** Der Baustein im Wortmarken-Lockup blinkt nicht. Er ist Teil der Marke und
muss auf jedem Standbild vollständig sein. Bewegung bleibt dem LIVE-Indikator vorbehalten.

---

## 2. Logo- und Lockup-System

| Variante | Einsatz | Komponente |
|---|---|---|
| Gestapelt | Standby, Endkarte, Banner, Social | `WordmarkStacked` |
| Horizontal | Overlay-Kopfzeile, Endscreen | `WordmarkHorizontal` |
| Monogramm `B▌` | Profilbild, Screen-Szene, Favicon | `Monogram` |
| Episodenkennung | überall, wo die Folge zählt | `EpisodeTag` (`BUILD #001`) |
| LIVE-Lockup | Kamera, Build, Screen | `LiveBadge` |
| Herkunft | Fußzeilen | `ZehnxMark` (`Von ZehnX`) |

**Gewählte typografische Trennung:** gestapelt, ohne Trennzeichen.

```
BUILD▌
O N   P U R P O S E
```

BUILD steht in Archivo Black, maximal kompakt. ON PURPOSE steht darunter in Inter 800
mit weiter Sperrung (0.435 em). Der Kontrast aus massivem Block und feiner gesperrter
Linie erzeugt die Spannung. Verworfen wurden `BUILD / ON PURPOSE` (wirkt wie ein
Dateipfad), `BUILD — ON PURPOSE` (Gedankenstrich, gegen die Hausregel) und
`BUILD [ON PURPOSE]` (wirkt wie ein Platzhalter im Code).

**Schutzraum:** rundherum mindestens die Höhe des Bausteins.
**Mindestgröße:** horizontal 24 px Versalhöhe, Monogramm 24 px. Darunter nur das Monogramm.

**Kombinationen**

- `Eine Live-Show von Thomas Frerich` · Inter 700, Sperrung 0.14 em, Textfarbe sekundär
- `Von ZehnX` · Inter 700, 12 bis 14 px, das X in Signal-Orange. Nie größer als die Episodenkennung.

---

## 3. Farbsystem

| Token | Wert | Verwendung |
|---|---|---|
| `--bg-primary` | `#060606` | Grundfläche aller Vollbildkarten |
| `--bg-elevated` | `#0c0c0d` | Control Panel, Endscreen-Slots |
| `--surface` | `#121214` | Platzhalterflächen, Chips |
| `--border-subtle` | `rgba(244,244,241,0.12)` | Haarlinien, Tabellenkanten |
| `--border-strong` | `rgba(244,244,241,0.28)` | Rahmen aktiver UI-Elemente |
| `--text-primary` | `#F4F4F1` | Headlines, Kernaussagen |
| `--text-secondary` | `#a7a7a0` | Unterzeilen, Fließtext |
| `--text-muted` | `#62625c` | Metadaten, Koordinaten |
| `--live-red` | `#FF2B2B` | LIVE, Aufnahme, aktuelle Aktion |
| `--signal-orange` | `#f57b1f` | ZehnX-Herkunft, einzelne Datenpunkte |
| `--success` | `#2fbf71` | bestandener Build-Schritt (optional) |
| `--warning` | `#ffb020` | technischer Fehlerzustand |
| `--inactive` | `#3a3a36` | abgeschaltete Zustände |

**Die eine Farbregel:** Rot gehört der Gegenwart. Orange gehört der Herkunft.
Beide dürfen nie gleichzeitig großflächig auftreten. Auf einer Fläche ist entweder ein
rotes Element laut (LIVE, Aktivkante, Marker) oder ein oranger Punkt leise (ein X, ein
Tick, ein Segmentmarker). Nie beides in derselben Lautstärke.

Praktisch heißt das: Orange erscheint als einzelner Buchstabe, einzelner Strich oder
einzelner Marker. Nie als Fläche, nie als Rahmen, nie als Schrift über 26 px.

---

## 4. Typografie

**Archivo Black** trägt alles, was gelesen werden muss, bevor jemand liest:
Wortmarke, Headlines, Kernaussagen, Segmenttitel, Bauchbinden-Zeile 1.

**Inter (500 bis 900)** trägt alles, was gelesen wird, nachdem der Blick hängen blieb:
Unterzeilen, Metadaten, Status, Zahlen, UI.

### Skala (bezogen auf die 1920 × 1080 Stage)

| Rolle | Größe | Schrift | Zeilenhöhe | Sperrung |
|---|---|---|---|---|
| Display (Standby, Statement) | 120 bis 176 px | Archivo Black | 0.92 | -0.01 em |
| Episodentitel, Themenkarte | 96 px | Archivo Black | 0.94 | -0.01 em |
| Thumbnail-Headline (1280 × 720) | 78 bis 132 px | Archivo Black | 0.94 | -0.01 em |
| Segmenttitel | 64 px | Archivo Black | 0.94 | 0 |
| Bauchbinde Zeile 1 | 42 px | Archivo Black | 1.0 | 0 |
| Bauchbinde Zeile 2 | 22 px | Inter 600 | 1.4 | 0 |
| Fließtext auf Karten | 24 bis 34 px | Inter 500/700 | 1.25 bis 1.4 | 0 |
| Metadaten, Koordinaten | 18 px | Inter 600 | 1.0 | 0.14 em |
| Status, Kicker | 16 px | Inter 800 | 1.0 | 0.22 em |
| UI-Label (Control Panel) | 13 px | Inter 700 | 1.0 | 0.14 em |

Zahlen immer mit `font-variant-numeric: tabular-nums`, damit Countdown und
Schrittzähler beim Hochzählen nicht springen.

---

## 5. Raster, Raum, Safe Areas

Spacing-System auf 4-px-Basis: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128.
Es gibt keine Zwischenwerte. Wenn ein Abstand nicht passt, ist die Komposition falsch,
nicht der Wert.

| Fläche | Format | Safe Area |
|---|---|---|
| Sendegrafik | 1920 × 1080 | 96 px seitlich, 54 px oben und unten |
| Thumbnail | 1280 × 720 | 56 px rundum, Portraitzone ab x = 760 |
| Kanalbanner | 2560 × 1440 | 1546 × 423 zentriert (alle Geräte) |
| Social | 1080 × 1080/1350/1920 | 88 px rundum |

**Kompositionsprinzip der Vollbildkarten:** Vier-Punkt-Verankerung. Marke oben links,
Struktur oben rechts, Inhalt unten links, Zahl unten rechts. Die Mitte bleibt leer.
Diese Leere ist der Unterschied zwischen einer Sendung und einem Stream-Overlay.

---

## 6. Linien, Radien, Flächen

- Haarlinie `1px` · trennt, gliedert, verbindet nie
- Starke Linie `2px` · Eckmarken des Kamera-Rahmens
- Aktivkante `4px` in Rot · links an Bauchbinde und Build-Platte, markiert „das hier ist jetzt dran"
- Radius: **0 px in der gesamten Sendegrafik.** `2px` ausschließlich für funktionale
  Control-Panel-Elemente (Eingabefelder, Schalter).
- Schatten: genau einer, `0 4px 32px rgba(0,0,0,0.55)`, ausschließlich unter Platten,
  die über Videobild liegen. Nirgends sonst.
- Raster als Textur: `linear-gradient`-Gitter mit 5 bis 5.5 % Weiß, Zellgröße 80 px
  (Thumbnail), 108 px (Social), 160 px (Banner). Immer mit Maske abgeschwächt.

---

## 7. Statusanzeigen und Datenmarken

- **LIVE** · rote Fläche, dunkler Text, pulsender Punkt (1.6 s, nur hier)
- **STANDBY** · transparent mit Rahmen, gedämpfter Text, kein Puls
- **Build-Fortschritt** · n Bausteine, gefüllt = erledigt, Kontur = offen
- **Metaleiste** · `BOP·E001 · KÖLN 50.94°N 6.96°O ———— youtube.com/@tom_frerich · Von ZehnX`
- **Folgen-Lineal** (Banner) · ein Strich je Folge, jeder sechste in Orange

Jede dieser Marken trägt Information. Es gibt keine Datenmarke ohne Bedeutung.
Das ist der Unterschied zwischen Intelligence-Ästhetik und Sci-Fi-Dekor.

---

## 8. Bildbehandlung

**Portraits**

- Freisteller auf `#060606`, keine Ebene dazwischen
- Kantenlicht von links, Hauptlicht weich von vorn rechts
- Kontrast kontrolliert, Schwarzpunkt nicht zugefahren (YouTube komprimiert sonst zu Blöcken)
- feine Körnung erlaubt, sichtbar erst bei 100 %
- keine Beauty-Retusche, keine künstlichen Reflexe, keine Sci-Fi-Kanten
- Blick in die Kamera oder knapp daneben, nie nach unten

Fehlt ein Portrait, zeigt `PortraitSlot` einen klar markierten Platzhalter mit Dateipfad.
Es wird **nie** ein Gesicht erfunden oder ein Stockbild eingesetzt.

**Screenshots und Interfaces**

Nie als kleines Fenster einbetten. Immer: Ausschnitt vergrößern, den relevanten
UI-Bereich isolieren, mit einer roten Haarlinie oder einem Baustein markieren,
Umgebung abdunkeln. Wenn ein Screenshot ohne Erklärung nicht funktioniert, ist er
der falsche Ausschnitt.

---

## 9. Tonalität

Deutsch, außer dem Markennamen. Kurze Sätze. Aussagen statt Versprechen.

| Ja | Nein |
|---|---|
| „Was diese Woche wirklich zählt" | „Die 10 krassesten KI-Tools" |
| „Der Build ist gescheitert" | „Du wirst nicht glauben, was passiert ist" |
| „Funktioniert das im Mittelstand?" | „KI revolutioniert alles!!!" |
| „Kein Hype. Ein System." | „Game Changer für dein Business" |

Keine Gedankenstriche. Komma, Punkt oder Mittelpunkt.
Kein Ausrufezeichen in Sendegrafiken.

---

## 10. Do's und Don'ts

**Do**

- eine Aussage pro Fläche
- Leere aushalten
- Zahlen tabellarisch setzen
- Rot sparsam, dann aber eindeutig
- harte Schnitte statt weicher Überblendungen
- alles muss auch ohne Animation vollständig sein

**Don't**

- kein blau-violetter KI-Verlauf, keine Neon-Sechsecke, keine Roboterköpfe
- kein Glassmorphism, keine weichen SaaS-Karten, keine Glows
- keine gerundeten Ecken in der Sendegrafik
- kein zweiter Akzent neben Rot und Orange
- keine Dekoration ohne Funktion
- keine Animation, die Lesbarkeit kostet
- nie eine direkte Kopie des BRIEFING-Covers
