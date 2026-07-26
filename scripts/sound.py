#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
BUILD ON PURPOSE · Sound-Generator
==================================

Erzeugt das komplette Klangsystem der Sendung aus DREI Bausteinen und EINEM Motiv.

WARUM ueberhaupt Synthese statt Sample-Bibliothek:
Gekaufte Stings tragen die Handschrift fremder Formate. Hier ist jeder Ton aus
demselben Grundton A1 = 55,00 Hz abgeleitet und quartal gestapelt (A, D, E).
Quartal heisst: weder Dur noch Moll, also weder froehlich noch traurig. Genau der
Ton eines Formats, das misst statt feiert.

Reine Standardbibliothek: wave, math, struct, array, random, subprocess, os.
ffmpeg wird ausschliesslich zum Messen, Trimmen und fuer die MP3-Fassung benutzt.
Deterministisch: alles Rauschen laeuft ueber feste Startwerte, zwei Laeufe
liefern bitgleiche Dateien.

Aufruf:  python3 scripts/sound.py
"""

import array
import math
import os
import random
import re
import struct
import subprocess
import sys
import wave

# ---------------------------------------------------------------------------
# Grundfesten
# ---------------------------------------------------------------------------

SR = 48000
TWO_PI = 2.0 * math.pi

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT_DIR = os.path.join(ROOT, "public", "sound")
NORM_DIR = os.path.join(OUT_DIR, "norm-16lufs")
FFMPEG = "/opt/homebrew/bin/ffmpeg"
FFPROBE = "/opt/homebrew/bin/ffprobe"

# Der Tonvorrat. Nichts ausserhalb dieser Liste kommt in irgendeiner Datei vor.
A1, D2, E2 = 55.00, 73.42, 82.41
A2, D3, E3 = 110.00, 146.83, 164.81
A3, D4, E4 = 220.00, 293.66, 329.63
A4, C5, D5, E5 = 440.00, 523.25, 587.33, 659.26
A5, D6, E6 = 880.00, 1174.66, 1318.51
A6, E7 = 1760.00, 2637.02

# Taktraster 100 BPM. Deckungsgleich mit dem Motion-System im Bild.
SECHZEHNTEL, ACHTEL, VIERTEL, TAKT = 150.0, 300.0, 600.0, 2400.0

# BAUSTEIN C "Glas": festes Partialverhaeltnis, in JEDER Datei identisch.
# Die unteren drei Partiale ergeben auf jedem Anschlagston wieder Quarte und
# Oktave (880 Hz erzeugt 1318 Hz = E6 und 1760 Hz = A6), die oberen sind bewusst
# inharmonisch. Dadurch klingt es metallisch, bleibt aber gestimmt.
C_RATIOS = (1.000, 1.498, 2.000, 2.667, 3.512, 4.207)
C_LEVELS = (0.0, -7.0, -5.0, -12.0, -16.0, -22.0)
C_DECAYS = (1400.0, 900.0, 1100.0, 520.0, 300.0, 180.0)


def db(x):
    """dBFS in linearen Faktor."""
    return 10.0 ** (x / 20.0)


def ms(t):
    """Millisekunden in Samples."""
    return int(round(t * SR / 1000.0))


# ---------------------------------------------------------------------------
# Wellenformen als Wavetable
# ---------------------------------------------------------------------------
# WARUM Wavetable statt naiver Rampe: eine mathematisch exakte Dreieck- oder
# Saegezahnflanke erzeugt Aliasing, also Toene, die nicht im Tonvorrat stehen.
# Die Tabellen sind bandbegrenzt aufgebaut, damit ausser den gewollten Frequenzen
# nichts entsteht. Ausserdem ist Tabellenlesen deutlich schneller als eine
# Summe aus Sinusfunktionen pro Sample.

TABLE_N = 8192


def _make_triangle_table(odd_harmonics=15):
    tab = [0.0] * TABLE_N
    norm = 8.0 / (math.pi ** 2)
    for i in range(TABLE_N):
        p = TWO_PI * i / TABLE_N
        s = 0.0
        for h in range(odd_harmonics):
            k = 2 * h + 1
            s += ((-1.0) ** h) * math.sin(k * p) / (k * k)
        tab[i] = norm * s
    peak = max(abs(v) for v in tab)
    return [v / peak for v in tab]


def _make_saw_table(harmonics=48):
    tab = [0.0] * TABLE_N
    for i in range(TABLE_N):
        p = TWO_PI * i / TABLE_N
        s = 0.0
        for k in range(1, harmonics + 1):
            s += math.sin(k * p) / k
        tab[i] = s
    peak = max(abs(v) for v in tab)
    return [v / peak for v in tab]


WT_TRI = _make_triangle_table()
WT_SAW = _make_saw_table()


def wavetable(tab, freq, n, phase=0.0):
    """Liest eine Tabelle mit linearer Interpolation aus."""
    out = [0.0] * n
    step = freq * TABLE_N / SR
    pos = phase * TABLE_N
    N = TABLE_N
    for i in range(n):
        idx = int(pos)
        frac = pos - idx
        a = tab[idx % N]
        b = tab[(idx + 1) % N]
        out[i] = a + (b - a) * frac
        pos += step
        if pos >= N:
            pos -= N
    return out


def sine(freq, n, phase=0.0):
    inc = TWO_PI * freq / SR
    p = TWO_PI * phase
    return [math.sin(p + inc * i) for i in range(n)]


def sine_glide(f_start, f_end, glide_ms, n):
    """
    Sinus mit exponentieller Tonhoehen-Huellkurve.
    WARUM exponentiell und nicht linear: der Bauch des Falls liegt dadurch in den
    ersten 20 ms. Das Ohr hoert einen Anschlag, kein Herunterfahren.
    """
    out = [0.0] * n
    g = max(1.0, glide_ms * SR / 1000.0)
    phase = 0.0
    for i in range(n):
        if i < g:
            f = f_end + (f_start - f_end) * math.exp(-5.0 * i / g)
        else:
            f = f_end
        out[i] = math.sin(TWO_PI * phase)
        phase += f / SR
        if phase >= 1.0:
            phase -= 1.0
    return out


def noise(n, seed):
    """Weisses Rauschen mit festem Startwert, damit jeder Lauf identisch ist."""
    rnd = random.Random(seed)
    return [rnd.random() * 2.0 - 1.0 for _ in range(n)]


# ---------------------------------------------------------------------------
# Huellkurven
# ---------------------------------------------------------------------------

def env_ahd(n, attack_ms, hold_ms=0.0, decay_ms=100.0):
    """
    Attack linear, Hold konstant, Decay exponentiell auf -60 dB.
    WARUM exponentiell: ein linearer Abfall klingt synthetisch abgeschnitten.
    Physikalische Koerper geben Energie exponentiell ab, deshalb klingt das Ohr
    das als Material und nicht als Regler.
    """
    a = ms(attack_ms)
    h = ms(hold_ms)
    out = [0.0] * n
    k = 6.907755 / max(1.0, decay_ms * SR / 1000.0)  # ln(1000) = -60 dB
    for i in range(n):
        if i < a:
            out[i] = (i + 1) / float(a + 1) if a > 0 else 1.0
        elif i < a + h:
            out[i] = 1.0
        else:
            out[i] = math.exp(-k * (i - a - h))
    return out


def tail_fade(buf, fade_ms=5.0):
    """
    Linearer Auslauf auf exakt Null.
    WARUM: die Exponentialkurve erreicht nie Null. Ohne diesen Auslauf steht am
    Ende eines Layers ein Sprung von etwa -60 dBFS auf Null, und der knackt.
    """
    f = min(ms(fade_ms), len(buf))
    for i in range(f):
        buf[len(buf) - f + i] *= 1.0 - (i + 1) / float(f)
    return buf


def normalize_peak(buf, peak_db):
    p = max((abs(v) for v in buf), default=0.0)
    if p <= 0.0:
        return buf
    g = db(peak_db) / p
    return [v * g for v in buf]


# ---------------------------------------------------------------------------
# Filter (Biquad, RBJ-Kochbuch). 12 dB/Okt entspricht genau einem Biquad.
# ---------------------------------------------------------------------------

def _bq(b0, b1, b2, a0, a1, a2):
    return (b0 / a0, b1 / a0, b2 / a0, a1 / a0, a2 / a0)


def coef_lowpass(f0, q=0.70710678):
    w = TWO_PI * f0 / SR
    c, s = math.cos(w), math.sin(w)
    al = s / (2.0 * q)
    return _bq((1 - c) / 2, 1 - c, (1 - c) / 2, 1 + al, -2 * c, 1 - al)


def coef_highpass(f0, q=0.70710678):
    w = TWO_PI * f0 / SR
    c, s = math.cos(w), math.sin(w)
    al = s / (2.0 * q)
    return _bq((1 + c) / 2, -(1 + c), (1 + c) / 2, 1 + al, -2 * c, 1 - al)


def coef_bandpass(f0, q):
    w = TWO_PI * f0 / SR
    c, s = math.cos(w), math.sin(w)
    al = s / (2.0 * q)
    return _bq(al, 0.0, -al, 1 + al, -2 * c, 1 - al)


def coef_peaking(f0, q, gain_db):
    A = 10.0 ** (gain_db / 40.0)
    w = TWO_PI * f0 / SR
    c, s = math.cos(w), math.sin(w)
    al = s / (2.0 * q)
    return _bq(1 + al * A, -2 * c, 1 - al * A, 1 + al / A, -2 * c, 1 - al / A)


def biquad(x, co):
    b0, b1, b2, a1, a2 = co
    y = [0.0] * len(x)
    x1 = x2 = y1 = y2 = 0.0
    for i, xn in enumerate(x):
        yn = b0 * xn + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2
        y[i] = yn
        x2, x1 = x1, xn
        y2, y1 = y1, yn
    return y


def biquad_sweep(x, cutoffs, q=0.70710678, block=64):
    """
    Tiefpass mit wanderender Grenzfrequenz (fuer den atmenden Drone im Bett).
    Die Koeffizienten werden blockweise neu gerechnet. 64 Samples entsprechen
    1,3 ms, damit ist die Bewegung stufenlos, ohne dass pro Sample gerechnet wird.
    """
    y = [0.0] * len(x)
    x1 = x2 = y1 = y2 = 0.0
    i = 0
    n = len(x)
    while i < n:
        co = coef_lowpass(max(40.0, min(cutoffs[i], SR * 0.45)), q)
        b0, b1, b2, a1, a2 = co
        end = min(i + block, n)
        for j in range(i, end):
            xn = x[j]
            yn = b0 * xn + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2
            y[j] = yn
            x2, x1 = x1, xn
            y2, y1 = y1, yn
        i = end
    return y


def dc_block(buf):
    m = sum(buf) / len(buf) if buf else 0.0
    return [v - m for v in buf]


def saturate_tanh(buf, drive=1.2, bias=0.15):
    """
    tanh-Saettigung mit kleinem Gleichanteil vor der Kennlinie.
    WARUM der Gleichanteil: tanh allein ist eine ungerade Funktion und erzeugt nur
    ungerade Harmonische. Der Sub soll aber die ZWEITE Harmonische bekommen, also
    110 Hz ueber 55 Hz. Erst die Asymmetrie erzeugt sie. Der Gleichanteil wird
    danach wieder abgezogen, sonst wandert die Nulllinie.
    """
    k = math.tanh(bias * drive)
    return [(math.tanh(drive * (v + bias)) - k) for v in buf]


def compressor(buf, ratio=2.0, attack_ms=8.0, release_ms=120.0, max_gr_db=3.0,
               headroom_db=6.0):
    """
    Bus-Kompressor, hoechstens 3 dB Reduktion.
    WARUM so wenig: der Sting soll zusammengehalten wirken, nicht gepresst.
    Alles darueber wuerde die Stille zwischen den Ereignissen anheben, und genau
    diese Stille ist Teil des Logos.
    """
    peak = max((abs(v) for v in buf), default=0.0)
    if peak <= 0.0:
        return buf
    thr = 20.0 * math.log10(peak) - headroom_db
    at = math.exp(-1.0 / (attack_ms * 0.001 * SR))
    rel = math.exp(-1.0 / (release_ms * 0.001 * SR))
    env = 0.0
    out = [0.0] * len(buf)
    for i, v in enumerate(buf):
        a = abs(v)
        env = a + (at if a > env else rel) * (env - a)
        if env <= 1e-9:
            out[i] = v
            continue
        lvl = 20.0 * math.log10(env)
        over = lvl - thr
        gr = 0.0 if over <= 0 else min(max_gr_db, over * (1.0 - 1.0 / ratio))
        out[i] = v * (10.0 ** (-gr / 20.0))
    return out


# ---------------------------------------------------------------------------
# Plattenhall (Schroeder-Netzwerk)
# ---------------------------------------------------------------------------

class Plate:
    """
    Plattenhall als Kammfilter-Bank mit Allpass-Kette.
    WARUM kein echter Faltungshall: eine Faltung mit 1,6 s Impulsantwort waere in
    reinem Python nicht rechenbar. Das Netzwerk klingt bei diesen kurzen Fahnen
    identisch dicht und laeuft in Echtzeitgroessenordnung.
    WARUM ueberhaupt Hall: er ersetzt Lautstaerke. Die Warnungen duerfen leise
    sein und trotzdem im Raum stehen, deshalb tragen sie Hall statt Pegel.
    """

    COMB = (1214, 1293, 1390, 1476, 1548, 1623, 1695, 1760)
    AP_L = (605, 480, 371, 245)
    AP_R = (628, 503, 394, 268)

    def __init__(self, rt60=1.0, damp_hz=7000.0, predelay_ms=15.0, width=0.25):
        self.rt60 = rt60
        self.predelay = ms(predelay_ms)
        self.width = width
        self.damp = math.exp(-TWO_PI * damp_hz / SR)
        self.fb = [10.0 ** (-3.0 * d / SR / rt60) for d in self.COMB]
        self.tail = int(rt60 * 1.8 * SR)
        self.gain = 1.0
        self.gain = 1.0 / max(1e-9, self._impulse_peak())

    def _run(self, mono):
        n = len(mono)
        combs = [[0.0] * d for d in self.COMB]
        idx = [0] * len(self.COMB)
        store = [0.0] * len(self.COMB)
        damp = self.damp
        acc = [0.0] * n
        for ci in range(len(self.COMB)):
            buf = combs[ci]
            dlen = self.COMB[ci]
            g = self.fb[ci]
            p = 0
            f = 0.0
            for i in range(n):
                out = buf[p]
                acc[i] += out
                f = out * (1.0 - damp) + f * damp
                buf[p] = mono[i] + f * g
                p += 1
                if p >= dlen:
                    p = 0
            store[ci] = f
        inv = 1.0 / len(self.COMB)
        acc = [v * inv for v in acc]

        def allpass_chain(sig, delays):
            cur = sig
            for d in delays:
                buf = [0.0] * d
                p = 0
                out = [0.0] * len(cur)
                for i, xn in enumerate(cur):
                    bo = buf[p]
                    out[i] = -xn + bo
                    buf[p] = xn + bo * 0.5
                    p += 1
                    if p >= d:
                        p = 0
                cur = out
            return cur

        return allpass_chain(acc, self.AP_L), allpass_chain(acc, self.AP_R)

    def _impulse_peak(self):
        n = min(self.tail, SR)
        imp = [0.0] * n
        imp[0] = 1.0
        l, r = self._run(imp)
        return max(max(abs(v) for v in l), max(abs(v) for v in r))

    def process(self, mono, out_len):
        """Gibt den Nasseanteil als Stereopaar zurueck, Breite hart begrenzt."""
        sig = [0.0] * self.predelay + list(mono)
        need = out_len + self.tail
        if len(sig) < need:
            sig = sig + [0.0] * (need - len(sig))
        l, r = self._run(sig)
        g = self.gain
        w = self.width
        L = [0.0] * out_len
        R = [0.0] * out_len
        for i in range(out_len):
            a = l[i] * g
            b = r[i] * g
            mid = 0.5 * (a + b)
            side = 0.5 * (a - b) * w  # +/- 25 Prozent, damit Mono trotzdem steht
            L[i] = mid + side
            R[i] = mid - side
        return L, R


# ---------------------------------------------------------------------------
# Mischbus
# ---------------------------------------------------------------------------

class Bus:
    """Trockene Stereosumme plus ein Aux-Weg in den Hall."""

    def __init__(self, dur_ms):
        self.n = ms(dur_ms)
        self.L = [0.0] * self.n
        self.R = [0.0] * self.n
        self.send = [0.0] * self.n

    def add(self, mono, t_ms=0.0, pan=0.0, send_db=None, gain=1.0):
        off = ms(t_ms)
        # Konstante Leistung beim Panorama: die Summe bleibt beim Mono-Falten
        # gleich laut und nichts loescht sich aus.
        gl = math.cos((pan + 1.0) * math.pi / 4.0) * math.sqrt(2.0) * gain
        gr = math.sin((pan + 1.0) * math.pi / 4.0) * math.sqrt(2.0) * gain
        sg = db(send_db) * gain if send_db is not None else 0.0
        L, R, S, n = self.L, self.R, self.send, self.n
        for i, v in enumerate(mono):
            j = off + i
            if j >= n:
                break
            if j < 0:
                continue
            L[j] += v * gl
            R[j] += v * gr
            if sg:
                S[j] += v * sg


def mix_wet(bus, plate, wet_env=None):
    """Mischt die Hallfahne dazu. wet_env erlaubt es, den Raum zu schliessen."""
    if plate is None or not any(bus.send):
        return bus.L, bus.R
    wl, wr = plate.process(bus.send, bus.n)
    if wet_env is not None:
        wl = [v * e for v, e in zip(wl, wet_env)]
        wr = [v * e for v, e in zip(wr, wet_env)]
    return ([a + b for a, b in zip(bus.L, wl)],
            [a + b for a, b in zip(bus.R, wr)])


# ---------------------------------------------------------------------------
# DIE DREI BAUSTEINE
# ---------------------------------------------------------------------------

def baustein_a(peak_db, attack_ms=4.0, hold_ms=30.0, decay_ms=620.0,
               f_start=E2, f_end=A1, glide_ms=90.0, drive=1.2, hp_hz=30.0):
    """
    BAUSTEIN A "Fundament". Der Sub-Impuls, auf dem alles steht.
    WARUM der Tonhoehenfall von E2 auf A1: das Ohr liest einen fallenden Grundton
    als Aufsetzen, als Gewicht, das ankommt. Ein konstanter Ton waere nur ein
    Brummen. WARUM die Saettigung: 55 Hz sind auf Handylautsprechern nicht
    hoerbar. Die erzeugte zweite Harmonische bei 110 Hz traegt den Impuls dorthin,
    ohne dass die Datei lauter wird.
    """
    n = ms(attack_ms + hold_ms + decay_ms)
    if f_start == f_end or glide_ms <= 0:
        osc = sine(f_end, n)
    else:
        osc = sine_glide(f_start, f_end, glide_ms, n)
    env = env_ahd(n, attack_ms, hold_ms, decay_ms)
    sig = [o * e for o, e in zip(osc, env)]
    if drive:
        sig = dc_block(saturate_tanh(sig, drive))
    sig = biquad(sig, coef_highpass(hp_hz))
    return tail_fade(normalize_peak(sig, peak_db), 8.0)


def baustein_b(level_db, bp_hz=3520.0, bp_q=6.0, noise_decay_ms=22.0,
               layers=(1, 2, 3), seed=1877,
               body_hz=A3, body_decay_ms=45.0,
               ping_hz=A6, ping_decay_ms=14.0):
    """
    BAUSTEIN B "Raster". Der Klick, die Mechanik der Sendung.
    Drei Schichten gleichzeitig: gefiltertes Rauschen fuer das Reibgeraeusch,
    ein hoher Sinus fuer die Praezision, ein tiefer Sinus fuer den Koerper.
    WARUM die dritte Schicht auf 220 Hz: ohne Koerper klingt ein Klick nach
    Software-Ton. Mit Koerper klingt er nach einem Schalter aus Metall.
    """
    n = ms(max(noise_decay_ms, ping_decay_ms, body_decay_ms) + 10.0)
    parts = []
    if 1 in layers:
        nz = biquad(noise(n, seed), coef_bandpass(bp_hz, bp_q))
        e = env_ahd(n, 1.0, 0.0, noise_decay_ms)
        parts.append([v * x * db(-18.0) for v, x in zip(nz, e)])
    if 2 in layers:
        e = env_ahd(n, 0.5, 0.0, ping_decay_ms)
        parts.append([v * x * db(-22.0) for v, x in zip(sine(ping_hz, n), e)])
    if 3 in layers:
        e = env_ahd(n, 0.5, 0.0, body_decay_ms)
        parts.append([v * x * db(-26.0) for v, x in zip(sine(body_hz, n), e)])
    mixed = [sum(vals) for vals in zip(*parts)]
    return tail_fade(normalize_peak(mixed, level_db), 4.0)


def baustein_c(f0, peak_db, partials=(0, 1, 2, 3, 4, 5), attack_ms=2.0,
               levels=None, decays=None):
    """
    BAUSTEIN C "Glas". Die metallische Transiente, das Zeichen fuer Intelligenz.
    WARUM feste Partialverhaeltnisse statt echter Glockenphysik: die unteren drei
    Partiale reproduzieren auf jedem Anschlagston die Quarte und die Oktave des
    Systems. Dadurch bleibt das Glas immer im Tonvorrat der Marke, obwohl die
    oberen Partiale bewusst inharmonisch sind und den Metallcharakter erzeugen.
    """
    lv = levels if levels is not None else [C_LEVELS[p] for p in partials]
    dc = decays if decays is not None else [C_DECAYS[p] for p in partials]
    n = ms(attack_ms + max(dc) + 10.0)
    acc = [0.0] * n
    for k, p in enumerate(partials):
        f = f0 * C_RATIOS[p]
        if f >= SR * 0.45:
            continue
        e = env_ahd(n, attack_ms, 0.0, dc[k])
        g = db(lv[k])
        s = sine(f, n)
        for i in range(n):
            acc[i] += s[i] * e[i] * g
    return tail_fade(normalize_peak(acc, peak_db), 8.0)


def tone(table, freq, peak_db, attack_ms, decay_ms, hold_ms=0.0):
    """Ein einzelner Motivton. table=None bedeutet reiner Sinus."""
    n = ms(attack_ms + hold_ms + decay_ms)
    osc = sine(freq, n) if table is None else wavetable(table, freq, n)
    e = env_ahd(n, attack_ms, hold_ms, decay_ms)
    return tail_fade([o * x for o, x in zip(osc, e)], 8.0)


# ---------------------------------------------------------------------------
# Loudness nach ITU-R BS.1770-4 (K-Bewertung plus zweistufiges Gate)
# ---------------------------------------------------------------------------
# WARUM eigene Messung statt ffmpeg loudnorm: die kuerzeste Datei ist 240 ms lang,
# das Messfenster der Norm ist 400 ms. loudnorm liefert dort keinen brauchbaren
# Wert. Mit eigener Messung kann vor dem Schreiben exakt auf den Zielpegel
# gerechnet werden, und ffmpeg dient nur noch der Gegenpruefung.

KW1 = (1.53512485958697, -2.69169618940638, 1.19839281085285,
       -1.69065929318241, 0.73248077421585)
KW2 = (1.0, -2.0, 1.0, -1.99004745483398, 0.99007225036621)


def lufs_integrated(L, R):
    """Gated Loudness. Stille wird durch das absolute Gate ohnehin verworfen,
    deshalb darf zum Messen mit Stille aufgefuellt werden."""
    need = int(2.0 * SR)
    if len(L) < need:
        pad = [0.0] * (need - len(L))
        L = list(L) + pad
        R = list(R) + pad
    yl = biquad(biquad(L, KW1), KW2)
    yr = biquad(biquad(R, KW1), KW2)
    n = len(yl)
    cs = [0.0] * (n + 1)
    acc = 0.0
    for i in range(n):
        acc += yl[i] * yl[i] + yr[i] * yr[i]
        cs[i + 1] = acc
    blk = int(0.4 * SR)
    step = int(0.1 * SR)
    zs = []
    i = 0
    while i + blk <= n:
        zs.append((cs[i + blk] - cs[i]) / blk)
        i += step
    if not zs:
        return -70.0
    lo = [(-0.691 + 10.0 * math.log10(z)) if z > 0 else -200.0 for z in zs]
    keep = [z for z, l in zip(zs, lo) if l > -70.0]
    if not keep:
        return -70.0
    gamma = -0.691 + 10.0 * math.log10(sum(keep) / len(keep)) - 10.0
    keep2 = [z for z, l in zip(zs, lo) if l > -70.0 and l > gamma]
    if not keep2:
        keep2 = keep
    return -0.691 + 10.0 * math.log10(sum(keep2) / len(keep2))


def ms_ratio(L, R):
    """Mid/Side-Pruefung. Mono muss stehen, YouTube auf dem Handy ist mono."""
    mid = 0.0
    side = 0.0
    for a, b in zip(L, R):
        m = 0.5 * (a + b)
        s = 0.5 * (a - b)
        mid += m * m
        side += s * s
    if mid <= 0:
        return 0.0
    return math.sqrt(side / mid)


# ---------------------------------------------------------------------------
# Ausgabe
# ---------------------------------------------------------------------------

def finalize(L, R, fade_out_ms, hard_silence_from_ms=None):
    """
    Letzter Schliff vor dem Schreiben: Gleichanteil raus, Ausblendung rein,
    Anfang auf exakt Null. Ein Knacken am Dateirand faellt live sofort auf.
    """
    L = dc_block(L)
    R = dc_block(R)
    n = len(L)
    if hard_silence_from_ms is not None:
        h = ms(hard_silence_from_ms)
        for i in range(h, n):
            L[i] = 0.0
            R[i] = 0.0
        end = h
    else:
        end = n
    f = min(ms(fade_out_ms), end)
    for i in range(f):
        g = 1.0 - (i + 1) / float(f)
        L[end - f + i] *= g
        R[end - f + i] *= g
    # Anfang: alle Huellkurven starten bei Null, deshalb ist Sample 0 bereits
    # still. Falls doch nicht, greift eine Einblendung von 0,5 ms.
    if abs(L[0]) > 1e-4 or abs(R[0]) > 1e-4:
        f = ms(0.5)
        for i in range(f):
            g = (i + 1) / float(f)
            L[i] *= g
            R[i] *= g
    L[0] = 0.0
    R[0] = 0.0
    if end >= 1:
        L[end - 1] = 0.0
        R[end - 1] = 0.0
    return L, R


def write_wav24(path, L, R):
    lim = 8388607
    data = bytearray()
    ap = data.extend
    for a, b in zip(L, R):
        va = int(round(max(-1.0, min(1.0, a)) * lim))
        vb = int(round(max(-1.0, min(1.0, b)) * lim))
        ap(va.to_bytes(3, "little", signed=True))
        ap(vb.to_bytes(3, "little", signed=True))
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(3)
        w.setframerate(SR)
        w.writeframes(bytes(data))


def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True)


def measure_ffmpeg(path):
    """Gegenpruefung mit ffmpeg: integrierte Lautheit und True Peak."""
    dur = float(run([FFPROBE, "-v", "error", "-show_entries", "format=duration",
                     "-of", "csv=p=0", path]).stdout.strip() or 0.0)
    af = "ebur128=peak=true"
    if dur < 4.0:
        af = "apad=whole_dur=4,ebur128=peak=true"
    r = run([FFMPEG, "-hide_banner", "-nostats", "-i", path,
             "-af", af, "-f", "null", "-"])
    txt = r.stderr
    tail = txt[txt.rfind("Summary"):] if "Summary" in txt else txt
    def grab(label):
        m = re.search(label + r":\s*(-?\d+\.?\d*)", tail)
        return float(m.group(1)) if m else None
    return {
        "dur": dur,
        "I": grab("I"),
        "LRA": grab("LRA"),
        "tp": grab("Peak"),
    }


def probe(path):
    r = run([FFPROBE, "-v", "error", "-select_streams", "a:0",
             "-show_entries",
             "stream=sample_rate,channels,bits_per_raw_sample,codec_name",
             "-of", "csv=p=0", path])
    return r.stdout.strip()


def make_mp3(src, dst):
    run([FFMPEG, "-y", "-hide_banner", "-loglevel", "error", "-i", src,
         "-codec:a", "libmp3lame", "-b:a", "320k", "-ar", "48000", dst])


# ---------------------------------------------------------------------------
# DIE ZEHN SIGNALE
# ---------------------------------------------------------------------------

def sig_sting_marke():
    """
    bop-sting-marke · Das akustische Logo. Ein Takt.
    WARUM die zweite Haelfte leer bleibt: das Intervall steht bereits bei 150 ms
    vollstaendig. Alles danach ist Ausklang. Die Stille ist Teil des Logos, sie
    unterscheidet ein Sendezeichen von einem Jingle.
    """
    bus = Bus(TAKT)
    plate = Plate(rt60=1.1, damp_hz=7000.0, predelay_ms=18.0)

    # Fundament und Raster bleiben vollstaendig trocken. Sub im Hall wird Matsch,
    # und der Klick verliert im Hall genau die Praezision, fuer die er da ist.
    bus.add(baustein_a(-6.0, 4.0, 30.0, 620.0), 0.0)
    bus.add(baustein_b(-12.0), 0.0)

    # Motivton 1: A4 mit Oktave darueber.
    bus.add(tone(WT_TRI, A4, -14.0, 3.0, 260.0), 0.0)
    bus.add(tone(None, A5, -22.0, 3.0, 180.0), 0.0)

    # Motivton 2 auf der Sechzehntel: die Quarte aufwaerts. Nur dieser Ton und
    # das Glas gehen in den Raum, dadurch tritt die Quarte nach vorn.
    bus.add(tone(WT_TRI, D5, -11.0, 3.0, 900.0), SECHZEHNTEL, send_db=-20.0)
    bus.add(tone(None, D6, -20.0, 2.0, 420.0), SECHZEHNTEL, send_db=-20.0)
    bus.add(tone(None, D2, -14.0, 6.0, 700.0), SECHZEHNTEL)

    # Zaehlzeit 2: das Glas auf E6, dazu ein leiser zweiter Klick. Das ist das
    # Verriegeln, akustisch ein Riegel, der in eine Nut faellt.
    bus.add(baustein_c(E6, -16.0), VIERTEL, send_db=-20.0)
    bus.add(baustein_b(-24.0, bp_hz=2640.0), VIERTEL)

    L, R = mix_wet(bus, plate)
    L = biquad(L, coef_highpass(28.0))
    R = biquad(R, coef_highpass(28.0))
    L = compressor(L)
    R = compressor(R)
    return finalize(L, R, 60.0)


def _intro_bett(with_schluss=True):
    """
    bop-intro-bett · 10 Takte, deckungsgleich mit der 24-Sekunden-Scanlinie.
    WARUM ein Bett und kein Musikstueck: es laeuft unter Sprache. Deshalb aendert
    sich ueber 24 Sekunden nur die Klangfarbe, nie die Lautstaerke der Flaeche.
    Das Ohr merkt, dass sich etwas bewegt, ohne dass es zuhoeren muss.
    """
    total = 24000.0 if with_schluss else 21600.0
    bus = Bus(total)
    n = bus.n
    plate = Plate(rt60=0.9, damp_hz=6000.0, predelay_ms=14.0)

    t_steig, t_schluss = 16800.0, 21600.0
    i_steig, i_schluss = ms(t_steig), ms(t_schluss)

    # Grenzfrequenz-Kurve: unten atmet ein sehr langsamer LFO, ab 16800 ms
    # oeffnet ein linearer Anstieg. Der Uebergang wird ueberblendet, ein Sprung
    # in der Klangfarbe waere ein hoerbarer Schnitt.
    cutoffs = [0.0] * n
    for i in range(n):
        t = i / SR
        ph = (t * 0.08) % 1.0
        tri = 4.0 * abs(ph - 0.5) - 1.0          # Dreieck, startet in der Mitte
        lfo = 900.0 + 300.0 * (-tri)
        if with_schluss and i >= i_steig:
            k = min(1.0, (i - i_steig) / float(i_schluss - i_steig))
            ramp = 900.0 + (2400.0 - 900.0) * k
            cutoffs[i] = lfo * (1.0 - k) + ramp * k
        else:
            cutoffs[i] = lfo

    # Ausklang der Flaechen ab dem Schluss, exponentiell ueber 1800 ms.
    drone_env = [1.0] * n
    if with_schluss:
        k = 6.907755 / (1.8 * SR)
        for i in range(i_schluss, n):
            drone_env[i] = math.exp(-k * (i - i_schluss))

    d55 = [v * db(-26.0) * e for v, e in zip(sine(A1, n), drone_env)]
    d110 = [v * db(-30.0) * e for v, e in zip(sine(A2, n), drone_env)]
    saw = biquad_sweep(wavetable(WT_SAW, A3, n), cutoffs)
    d220 = [v * db(-34.0) * e for v, e in zip(saw, drone_env)]
    for buf in (d55, d110, d220):
        bus.add(buf, 0.0)

    # PULS auf jeder ersten und dritten Zaehlzeit. Das ist der Herzschlag des
    # Formats, kein Beat: keine Zwei, keine Vier, nichts zum Mitwippen.
    t = 0.0
    while t < t_schluss:
        lvl = -18.0
        if t >= t_steig:
            lvl = -18.0 + 5.0 * min(1.0, (t - t_steig) / (t_schluss - t_steig))
        bus.add(baustein_a(lvl, 6.0, 20.0, 380.0), t)
        t += 2 * VIERTEL

    # RASTER, die Werkstattuhr. Sie darf bewusst kaum auffallen, deshalb liegt
    # sie 16 dB unter dem Puls und wandert nur leicht nach links und rechts.
    t = 2400.0
    side = -0.18
    while t <= t_schluss - VIERTEL:
        bus.add(baustein_b(-34.0), t, pan=side)
        side = -side
        t += VIERTEL

    # QUARTPEDAL D4: kommt erst nach zwei Takten, sehr langsamer Anschlag.
    # Kein Vibrato, kein Tremolo. Eine gehaltene Quarte ohne Bewegung liest das
    # Ohr als Zustand, nicht als Melodie.
    ped_n = n - ms(4800.0)
    ped_env = env_ahd(ped_n, 900.0, 1e9, 1.0)[:ped_n]
    ped = wavetable(WT_TRI, D4, ped_n)
    ped = [v * e * db(-32.0) * drone_env[ms(4800.0) + i]
           for i, (v, e) in enumerate(zip(ped, ped_env))]
    bus.add(tail_fade(ped, 30.0), 4800.0, send_db=-22.0)

    # GLAS-TUPFER: genau drei, absteigend E6, D6, A5. Sie markieren die Drittel
    # der Begruessung, ohne dass jemand sie zaehlt.
    bus.add(baustein_c(E6, -30.0), 7200.0, send_db=-22.0)
    bus.add(baustein_c(D6, -30.0), 12000.0, send_db=-22.0)
    bus.add(baustein_c(A5, -30.0), 16800.0, send_db=-22.0)

    if with_schluss:
        # SCHLUSS: ein letzter, lauterer Puls und ein Doppel-Anschlag auf der
        # Oktave plus Quarte. Danach passiert nichts mehr.
        bus.add(baustein_a(-10.0, 6.0, 20.0, 380.0), t_schluss)
        bus.add(baustein_c(A5, -18.0), t_schluss, send_db=-22.0)
        bus.add(baustein_c(E6, -18.0), t_schluss, send_db=-22.0)

    wet_env = None
    if with_schluss:
        # Der Raum wird bis 23400 ms geschlossen, danach steht echte Stille.
        wet_env = [1.0] * n
        a, b = ms(23300.0), ms(23400.0)
        for i in range(a, n):
            wet_env[i] = max(0.0, 1.0 - (i - a) / float(b - a))
    L, R = mix_wet(bus, plate, wet_env)

    # SPRACHFREIRAUM: breite Glocke -3 dB bei 1200 Hz. Dadurch sitzt die Stimme
    # ohne Ducking obendrauf, und niemand muss live einen Regler bedienen.
    co = coef_peaking(1200.0, 0.7, -3.0)
    L, R = biquad(L, co), biquad(R, co)

    if with_schluss:
        return finalize(L, R, 100.0, hard_silence_from_ms=23400.0)
    # Schleifenfassung: nur eine Mikro-Blende von 1 ms an den Raendern, sonst
    # waere der Uebergang beim Wiederholen hoerbar.
    return finalize(L, R, 1.0)


def sig_intro_bett():
    return _intro_bett(True)


def sig_intro_bett_loop():
    return _intro_bett(False)


def sig_segment_wechsel():
    """
    bop-segment-wechsel · Der halbe Takt zwischen den Bloecken.
    WARUM ohne Glas-Anschlag: der Wechsel zitiert die Quarte, loest sie aber
    nicht auf. Das Ohr hoert genau deshalb "gleiche Sendung, neues Kapitel" und
    nicht "fertig".
    """
    bus = Bus(1200.0)
    plate = Plate(rt60=0.6, damp_hz=6000.0, predelay_ms=10.0)

    bus.add(baustein_b(-14.0), 0.0)
    # Verkuerztes Fundament ohne Saettigung: es soll tragen, nicht auftreten.
    bus.add(baustein_a(-12.0, 3.0, 0.0, 280.0, f_start=D2, f_end=A1,
                       glide_ms=40.0, drive=0.0), 0.0)
    bus.add(tone(WT_TRI, A4, -18.0, 2.0, 130.0), 0.0, send_db=-24.0)
    bus.add(tone(WT_TRI, D5, -13.0, 2.0, 520.0), SECHZEHNTEL, send_db=-24.0)
    bus.add(tone(None, D6, -24.0, 2.0, 240.0), SECHZEHNTEL, send_db=-24.0)

    # Der einzige Rauschanteil des Signals: das Umblaettern.
    nn = ms(160.0)
    nz = biquad(noise(nn, 3011), coef_bandpass(1800.0, 1.2))
    e = env_ahd(nn, 30.0, 0.0, 120.0)
    bus.add(tail_fade(normalize_peak([a * b for a, b in zip(nz, e)], -30.0), 6.0),
            SECHZEHNTEL, send_db=-24.0)

    L, R = mix_wet(bus, plate)
    return finalize(L, R, 80.0)


def sig_challenge_start():
    """
    bop-challenge-start · Das Ziel ist eingefroren, die Uhr laeuft an.
    WARUM kein Riser und kein Moll: Entschlossenheit entsteht hier aus Tiefe,
    offenen Intervallen und Stille. Ein Riser waere eine Drohung, und gedroht
    wird hier niemandem, es wird gearbeitet.
    """
    bus = Bus(2100.0)
    plate = Plate(rt60=0.9, damp_hz=7000.0, predelay_ms=16.0)

    # Zwei Klicks kurz hintereinander, der zweite dumpfer. Hoerbar ein Riegel.
    bus.add(baustein_b(-13.0), 0.0)
    bus.add(baustein_b(-13.0, bp_hz=2640.0), 60.0)

    bus.add(baustein_a(-5.0, 4.0, 40.0, 900.0), 0.0)
    bus.add(tone(WT_TRI, A2, -16.0, 8.0, 1400.0), 0.0)

    # Offene Quinte auf der Achtel: D4 und A4. Offen, nicht dur, nicht moll.
    bus.add(tone(WT_TRI, D4, -12.0, 4.0, 1300.0), ACHTEL, send_db=-22.0)
    bus.add(tone(WT_TRI, A4, -15.0, 4.0, 1300.0), ACHTEL, send_db=-22.0)
    bus.add(baustein_c(E6, -18.0), ACHTEL, send_db=-22.0)

    # Die Uhr laeuft an: drei Klicks ohne Koerper und ohne Hall, leicht steigend.
    # Das ist das einzige Crescendo im ganzen Signal.
    for t, lvl in ((600.0, -30.0), (1200.0, -28.0), (1800.0, -26.0)):
        bus.add(baustein_b(lvl, layers=(1, 2)), t)

    L, R = mix_wet(bus, plate)
    return finalize(L, R, 120.0)


def _warnung(f_list, dur_ms, fade_ms, send_db):
    """Gemeinsamer Kern beider Warnungen: nur Glas, kein Fundament, kein Klick.
    WARUM ohne Boden: Warnungen liegen ueber laufender Sprache. Ein Hochpass bei
    600 Hz haelt sie komplett ueber dem Grundtonbereich einer Sprechstimme,
    dadurch maskieren sie nichts und es muss nichts geduckt werden."""
    bus = Bus(dur_ms)
    plate = Plate(rt60=0.8, damp_hz=8000.0, predelay_ms=12.0)
    for t, f0, peak, dc in f_list:
        bus.add(baustein_c(f0, peak, partials=(0, 1, 2),
                           levels=[0.0, -9.0, -7.0], decays=dc),
                t, send_db=send_db)
    L, R = mix_wet(bus, plate)
    co = coef_highpass(600.0)
    return finalize(biquad(L, co), biquad(R, co), fade_ms)


def sig_warnung_10min():
    """bop-warnung-10min · Ein einzelner Glas-Anschlag auf D6. Mehr braucht es
    nicht, das Publikum weiss Bescheid, der Moderator spricht weiter."""
    return _warnung([(0.0, D6, -6.0, [620.0, 400.0, 480.0])], 900.0, 100.0, -22.0)


def sig_warnung_2min():
    """
    bop-warnung-2min · Dieselbe Klangfamilie, dringlicher.
    WARUM nur ein Ganztonschritt aufwaerts und mehr Pegel: kein neues Material,
    kein schnelleres Tempo, kein Alarm. In diesen zwei Minuten soll noch sauber
    gearbeitet werden, nicht gehetzt.
    """
    return _warnung([
        (0.0, D6, -6.0, [520.0, 340.0, 400.0]),
        (SECHZEHNTEL, E6, -6.0, [520.0, 340.0, 400.0]),
        (VIERTEL, E6, -10.0, [380.0, 260.0, 300.0]),   # Erinnerung, 4 dB leiser
    ], 1350.0, 100.0, -20.0)


def sig_zeit_aus():
    """
    bop-zeit-aus · Haende weg von der Tastatur.
    WARUM C5 statt D5: das Motiv wird bewusst NICHT aufgeloest. Statt der Quarte
    kommt die kleine Terz. Das Ohr hoert unbewusst, dass etwas nicht angekommen
    ist, ohne dass es traurig klingt. Kein Glissando, kein Tonhoehenabfall,
    nichts, was nach Ausscheiden in einer Spielshow klingt.
    """
    bus = Bus(2000.0)
    plate = Plate(rt60=1.4, damp_hz=4500.0, predelay_ms=20.0)

    # Matter Klick: tiefer gefiltert, ohne die 1760-Hz-Spitze. Ein Schalter, der
    # ausgeht, kein Einrasten.
    bus.add(baustein_b(-16.0, bp_hz=A6, bp_q=4.0, noise_decay_ms=30.0,
                       layers=(1, 3)), 0.0)
    # Fundament ohne Glide und ohne Saettigung: stumpf und ruhig, keine zweite
    # Harmonische, die noch Energie vortaeuschen wuerde.
    bus.add(baustein_a(-7.0, 5.0, 0.0, 1100.0, f_start=A1, f_end=A1,
                       glide_ms=0.0, drive=0.0), 0.0)
    bus.add(tone(WT_TRI, A2, -17.0, 6.0, 900.0), 0.0)
    bus.add(tone(WT_TRI, A4, -15.0, 4.0, 700.0), SECHZEHNTEL, send_db=-18.0)
    bus.add(tone(WT_TRI, C5, -13.0, 4.0, 1200.0), SECHZEHNTEL, send_db=-18.0)

    # Ab 1400 ms wird der Raum in 200 ms geschlossen. Genau das ist akustisch
    # die Endgueltigkeit: nicht leiser, sondern zu.
    n = bus.n
    wet_env = [1.0] * n
    a, b = ms(1400.0), ms(1600.0)
    for i in range(a, n):
        wet_env[i] = max(0.0, 1.0 - (i - a) / float(b - a))
    L, R = mix_wet(bus, plate, wet_env)

    # Tiefpass 5 kHz auf der Summe. Es klingt zu, nicht offen.
    co = coef_lowpass(5000.0)
    return finalize(biquad(L, co), biquad(R, co), 150.0)


def sig_geschafft():
    """
    bop-geschafft · Anerkennung, keine Fanfare.
    WARUM als einziges Signal vollstaendig aufgeloest: hier steht der Akkord
    A-D-E. Die Toene kommen einzeln und bleiben dann stehen, die letzten 1200 ms
    passiert nichts ausser Ausklang. Genau diese Ruhe unterscheidet es von einer
    Gameshow, und deshalb vertraegt es auch die zwanzigste Sendung noch.
    """
    bus = Bus(2550.0)
    plate = Plate(rt60=1.6, damp_hz=8000.0, predelay_ms=22.0)

    bus.add(baustein_b(-15.0), 0.0)
    bus.add(baustein_a(-7.0, 4.0, 30.0, 950.0), 0.0)
    bus.add(tone(WT_TRI, A4, -15.0, 3.0, 300.0), 0.0, send_db=-17.0)

    bus.add(tone(WT_TRI, D5, -12.0, 3.0, 1100.0), SECHZEHNTEL, send_db=-17.0)
    bus.add(tone(None, D6, -22.0, 2.0, 500.0), SECHZEHNTEL, send_db=-17.0)

    # Die Quinte E5 schliesst den Akkord. Kein zusaetzlicher Bass mehr, keine
    # Rhythmisierung, keine punktierten Achtel.
    bus.add(tone(WT_TRI, E5, -14.0, 4.0, 1400.0), 450.0, send_db=-17.0)
    bus.add(baustein_c(E6, -15.0), 450.0, send_db=-17.0)

    # Das einmalige Blitzen auf A6, nur zwei Partiale. Es kommt genau einmal.
    bus.add(baustein_c(A6, -22.0, partials=(0, 2), levels=[0.0, -5.0],
                       decays=[700.0, 500.0]), 900.0, send_db=-17.0)

    L, R = mix_wet(bus, plate)
    return finalize(L, R, 200.0)


def sig_kriterium_klick():
    """
    bop-kriterium-klick · Ein abgehaktes Abnahmekriterium.
    WARUM bewusst ohne Sub: bis zu zwanzig Einsaetze pro Sendung. Mit Fundament
    bekaeme jedes Haekchen das Gewicht eines Ereignisses, und nach dem fuenften
    Mal waere die Sendung eine Kirmes. Der winzige Aufwaertsschritt nach 25 ms
    ist der Unterschied zwischen "erledigt" und "nur gedrueckt".
    """
    bus = Bus(240.0)
    plate = Plate(rt60=0.18, damp_hz=9000.0, predelay_ms=4.0)

    nn = ms(40.0)
    nz = biquad(noise(nn, 4211), coef_bandpass(4200.0, 8.0))
    e = env_ahd(nn, 0.5, 0.0, 16.0)
    bus.add(tail_fade(normalize_peak([a * b for a, b in zip(nz, e)], -20.0), 3.0),
            0.0, send_db=-28.0)
    bus.add(tone(None, A6, -18.0, 0.3, 40.0), 0.0, send_db=-28.0)
    bus.add(tone(None, A5, -24.0, 0.3, 90.0), 0.0, send_db=-28.0)
    bus.add(tone(None, E7, -26.0, 0.3, 55.0), 25.0, send_db=-28.0)

    L, R = mix_wet(bus, plate)
    co = coef_highpass(400.0)
    return finalize(biquad(L, co), biquad(R, co), 40.0)


def sig_frage_einblendung():
    """
    bop-frage-einblendung · Das leiseste Signal des Systems.
    WARUM weicherer Anschlag als beim Kriterium-Klick: es soll nach Einblendung
    klingen, nicht nach Bedienhandlung. Der Tiefpass nimmt die Schaerfe, dadurch
    draengt sich das Signal nie vor die Stimme.
    """
    bus = Bus(450.0)
    plate = Plate(rt60=0.5, damp_hz=7000.0, predelay_ms=8.0)
    g = baustein_c(A5, -30.0, partials=(0, 1), attack_ms=3.0,
                   levels=[0.0, -9.0], decays=[380.0, 240.0])
    # Panorama auf die Bildseite der Einblendung, 12 Prozent rechts.
    bus.add(g, 0.0, pan=0.12, send_db=-24.0)
    L, R = mix_wet(bus, plate)
    L = biquad(biquad(L, coef_highpass(500.0)), coef_lowpass(6000.0))
    R = biquad(biquad(R, coef_highpass(500.0)), coef_lowpass(6000.0))
    return finalize(L, R, 60.0)


# ---------------------------------------------------------------------------
# Regie: Pegel-Hierarchie
# ---------------------------------------------------------------------------
# Das ist die eigentliche Regie. Was ueber Sprache liegt, ist mindestens 14 LU
# leiser als das, was allein steht. Deshalb wird NICHT alles auf denselben Wert
# normalisiert, sondern jede Datei auf ihren Platz in der Hierarchie.

SIGNALE = [
    ("bop-sting-marke",       sig_sting_marke,       -14.0, -1.5),
    ("bop-intro-bett",        sig_intro_bett,        -24.0, -1.5),
    ("bop-intro-bett-loop",   sig_intro_bett_loop,   -24.0, -1.5),
    ("bop-segment-wechsel",   sig_segment_wechsel,   -16.0, -1.5),
    ("bop-challenge-start",   sig_challenge_start,   -13.0, -1.5),
    ("bop-warnung-10min",     sig_warnung_10min,     -32.0, -1.5),
    ("bop-warnung-2min",      sig_warnung_2min,      -28.0, -1.5),
    ("bop-zeit-aus",          sig_zeit_aus,          -15.0, -1.5),
    ("bop-geschafft",         sig_geschafft,         -14.0, -1.5),
    ("bop-kriterium-klick",   sig_kriterium_klick,   -24.0, -1.5),
    ("bop-frage-einblendung", sig_frage_einblendung, -34.0, -1.5),
]


def gain_write_verify(L, R, path, target_lufs, tp_limit, gain=1.0, rounds=4):
    """Schreibt, misst mit ffmpeg gegen und korrigiert, bis der Wert steht."""
    report = None
    for _ in range(rounds):
        write_wav24(path, [v * gain for v in L], [v * gain for v in R])
        m = measure_ffmpeg(path)
        report = m
        if m["I"] is None:
            break
        corr = 0.0
        if abs(m["I"] - target_lufs) > 0.3:
            corr = target_lufs - m["I"]
        if m["tp"] is not None and m["tp"] + corr > tp_limit:
            # True Peak schlaegt Lautheit. Lieber 1 dB leiser als ein Knacken.
            corr = tp_limit - m["tp"]
        if abs(corr) < 0.15:
            break
        gain *= db(corr)
    return gain, report


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    os.makedirs(NORM_DIR, exist_ok=True)
    rows = []

    for name, fn, target, tp_limit in SIGNALE:
        sys.stderr.write("... %s\n" % name)
        sys.stderr.flush()
        L, R = fn()

        peak = max(max(abs(v) for v in L), max(abs(v) for v in R))
        dc = (sum(L) + sum(R)) / (2.0 * len(L))
        side = ms_ratio(L, R)
        pre = lufs_integrated(L, R)
        g0 = db(target - pre) if pre > -70 else 1.0
        if peak * g0 > 0.98:
            g0 = 0.98 / peak

        wav = os.path.join(OUT_DIR, name + ".wav")
        g, m = gain_write_verify(L, R, wav, target, tp_limit, g0)
        make_mp3(wav, os.path.join(OUT_DIR, name + ".mp3"))

        # Zusatzsatz: alles auf -16 LUFS, True Peak -1 dBTP. Das ist die
        # Referenzfassung fuer Toms uebrige Produktionen, NICHT die Sendefassung.
        nwav = os.path.join(NORM_DIR, name + ".wav")
        gain_write_verify(L, R, nwav, -16.0, -1.0, db(-16.0 - pre) if pre > -70 else 1.0)
        make_mp3(nwav, os.path.join(NORM_DIR, name + ".mp3"))

        first = max(abs(L[0] * g), abs(R[0] * g))
        last = max(abs(L[-1] * g), abs(R[-1] * g))
        rows.append({
            "name": name, "target": target, "m": m, "dc": dc, "side": side,
            "peak_db": 20 * math.log10(max(1e-12, peak * g)),
            "edge": max(first, last), "probe": probe(wav),
        })

    print("\n%-24s %7s %7s %7s %7s %7s %6s %s" % (
        "Datei", "Ziel", "LUFS-I", "TP dBTP", "Peak", "S/M", "Rand", "Stream"))
    ok = True
    for r in rows:
        m = r["m"]
        I = m["I"] if m and m["I"] is not None else float("nan")
        tp = m["tp"] if m and m["tp"] is not None else float("nan")
        bad = (abs(I - r["target"]) > 0.6) or (tp > -1.4) or (r["edge"] > 1e-6) \
            or (abs(r["dc"]) > 1e-5) or (r["side"] > 0.30)
        ok = ok and not bad
        print("%-24s %7.1f %7.1f %7.1f %7.1f %7.3f %6.0e %s%s" % (
            r["name"], r["target"], I, tp, r["peak_db"], r["side"], r["edge"],
            r["probe"], "   <-- PRUEFEN" if bad else ""))
    print("\nAlle Werte im Rahmen." if ok else "\nAbweichungen oben markiert.")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
