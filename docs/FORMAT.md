# Sendeformat

**75 Minuten, fünf Segmente.** Der Ton ist trocken, selbstironisch und informativ.
Die Form bleibt streng. Der Witz liegt in der Sache, nie in der Verpackung.

---

## Ablauf

| Zeit | Segment | Minuten | Ansicht in OBS |
|---|---|---|---|
| 00:00 | **INTRO** | 7 | `02 Kamera` |
| 07:00 | **NEWS** | 12 | `10 Newsroom` |
| 19:00 | **fAILs** | 6 | `12 fAILs` |
| 25:00 | **BUILD** | 45 | `11 Challenge` |
| 70:00 | **OUTRO** | 5 | `02 Kamera`, dann `08 Ende` |

Vor jedem Segment läuft der passende Bumper (`BUMPER intro` bis `BUMPER outro`),
etwa drei Sekunden, danach wird zurückgeschnitten.

---

## Die Challenge

Der Kern der Sendung. **45 Minuten, ein komplettes Werkzeug**, von null gebaut:
eine Mini-App, ein Tool, eine Website. Kein vorbereitetes Repository, kein Netz.

### Ergebnis-Lock

Vor dem Start wird das Ziel eingefroren. Es steht dann die ganze Sendung im Bild
und ist nicht mehr änderbar. Das ist die wichtigste Regel des Formats: Ohne
festes Ziel gibt es kein ehrliches Ergebnis, sondern nur nachträgliche Ausreden.

Zum Ziel gehören **drei bis fünf Abnahmekriterien**, die während des Builds
abgehakt werden. Sie müssen so formuliert sein, dass ein Zuschauer sie selbst
beurteilen kann. Nicht „sauber gebaut", sondern „PDF rein, Buchungssatz raus".

In der Regie: Ziel und Kriterien eintragen, dann **„Ziel locken und starten"**.
Ab da läuft die Uhr, das Ziel ist gesperrt.

### Die Uhr

| Restzeit | Farbe | Bedeutung |
|---|---|---|
| über 10 Minuten | hell | ruhig |
| 10 bis 2 Minuten | gelb | Aufmerksamkeit |
| unter 2 Minuten | rot | Dringlichkeit |
| letzte Minute | rot, pulsierend | letzter Aufruf |
| geschafft | grün | vor Ablauf fertig |

Die Uhr kann angehalten werden, etwa für eine Zwischenfrage. Die Pause wird
sauber verrechnet, ein Reload der Browserquelle verfälscht nichts.

### Wenn es nicht klappt

Dann läuft die Uhr ab und das Ergebnis ist unvollständig. **Das wird gezeigt,
nicht kaschiert.** Eine Sendung, in der immer alles gelingt, glaubt niemand.
Der Thumbnail-Pool enthält deshalb bewusst „Der Build ist gescheitert" und
„Ich habe es nicht geschafft".

---

## fAILs

Jede Folge stellt ein Werkzeug vor, das KI falsch einsetzt, sinnlos ist oder
schlicht merkwürdig. Sechs Minuten, eine Karte, drei Blöcke:

1. **Verspricht** · das Werbeversprechen des Anbieters, wörtlich zitiert
2. **Tut tatsächlich** · was es wirklich macht, trocken beschrieben
3. **Sinnlosigkeit** · Bewertung von 1 bis 5

Der Witz entsteht aus dem Abstand zwischen Versprechen und Realität. Er wird
nicht dazuerzählt.

### Recherche vor jeder Folge

Die Rubrik lebt von echten Funden, nicht von Behauptungen. Deshalb gilt:

- **Quelle ist Pflicht.** Herstellerseite, Produktvideo, App-Store-Eintrag oder
  Pressemitteilung, mit Abrufdatum. Ohne Beleg kommt der Fund nicht in die Sendung.
- **Wörtlich zitieren.** Das Versprechen wird nicht sinngemäß wiedergegeben,
  sondern in Anführungszeichen gesetzt. Sonst ist es Polemik statt Beobachtung.
- **Selbst angesehen.** Was nur aus zweiter Hand bekannt ist, wird nicht gezeigt.
- **Die Sache, nicht die Person.** Kritisiert wird das Produkt und die
  Entscheidung dahinter, nie das Team, das es gebaut hat, und niemals namentlich
  einzelne Entwickler.
- **Keine kleinen Einzelkämpfer.** Ziel sind Produkte mit Marketingbudget und
  großem Versprechen, kein Hobbyprojekt aus einem Wochenende.

Ein Rechercheordner je Folge mit Links, Screenshots und Abrufdatum ist die
Grundlage. Bei Zweifeln an der Belegbarkeit fällt der Fund raus.

---

## Bumper und Übergänge

Die fünf Bumper sind Vollbildkarten mit eigener Farbe je Segment:

| Segment | Farbe | Grund |
|---|---|---|
| Intro | hell | neutral, die Sendung beginnt |
| News | orange | Signalton der ZehnX-Herkunft |
| fAILs | gelb | die Rubrik grinst, ohne zu schreien |
| Build | rot | Aktion, hier passiert die Arbeit |
| Outro | grau | Rückblick, ruhiger Ausklang |

Rot bleibt der Challenge und dem LIVE-Zeichen vorbehalten, damit es seine
Bedeutung behält.

**Überblendung:** In OBS für die Bumper-Szenen einen Übergang von 200 ms
einstellen, zurück ins Sendebild ebenfalls 200 ms. Länger wirkt zäh, kürzer
wirkt wie ein Fehler. Die Karte selbst braucht etwa 900 ms, bis sie steht,
sie sollte also mindestens zwei Sekunden stehen bleiben.

---

## Regie während der Sendung

Das Panel liegt unter `/control` und darf in einem ganz normalen Browserfenster
laufen, auf einem zweiten Bildschirm.

1. **Vor Sendebeginn** · Episodennummer, Ablauf, Newsroom-Meldungen und den
   fAILs-Fund eintragen. Challenge-Ziel und Kriterien vorbereiten, aber noch
   **nicht** locken.
2. **Segmentwechsel** · oben im Panel das Segment umschalten, in OBS den Bumper
   fahren, dann in die Zielansicht.
3. **Challenge-Start** · „Ziel locken und starten". Ab hier ist das Ziel fest.
4. **Während des Builds** · Kriterien abhaken, sobald sie erfüllt sind.
   Zuschauerfragen über das Chat-Feld einblenden.
5. **Ende der Challenge** · entweder „Geschafft" drücken oder die Uhr auslaufen
   lassen. Beides ist ein Ergebnis.
