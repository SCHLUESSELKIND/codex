# Thumbnail-Guide

Format **1280 × 720**. Der Test ist nicht der Monitor, der Test ist die
YouTube-Seitenleiste bei etwa 210 px Breite und die Startseite der App.

---

## Die fünf Templates

| Route | Marker | Markerfarbe | Layout | Wofür |
|---|---|---|---|---|
| `/yt/thumb/live-build` | LIVE BUILD | Rot | Portrait | gebaut wird live, es kann schiefgehen |
| `/yt/thumb/news` | SIGNAL | Weiß | Portrait | KI-News mit Praxisfilter |
| `/yt/thumb/test` | TEST | Weiß | Portrait | Modell oder Tool im Alltagstest |
| `/yt/thumb/talk` | TALK · Q&A | Weiß | Portrait | Gespräch, Zuschauerfragen |
| `/yt/thumb/signal` | BREAKING SIGNAL | Orange | Typo | Sonderfolge, etwas ist wirklich passiert |

Die Sorten unterscheiden sich über **Marker, Markerfarbe und Komposition**, nicht über
wechselnde Farbwelten. Über 50 Folgen bleibt die Kachelreihe dadurch erkennbar als eine
Sendung und trotzdem unterscheidbar nach Inhalt.

**Orange nur im Sondersignal.** Wenn jedes zweite Thumbnail orange ist, bedeutet es nichts mehr.
Faustregel: höchstens jede achte Folge.

---

## Texte setzen

Über Query-Parameter, ohne Codeänderung:

```
/#/yt/thumb/live-build?headline=KI-Agent in 30 Minuten&sub=Von null auf Produktion&episode=004
```

| Parameter | Wirkung |
|---|---|
| `headline` | Hauptaussage, drei bis sechs Wörter |
| `sub` | eine Zeile darunter, optional, weglassen wenn die Headline trägt |
| `marker` | überschreibt das Template-Label |
| `episode` | Nummer in der Fußzeile |

Die Schriftgröße staffelt sich automatisch nach Textlänge (78 / 88 / 104 px, Typo-Layout
108 / 132 px), damit die Headline nie über drei Zeilen läuft.

---

## Harte Regeln

1. **Maximal sechs Wörter.** Wer sieben braucht, hat den Kern nicht gefunden.
2. **Maximal drei Zeilen.** Vier Zeilen sind in der Seitenleiste Matsch.
3. **Ein primäres Motiv.** Entweder das Portrait trägt, oder die Typo trägt. Nie beides gleich laut.
4. **Textzone links, Portraitzone rechts** (ab x = 760). Die Silhouette entsteht aus dieser Trennung.
5. **Kein Screenshot ohne Vergrößerung.** Ein UI-Ausschnitt muss so groß sein, dass man
   ihn bei 210 px noch als das erkennt, was er ist.
6. **Keine Pfeile, keine Kringel, keine aufgerissenen Augen.** Die Spannung kommt aus
   der Aussage und dem Kontrast, nicht aus Effekten.
7. **Die Fußzeile bleibt immer drin.** `BUILD▌ ON PURPOSE #001`. Sie ist bei kleiner
   Darstellung nicht mehr lesbar, aber sie wird als Muster wiedererkannt. Genau das ist ihr Zweck.

---

## Freigegebene Beispieltexte

- ICH BAUE DEN AGENTEN LIVE
- DIESE KI ÄNDERT DEN WORKFLOW
- WAS DIESE WOCHE WIRKLICH ZÄHLT
- FUNKTIONIERT DAS IM MITTELSTAND?
- KEIN HYPE. EIN SYSTEM.
- DER BUILD IST GESCHEITERT
- KI-AGENT IN 30 MINUTEN
- DAS MODELL IST NICHT DAS PRODUKT

„DER BUILD IST GESCHEITERT" ist bewusst dabei. Ehrlichkeit über Reichweite ist hier
kein Verzicht, sondern das Markenversprechen.

---

## Portrait

Der Portrait-Slot lädt `public/portraits/tom-thumb.png`.
Fehlt die Datei, erscheint ein markierter Platzhalter, kein erfundenes Gesicht.

Anforderungen an die Datei:

- 520 × 720 px oder größer, gleiches Seitenverhältnis
- PNG mit Transparenz (Freisteller) oder auf `#060606` freigestellt
- Kopf im oberen Drittel, Blick zur Textzone hin oder in die Kamera
- Kantenlicht von links, damit die Silhouette gegen Schwarz stehen bleibt

Empfehlung: zwei bis drei Grundhaltungen fotografieren (neutral erklärend, konzentriert
am Rechner, direkt in die Kamera) und je nach Template wechseln. Nicht mehr, sonst
zerfällt die Wiedererkennung.

---

## Export

Siehe `EXPORT_GUIDE.md`. Kurzfassung: Route im Browser öffnen, Fenster auf 1280 × 720,
Screenshot des Stage-Bereichs, als PNG speichern, Benennung
`bop-thumb-<nummer>-<template>.png`.
