"""Original score for the portfolio film: 15.0 s, 120 BPM, A-flat major, 48 kHz stereo.

Upbeat four-on-the-floor: kick, clap, hats, an off-beat pumping bass, chord stabs and plucks.
No transition effects (no whooshes, risers or booms): accents on cuts come from the music itself.
The score is mixed on a circular buffer, so its end flows straight back into its start and the
film loops seamlessly. Every hit sits on a film frame (24 fps): 1 beat = 12 frames.

Usage: python3 film/music.py [out.wav]
"""
import sys
import wave

import numpy as np

SR = 48000
DUR = 15.0
N = int(SR * DUR)
FPS = 24
BEAT = 0.5
SIX = BEAT / 4  # sixteenth note
rng = np.random.default_rng(2026)

# Two buses: drums stay dry and punchy; music is side-chained to the kick.
DRUMS = np.zeros((2, N))
MUSIC = np.zeros((2, N))
SEND = np.zeros((2, N))


def fr(f):
    return f / FPS


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def note(name):
    names = {'C': 0, 'Db': 1, 'D': 2, 'Eb': 3, 'E': 4, 'F': 5, 'Gb': 6, 'G': 7, 'Ab': 8, 'A': 9, 'Bb': 10, 'B': 11}
    return names[name[:-1]] + 12 * (int(name[-1]) + 1)


def place(sig, t, gain=1.0, pan=0.0, verb=0.0, bus=MUSIC):
    """Mix a mono signal in at time t (s); anything past the end wraps to the start (loop)."""
    i0 = int(round(t * SR)) % N
    idx = (i0 + np.arange(len(sig))) % N
    gl = np.cos((pan + 1) * np.pi / 4) * gain
    gr = np.sin((pan + 1) * np.pi / 4) * gain
    np.add.at(bus[0], idx, sig * gl)
    np.add.at(bus[1], idx, sig * gr)
    if verb:
        np.add.at(SEND[0], idx, sig * gl * verb)
        np.add.at(SEND[1], idx, sig * gr * verb)


def tvec(seconds):
    return np.arange(int(seconds * SR)) / SR


def filt(sig, lo=None, hi=None, order=2):
    spec = np.fft.rfft(sig)
    f = np.fft.rfftfreq(len(sig), 1 / SR)
    h = np.ones_like(f)
    if hi:
        h *= 1 / np.sqrt(1 + (f / hi) ** (2 * order))
    if lo:
        h *= 1 / np.sqrt(1 + (lo / np.maximum(f, 1e-6)) ** (2 * order))
    return np.fft.irfft(spec * h, len(sig))


def saw(freq, t, phase=0.0):
    return 2 * ((freq * t + phase) % 1.0) - 1


def adsr(n, a, d, s, r, hold):
    t = np.arange(n) / SR
    env = np.where(t < a, t / max(a, 1e-6), 1.0)
    env = np.where((t >= a) & (t < a + d), 1 - (1 - s) * (t - a) / max(d, 1e-6), env)
    env = np.where((t >= a + d) & (t < hold), s, env)
    return np.where(t >= hold, s * np.clip(1 - (t - hold) / max(r, 1e-6), 0, 1), env)


# ------------------------------------------------------------------ voices

def kick(level=1.0):
    t = tvec(0.38)
    freq = 48 + 130 * np.exp(-t * 32)
    body = np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-t * 8)
    click = filt(rng.standard_normal(len(t)), lo=2500) * np.exp(-t * 350) * 0.3
    return np.tanh((body + click) * 1.6) * level


def clap():
    t = tvec(0.3)
    noise = filt(rng.standard_normal(len(t)), lo=1000, hi=6000)
    env = np.exp(-t * 20)
    for off in (0.0, 0.01, 0.02):
        env += 0.7 * np.exp(-np.maximum(t - off, 0) * 160) * (t >= off)
    return noise * env * 0.5


def hat(open_=False, level=1.0):
    t = tvec(0.22 if open_ else 0.05)
    return filt(rng.standard_normal(len(t)), lo=8000) * np.exp(-t * (16 if open_ else 80)) * 0.22 * level


def shaker():
    t = tvec(0.07)
    env = np.sin(np.pi * np.clip(t / 0.07, 0, 1)) ** 2
    return filt(rng.standard_normal(len(t)), lo=5000, hi=12000) * env * 0.12


def bass(m, length):
    t = tvec(length + 0.05)
    sig = 0.55 * saw(midi(m), t) + 0.8 * np.sin(2 * np.pi * midi(m) * t)
    sig = filt(sig, hi=700, order=2)
    return sig * adsr(len(t), 0.003, 0.08, 0.7, 0.04, length)


def stab(notes, length=0.16, cutoff=3200):
    t = tvec(length + 0.12)
    sig = np.zeros(len(t))
    for m in notes:
        for det in (-0.12, 0.0, 0.13):
            sig += saw(midi(m + det), t, rng.random())
    sig = filt(sig / (len(notes) * 3), hi=cutoff, order=2)
    return sig * adsr(len(t), 0.003, 0.09, 0.45, 0.1, length)


def pad(notes, length, cutoff=2400):
    t = tvec(length + 0.4)
    sig = np.zeros(len(t))
    for m in notes:
        for det in (-0.08, 0.0, 0.1):
            sig += saw(midi(m + det), t, rng.random())
    sig = filt(sig / (len(notes) * 3), hi=cutoff, order=2)
    return sig * adsr(len(t), 0.08, 0.3, 0.8, 0.35, length)


def pluck(m, length=0.5, bright=1.0):
    t = tvec(length)
    sig = np.zeros(len(t))
    for k in range(1, 9):
        sig += np.sin(2 * np.pi * midi(m) * k * t) / k ** (1.5 - 0.4 * bright) * np.exp(-t * (4 + 3 * k))
    return sig * (1 - np.exp(-t * 1500)) * 0.5


def bell(m, length=1.4):
    t = tvec(length)
    sig = np.zeros(len(t))
    for ratio, amp, dec in ((1, 1, 2.0), (2, 0.5, 3.0), (2.76, 0.3, 4.0), (5.4, 0.15, 6.0)):
        sig += amp * np.sin(2 * np.pi * midi(m) * ratio * t) * np.exp(-t * dec)
    return sig * (1 - np.exp(-t * 2000)) * 0.35


# ------------------------------------------------------------------ harmony

n = note
# One chord per bar (2 s); the half bar at 14 s is the V that resolves into bar 0 on the loop.
PROG = [
    (0.0, 'Ab1', [n('Ab3'), n('C4'), n('Eb4'), n('G4')]),    # Abmaj7
    (2.0, 'F1', [n('F3'), n('Ab3'), n('C4'), n('Eb4')]),     # Fm7
    (4.0, 'Db2', [n('Db4'), n('F4'), n('Ab4'), n('C5')]),    # Dbmaj7
    (6.0, 'Eb1', [n('Eb3'), n('G3'), n('Bb3'), n('Db4')]),   # Eb7
    (8.0, 'Ab1', [n('Ab3'), n('C4'), n('Eb4'), n('G4')]),
    (10.0, 'F1', [n('F3'), n('Ab3'), n('C4'), n('Eb4')]),
    (12.0, 'Db2', [n('Db4'), n('F4'), n('Ab4'), n('C5')]),
    (14.0, 'Eb1', [n('Eb3'), n('G3'), n('Bb3'), n('Db4')]),
]


def chord_at(t):
    return [c for c in PROG if c[0] <= t][-1]


# Section energy (seconds): which parts play where. The 1.0–1.5 s whisper and the
# 12.5–13.5 s closing sentence are the two breaths; everything else drives.
def drums_on(t):
    return not (1.0 <= t < 1.5 or 12.5 <= t < 13.5)


def full(t):
    return not (1.0 <= t < 1.5 or 5.0 <= t < 7.5 or 12.5 <= t < 13.5)


KICKS = []
for b in range(int(DUR / BEAT)):
    t = b * BEAT
    if drums_on(t):
        place(kick(), t, bus=DRUMS)
        KICKS.append(t)
    if drums_on(t) and b % 2 == 1:
        place(clap(), t, 0.85, verb=0.25, bus=DRUMS)
    for s in range(4):
        ts = t + s * SIX
        if not drums_on(ts):
            continue
        if s == 2:
            place(hat(open_=True), ts, 0.9, pan=-0.2, bus=DRUMS)     # off-beat open hat: the lift
        elif full(ts):
            place(hat(level=1.0 if s == 0 else 0.6), ts, 1.0, pan=0.3, bus=DRUMS)
        place(shaker(), ts + 0.01, 1.0, pan=-0.45, bus=DRUMS)

# Off-beat pumping bass (eighths, octave bounce) wherever the groove is full.
for k in range(int(DUR / (BEAT / 2))):
    t = k * BEAT / 2
    _, root, _ = chord_at(t)
    if full(t) and k % 2 == 1:
        place(bass(n(root) + (12 if k % 4 == 3 else 0), 0.2), t, 0.75)
    elif 5.0 <= t < 7.5 and k % 4 == 0:   # philosophy: long roots under the words
        place(bass(n(root), 0.9), t, 0.6)

# Chord stabs in a syncopated 16th pattern across each bar; pads under the breaths.
# (The name snap at f36 and the end-card cut at f324 already land on a kick + clap.)
STAB_PATTERN = (0, 3, 6, 10, 12, 14)
for bar_start, _, notes in PROG:
    for s in STAB_PATTERN:
        t = bar_start + s * SIX
        if t < DUR and full(t):
            place(stab(notes), t, 0.32, pan=(-0.25 if s % 2 else 0.25), verb=0.3)
for t0, length in ((1.0, 0.5), (12.5, 1.0)):
    place(pad(chord_at(t0)[2], length), t0, 0.22, verb=0.5)

# Philosophy (5.0–7.5 s): a bright pluck on each word, climbing; "simple." gets a bell.
for f, m in ((120, 'Eb5'), (132, 'F5'), (144, 'Ab5'), (156, 'C6')):
    place(pluck(n(m), 0.9, bright=1.3), fr(f), 0.55, pan=0.15, verb=0.45)
    place(pluck(n(m) - 12, 0.7), fr(f), 0.3, pan=-0.15, verb=0.3)
place(pad(chord_at(5.0)[2], 2.4, cutoff=1800), 5.0, 0.16, verb=0.4)
place(bell(n('Eb6')), fr(162), 0.35, pan=0.2, verb=0.5)

# Hook: a 16th-note arpeggio that rides the second half (Experience + Craft) and the end card.
for k in range(int(DUR / SIX)):
    t = k * SIX
    if (7.5 <= t < 12.5) or t >= 13.5:
        notes = chord_at(t)[2]
        m = notes[[0, 1, 2, 3, 2, 1, 3, 2][k % 8]] + 12
        place(pluck(m, 0.25, bright=1.5), t, 0.16 if t < 10 else 0.2, pan=(0.45 if k % 2 else -0.45), verb=0.3)

# Closing sentence words (12.5–13.5 s) and the end card chord.
for f in (300, 306, 312):
    place(pluck(n('Ab5'), 0.6), fr(f), 0.3, verb=0.4)
for m, p in ((n('C5'), -0.3), (n('Eb5'), 0.3), (n('Ab5'), 0.0)):
    place(bell(m), fr(324), 0.3, pan=p, verb=0.6)

# ------------------------------------------------------------ mix + master

def reverb(sig, seconds=1.6, seed=1):
    """Circular convolution: the tail at the end wraps into the start, like the loop."""
    r = np.random.default_rng(seed)
    t = tvec(seconds)
    ir = filt(r.standard_normal(len(t)) * np.exp(-t * 4.0), hi=7000)
    ir /= np.sqrt(np.sum(ir ** 2))
    return np.fft.irfft(np.fft.rfft(sig, N) * np.fft.rfft(ir, N), N)


# Side-chain: music ducks under every kick (the pump), recovering over ~180 ms — circular too.
duck = np.ones(N)
t_rel = tvec(0.2)
shape = 1 - 0.55 * np.exp(-t_rel / 0.06)
for tk in KICKS:
    idx = (int(round(tk * SR)) + np.arange(len(t_rel))) % N
    duck[idx] = np.minimum(duck[idx], shape)

wet = np.stack([reverb(SEND[0], seed=1), reverb(SEND[1], seed=2)])
mix = DRUMS + (MUSIC + 0.5 * wet) * duck

mix /= np.max(np.abs(mix)) + 1e-9
mix = np.tanh(mix * 1.8) / np.tanh(1.8)
mix *= 10 ** (-1.5 / 20) / np.max(np.abs(mix))

out = sys.argv[1] if len(sys.argv) > 1 else 'film/out/score.wav'
pcm = (np.clip(mix.T, -1, 1) * 32767).astype('<i2')
with wave.open(out, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print('wrote', out)
