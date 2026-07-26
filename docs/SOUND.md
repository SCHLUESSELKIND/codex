# Klangsystem

Elf Signale, aus **drei Bausteinen und einem Motiv** synthetisiert. Kein
gekauftes Sample, kein fremder Formatklang. Alles leitet sich vom Grundton
A1 = 55,00 Hz ab und ist quartal gestapelt (A, D, E), also weder Dur noch Moll.
Der Ton eines Formats, das misst statt feiert.

Vorbild ist das Sounddesign hochwertiger Nachrichten- und Dokumentationsformate
plus Werkstatt: tiefe Impulse, präzise Klicks, kurze Sub-Bass-Schübe, feine
metallische Transienten, Rauschen sehr sparsam. Ein Messgerät, das einrastet.
Keine Fanfare, kein Applaus, kein Gameshow-Jubel.

Erzeugt von `scripts/sound.py`. Ausgabe in `public/sound/`.
Jedes Signal liegt als **WAV** (48 kHz, 16 Bit, stereo) und als **MP3**
(320 kbit/s) vor. In OBS wird die WAV-Fassung benutzt, die MP3 ist für
Schnitt, Trailer und Weitergabe.

---

## 1. Die elf Signale

Alle Dateien stehen einheitlich auf **-16 LUFS**. Die Lautstärke-Regie sitzt
nicht in der Datei, sondern im **Regler der OBS-Medienquelle**. Die Spalte
„Regler" ist genau dieser Wert, einmal eintragen und nie wieder anfassen.

Kein Regler ist positiv. Das lauteste Signal steht auf 0,0 dB, alles andere
liegt darunter. Damit kann in OBS nichts übersteuern, der lauteste Wert im
Mixer ist **-2,0 dBTP**. Wie laut das Tonbett insgesamt gegenüber der Stimme
sitzt, wird einmal am Mikrofonpegel gesetzt, nicht an elf einzelnen Reglern.

| Datei | Dauer | Lautheit | True Peak | Regler in OBS | Wann im Ablauf |
|---|---|---|---|---|---|
| `bop-sting-marke` | 2,400 s | -16,2 LUFS | -1,9 dBTP | **-0,9 dB** | Sendungsanfang bei 00:00 und Sendungsende. Das akustische Logo, sonst nie |
| `bop-intro-bett` | 24,000 s | -16,2 LUFS | -1,9 dBTP | **-10,9 dB** | Unter Standby und Begrüßung. Endet in 600 ms absoluter Stille, damit ein Satz frei stehen kann |
| `bop-intro-bett-loop` | 21,600 s | -16,1 LUFS | -3,3 dBTP | **-11,0 dB** | Dieselbe Fläche ohne Steigerung, nahtlos schleifbar. Für längeres Standby vor Sendebeginn |
| `bop-segment-wechsel` | 1,200 s | -16,2 LUFS | -1,7 dBTP | **-2,9 dB** | Auf jedem Bumper und jeder Themenkarte: 07:00 NEWS, 19:00 fAILs, 25:00 BUILD, 70:00 OUTRO. Quarte ohne Auflösung, sie kündigt an, sie schließt nicht ab |
| `bop-challenge-start` | 2,100 s | -16,1 LUFS | -2,0 dBTP | **0,0 dB** | 25:00, gleichzeitig mit „Ziel locken und starten". Die Uhr startet auf dem letzten Klick bei 1800 ms |
| `bop-warnung-10min` | 0,900 s | -15,8 LUFS | -2,0 dBTP | **-19,3 dB** | Restzeit 10 Minuten, wenn die Uhr auf Gelb springt. Reines Glas, Hochpass bei 600 Hz, kein Fundament |
| `bop-warnung-2min` | 1,350 s | -16,0 LUFS | -3,9 dBTP | **-15,1 dB** | Restzeit 2 Minuten, wenn die Uhr auf Rot springt. Derselbe Klang, nur einen Ganzton höher und lauter |
| `bop-zeit-aus` | 2,000 s | -16,0 LUFS | -4,0 dBTP | **-2,1 dB** | Ablauf der Uhr bei 70:00. Der Raum schließt sich ab 1400 ms, das Ergebnis steht |
| `bop-geschafft` | 2,550 s | -16,0 LUFS | -2,8 dBTP | **-1,1 dB** | Nur wenn der Build **vor** Ablauf fertig ist. Akkord A, D, E mit einem einzigen Blitzen auf A6 |
| `bop-kriterium-klick` | 0,600 s | -22,9 LUFS | -1,8 dBTP | **-4,2 dB** | Jedes abgehakte Abnahmekriterium während der Challenge. Bis zu zwanzig Einsätze pro Sendung, deshalb bewusst ohne Sub |
| `bop-frage-einblendung` | 0,600 s | -16,2 LUFS | -1,8 dBTP | **-20,9 dB** | Zuschauerfrage wird eingeblendet. Das leiseste Signal des Systems, 12 Prozent nach rechts |

Beim Klick und bei der Frage-Einblendung ist der hörbare Inhalt 240 ms
beziehungsweise 450 ms lang, der Rest der Datei ist bitgenaue Stille.
Grund steht in Abschnitt 5.

---

## 2. Die Regel: was nie über Sprache liegt

Das ist die wichtigste Zeile dieses Dokuments. Sie entscheidet, ob die Sendung
souverän klingt oder nach Hobbykeller.

> **Ein Signal, das mit gesetztem Regler lauter als -20 LUFS im Programm steht,
> liegt NIE über Sprache. Es steht allein.**

Die Trennlinie ist scharf und gemessen: Gruppe A liegt zwischen -16,1 und
-19,1 LUFS, Gruppe B zwischen -27,1 und -37,1 LUFS. Dazwischen liegen 8 LU
Abstand, dort verläuft die Grenze.

Praktisch heißt das zwei Gruppen:

**Gruppe A · steht allein, Mikrofon ist still**

`bop-sting-marke` · `bop-segment-wechsel` · `bop-challenge-start` ·
`bop-zeit-aus` · `bop-geschafft`

Diese fünf sind Satzzeichen, keine Untermalung. Reden zu Ende sprechen, kurze
Pause, Signal, dann weiterreden. Wer darüber spricht, macht aus einem
Sendezeichen einen Störer. Beim Sting und beim Challenge-Start ist die Pause
ohnehin vorgesehen: beide enden in Stille, die Teil des Signals ist.

**Gruppe B · darf unter Sprache liegen**

`bop-intro-bett` · `bop-intro-bett-loop` · `bop-warnung-10min` ·
`bop-warnung-2min` · `bop-kriterium-klick` · `bop-frage-einblendung`

Diese sechs liegen mit dem Regler aus Tabelle 1 mindestens 8 LU unter dem
leisesten Signal, das allein steht, und tragen bewusst kein Fundament unter
400 Hz, also dort, wo die Stimme sitzt. Die beiden Warnungen sind reines Glas im
Hochton, sie kommen durch, ohne zu drängen.

**Ausnahme, die keine ist:** Das Intro-Bett läuft unter der Begrüßung, aber es
endet 600 ms vor Schluss in absoluter Stille. Diese Stille ist eingebaut, damit
der erste inhaltliche Satz frei steht. Nicht wegschneiden.

---

## 3. Einbindung in OBS

### 3.1 Medienquelle anlegen

Für jedes Signal eine eigene Medienquelle. Einmalig, danach steht es.

1. In OBS eine Szene wählen, die immer aktiv ist, zum Beispiel `01 Standby`.
   Besser noch: eine eigene Szene `00 Sound` anlegen, die nie auf Sendung geht,
   und alle elf Quellen dort hineinlegen. Über „Quelle in Szene einfügen" sind
   sie dann in jeder Szene verfügbar, ohne elf Kopien zu pflegen.
2. `+ → Medienquelle`, Name genau wie die Datei, also `bop-sting-marke`.
3. **Lokale Datei** ankreuzen, Datei aus `public/sound/` wählen.
4. Diese Haken entscheiden über den Livebetrieb:
   - [ ] **Wiedergabe wiederholen** · aus. Nur beim Intro-Bett-Loop an
   - [ ] **Neu starten, wenn die Quelle aktiv wird** · aus. Sonst spielt jedes
         Signal bei jedem Szenenwechsel ungefragt los
   - [x] **Bei Ende der Wiedergabe schließen** · an, gibt die Datei wieder frei
   - [ ] Quelle beim Nichtanzeigen deaktivieren · aus, sonst greift der Hotkey
         nicht, wenn die Szene gerade nicht dran ist

### 3.2 Regler einstellen

Rechtsklick auf die Quelle, `Erweiterte Audioeigenschaften`, in der Spalte
`Lautstärke` von Prozent auf **dB** umstellen und den Wert aus Tabelle 1
eintragen. Das ist der ganze Mix. Danach nie wieder anfassen.

Alle Werte sind null oder negativ, deshalb reicht auch der normale Schieber im
Mixer. Wer einen positiven Wert einträgt, hebelt die Aussteuerung aus: Bei
+2 dB auf dem Sting stünde die Spitze bei +0,3 dBTP, also im Übersteuern.

In derselben Maske: **Audio-Monitoring** auf `Nur Monitor` stellen, wenn der Ton
im Kopfhörer der Regie liegen soll, auf `Monitor und Ausgabe`, wenn er in den
Stream soll. Für alle elf Signale gilt `Monitor und Ausgabe`, sonst hört das
Publikum nichts.

### 3.3 Hotkeys

`Einstellungen → Hotkeys`, dort steht unter jedem Quellennamen
**„Medienquelle neu starten"**. Genau diese Zeile belegen, nicht „Abspielen",
sonst startet ein zweiter Druck nicht neu.

Vorschlag, konfliktarm, weil OBS die F-Tasten selbst nicht belegt:

| Taste | Signal | Merkhilfe |
|---|---|---|
| `F1` | `bop-sting-marke` | Anfang und Ende |
| `F2` | `bop-intro-bett` | Bett darunter |
| `F3` | `bop-segment-wechsel` | jeder Bumper |
| `F4` | `bop-challenge-start` | Uhr läuft |
| `F5` | `bop-kriterium-klick` | Haken gesetzt |
| `F6` | `bop-frage-einblendung` | Frage im Bild |
| `F7` | `bop-warnung-10min` | gelb |
| `F8` | `bop-warnung-2min` | rot |
| `F9` | `bop-zeit-aus` | Schluss |
| `F10` | `bop-geschafft` | vorzeitig fertig |

`F5` und `F6` sind die einzigen Tasten, die während der Challenge häufig
gedrückt werden. Sie liegen deshalb nebeneinander und in der Mitte.

**Wichtig:** OBS nimmt Hotkeys nur an, wenn das OBS-Fenster im Vordergrund ist,
solange in `Einstellungen → Hotkeys` nicht die globale Erfassung aktiv ist.
Während der Challenge liegt der Fokus im Editor, nicht in OBS. Deshalb vor der
ersten Sendung prüfen, ob die Tasten auch aus dem Editor heraus auslösen. Tun
sie es nicht, gehört die Tonauslösung auf das zweite Gerät neben die Regie,
nicht auf die Tastatur, an der gebaut wird.

### 3.4 Prüfung vor Sendung

Fester Teil des Vorlaufs, zusammen mit dem Blick auf den Programmausgang:

1. Alle elf Hotkeys einmal durchdrücken, Pegel im OBS-Mixer beobachten.
2. Kein Signal darf den Mixer über **-2 dB** treiben. Schlägt eines höher aus,
   steht ein Regler falsch.
3. Beim Sting und beim Challenge-Start hörbar prüfen, dass die Schluss-Stille
   da ist. Fehlt sie, wurde die falsche Datei geladen.

---

## 4. Neu erzeugen

```bash
python3 scripts/sound.py
```

Läuft ohne Abhängigkeiten, reine Standardbibliothek. ffmpeg wird nur zum Messen
und für die MP3-Fassung benutzt. Laufzeit etwa 18 Sekunden.

Das Skript überschreibt beide Sätze, misst jede geschriebene Datei sofort mit
ffmpeg gegen und korrigiert Verstärkung und Begrenzerdecke so lange, bis
Lautheit und True Peak stehen. Am Ende steht eine Tabelle mit allen Messwerten.
Steht darunter „Alle Werte im Rahmen", ist der Satz sendefertig.

**Deterministisch:** Alles Rauschen läuft über feste Startwerte, auch der
Dither. Zwei Läufe liefern bitgleiche Dateien. Prüfen mit:

```bash
shasum -a 256 public/sound/*.wav
```

### Was noch entsteht

| Ordner | Inhalt |
|---|---|
| `public/sound/` | **Der Sendesatz.** Alle Dateien auf -16 LUFS, Regie über den OBS-Regler |
| `public/sound/sendemix/` | Dieselben elf Signale mit **eingebrannter** Pegel-Hierarchie. Nur nötig für einen Zuspieler ohne Regler, etwa einen Hardware-Sampler |

Im Sendebetrieb wird **ausschließlich `public/sound/`** benutzt. Wer beide Sätze
mischt, hebelt die Regie aus.

> **Altlast:** Der Ordner `public/sound/norm-16lufs/` stammt aus einem früheren
> Lauf, liegt noch in 24 Bit vor und ist durch `public/sound/` vollständig
> ersetzt. Er wird nicht mehr erzeugt. Löschen erst nach Toms Go.

---

## 5. Zwei bewusste Abweichungen

Beide sind gemessen, nicht behauptet.

### 5.1 Kurze Signale sind auf 600 ms verlängert

Betrifft `bop-kriterium-klick` (240 ms hörbar) und `bop-frage-einblendung`
(450 ms hörbar). Angehängt ist bitgenaue Stille, der Klang selbst ist unberührt.

**Warum:** ITU-R BS.1770 misst Lautheit in Blöcken von 400 ms. Unter 600 ms
Dateilänge liefert dieselbe Datei je nach Länge Werte, die um mehrere LU
auseinanderliegen, ein 240-ms-Klick ist überhaupt nicht messbar. Gemessen an
derselben Datei: bei 450 ms ergab die Frage-Einblendung -12,8 LUFS, bei 500 ms
-14,7 LUFS, ab 600 ms stabil -16,2 LUFS. Ohne die Stille wäre keine belastbare
Abnahme möglich.

### 5.2 Der Kriterium-Klick steht auf -22,9 LUFS statt -16

Das ist die einzige Datei, die den Zielpegel nicht erreicht, und zwar
absichtlich.

**Warum:** Die Energie des Klicks liegt in etwa 50 Millisekunden. Um ihn über
ein 400-ms-Messfenster auf -16 LUFS zu heben, müsste der Begrenzer die Spitze um
**29,8 dB** herunterziehen. Gemessen an der Hüllkurve in 5-ms-Fenstern: das
Original fällt in den ersten 120 ms um 31 dB ab, die erzwungene Fassung nur noch
um 6 dB. Aus dem Klick wird ein flacher Stoß. Er klingt dann nicht mehr nach
einem Messgerät, das einrastet, sondern nach einem Handyspiel.

Deshalb hat der Generator einen **Qualitätsdeckel**: Der Begrenzer darf höchstens
9 dB absenken. Reicht das für den Zielpegel nicht, hat die Hüllkurve Vorrang und
die Datei bleibt leiser. Damit liegt die Formabweichung des Klicks bei 6,4 dB,
auf demselben Niveau wie die der Frage-Einblendung mit 5,9 dB.

**Folge für die Praxis: keine.** Der Klick ist ohnehin ein Untersignal. Sein
Regler steht auf -4,2 dB statt auf -11,1 dB, im Programm landet er dadurch auf
denselben -27,1 LUFS wie geplant. Der Unterschied liegt allein im Regler, nicht
im Klang.

---

## 6. Abnahmewerte

Gegengemessen mit `ffprobe` und `ffmpeg -af ebur128=peak=true` an jeder
ausgelieferten Datei.

| Prüfung | Ergebnis |
|---|---|
| Format | 48 kHz, 16 Bit, stereo, `pcm_s16le`, elf von elf |
| Lautheit | -15,8 bis -16,2 LUFS, zehn von elf. Der Klick nach Abschnitt 5.2 |
| True Peak | -1,7 bis -4,0 dBTP, elf von elf unter der Grenze von -1 dBTP |
| MP3 320 kbit/s | True Peak identisch zur WAV, kein Übersteuern durch die Kodierung |
| Dateiränder | erstes und letztes Sample exakt 0, elf von elf. Kein Knacken |
| Gleichspannung | unter 4 · 10⁻⁶, elf von elf |
| Monokompatibilität | Seitenanteil höchstens 0,23. Nichts löscht sich aus, wenn YouTube auf dem Handy mono spielt |
| Stille im Intro-Bett | letzte 600 ms exakt 0 LSB, keine Rauschfahne durch den Dither |
| Determinismus | zwei vollständige Läufe bitgleich, per SHA-256 verglichen |

Das Runden von Gleitkomma auf 16 Bit läuft über einen Dreieck-Dither von einem
LSB. Er wird nur auf Samples ungleich null angewendet, damit echte Stille echte
Stille bleibt und die Dateiränder auf null liegen.
