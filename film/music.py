"""Original score for the portfolio film: 15.0 s, 120 BPM, F minor, 48 kHz stereo.

Every hit is placed on a film frame (24 fps): 1 beat = 12 frames, 1 eighth = 6 frames.
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
rng = np.random.default_rng(2026)

L = np.zeros(N)
R = np.zeros(N)
VERB_L = np.zeros(N)
VERB_R = np.zeros(N)


def fr(f):
    """Film frame -> seconds."""
    return f / FPS


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def note(name):
    names = {'C': 0, 'Db': 1, 'D': 2, 'Eb': 3, 'E': 4, 'F': 5, 'Gb': 6, 'G': 7, 'Ab': 8, 'A': 9, 'Bb': 10, 'B': 11}
    return names[name[:-1]] + 12 * (int(name[-1]) + 1)


def place(sig, t, gain=1.0, pan=0.0, verb=0.0):
    """Mix a mono signal in at time t (s), equal-power pan -1..1, with a reverb send."""
    i = int(round(t * SR))
    if i >= N:
        return
    sig = sig[: N - i]
    gl = np.cos((pan + 1) * np.pi / 4) * gain
    gr = np.sin((pan + 1) * np.pi / 4) * gain
    L[i:i + len(sig)] += sig * gl
    R[i:i + len(sig)] += sig * gr
    if verb:
        VERB_L[i:i + len(sig)] += sig * gl * verb
        VERB_R[i:i + len(sig)] += sig * gr * verb


def tvec(seconds):
    return np.arange(int(seconds * SR)) / SR


def filt(sig, lo=None, hi=None, order=2):
    """Static zero-phase low/high-pass in the frequency domain."""
    spec = np.fft.rfft(sig)
    f = np.fft.rfftfreq(len(sig), 1 / SR)
    h = np.ones_like(f)
    if hi:
        h *= 1 / np.sqrt(1 + (f / hi) ** (2 * order))
    if lo:
        h *= 1 / np.sqrt(1 + (lo / np.maximum(f, 1e-6)) ** (2 * order))
    return np.fft.irfft(spec * h, len(sig))


def sweep_filter(sig, f0, f1, q=0.7, mode='bp'):
    """State-variable filter whose cutoff glides exponentially from f0 to f1."""
    out = np.zeros_like(sig)
    lp = bp = 0.0
    fc = f0 * (f1 / f0) ** (np.arange(len(sig)) / max(1, len(sig) - 1))
    g = 2 * np.sin(np.pi * np.minimum(fc, SR / 6) / SR)
    for i, x in enumerate(sig):
        hp = x - lp - q * bp
        bp += g[i] * hp
        lp += g[i] * bp
        out[i] = bp if mode == 'bp' else lp
    return out


def saw(freq, t):
    return 2 * ((freq * t) % 1.0) - 1


def adsr(n, a, d, s, r, sustain_time):
    t = np.arange(n) / SR
    env = np.where(t < a, t / max(a, 1e-6), 1.0)
    env = np.where((t >= a) & (t < a + d), 1 - (1 - s) * (t - a) / max(d, 1e-6), env)
    env = np.where((t >= a + d) & (t < sustain_time), s, env)
    rel = np.clip(1 - (t - sustain_time) / max(r, 1e-6), 0, 1)
    return np.where(t >= sustain_time, s * rel, env)


# ------------------------------------------------------------------ voices

def kick(level=1.0):
    t = tvec(0.45)
    freq = 45 + 110 * np.exp(-t * 28)
    body = np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-t * 7)
    click = filt(rng.standard_normal(len(t)), lo=2000) * np.exp(-t * 300) * 0.25
    return np.tanh((body + click) * 1.4) * level


def clap():
    t = tvec(0.35)
    noise = filt(rng.standard_normal(len(t)), lo=900, hi=5000)
    env = np.exp(-t * 18)
    for off in (0.0, 0.011, 0.022):
        env += 0.6 * np.exp(-np.maximum(t - off, 0) * 140) * (t >= off)
    return noise * env * 0.45


def hat(open_=False):
    t = tvec(0.25 if open_ else 0.06)
    return filt(rng.standard_normal(len(t)), lo=7500) * np.exp(-t * (14 if open_ else 70)) * 0.22


def tick():
    t = tvec(0.02)
    return filt(rng.standard_normal(len(t)), lo=3000, hi=9000) * np.exp(-t * 400) * 0.35


def boom():
    t = tvec(1.2)
    freq = 38 + 40 * np.exp(-t * 6)
    return np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-t * 3.2)


def whoosh(length=0.35, f0=400, f1=6000):
    t = tvec(length)
    env = np.sin(np.pi * np.clip(t / length, 0, 1)) ** 1.5
    return sweep_filter(rng.standard_normal(len(t)), f0, f1, q=0.5) * env * 0.55


def riser(length, f0=300, f1=9000):
    t = tvec(length)
    env = (t / length) ** 2.2
    return sweep_filter(rng.standard_normal(len(t)), f0, f1, q=0.35) * env * 0.6


def reverse_swell(length):
    t = tvec(length)
    env = (t / length) ** 3
    return filt(rng.standard_normal(len(t)), lo=4000) * env * 0.35


def pad(notes, length, cutoff=1600):
    t = tvec(length + 0.6)
    sig = np.zeros(len(t))
    for m in notes:
        for det in (-0.09, 0.0, 0.11):
            sig += saw(midi(m + det), t + rng.random())
    sig = filt(sig / (len(notes) * 3), hi=cutoff, order=2)
    return sig * adsr(len(t), 0.25, 0.4, 0.8, 0.6, length)


def bass(m, length, cutoff=520):
    t = tvec(length + 0.08)
    sig = 0.6 * saw(midi(m), t) + 0.7 * np.sin(2 * np.pi * midi(m - 12) * t)
    sig = filt(sig, hi=cutoff, order=2)
    return sig * adsr(len(t), 0.004, 0.12, 0.55, 0.06, length)


def pluck(m, length=1.2, bright=1.0):
    t = tvec(length)
    sig = np.zeros(len(t))
    for k in range(1, 9):
        sig += np.sin(2 * np.pi * midi(m) * k * t) / k ** (1.6 - 0.4 * bright) * np.exp(-t * (2.5 + 2.2 * k))
    return sig * (1 - np.exp(-t * 900)) * 0.5


def bell(m, length=2.5):
    t = tvec(length)
    sig = np.zeros(len(t))
    for ratio, amp, dec in ((1, 1, 1.4), (2, 0.5, 2.2), (2.76, 0.35, 3.0), (5.4, 0.2, 5.0), (8.93, 0.1, 7.0)):
        sig += amp * np.sin(2 * np.pi * midi(m) * ratio * t) * np.exp(-t * dec)
    return sig * (1 - np.exp(-t * 2000)) * 0.35


# ------------------------------------------------------------------- score

N_ = note
CHORDS = {  # bar start (s) -> pad voicing
    0.0: [N_('F3'), N_('Ab3'), N_('C4'), N_('Eb4'), N_('G4')],       # Fm9
    2.0: [N_('Db3'), N_('F3'), N_('Ab3'), N_('C4')],                  # Dbmaj7
    4.0: [N_('Ab2'), N_('C3'), N_('Eb3'), N_('G3')],                  # Abmaj7
    6.0: [N_('Eb3'), N_('G3'), N_('Bb3'), N_('F4')],                  # Eb add9
    8.0: [N_('F3'), N_('Ab3'), N_('C4'), N_('Eb4'), N_('G4')],       # Fm9
    10.0: [N_('Db3'), N_('F3'), N_('Ab3'), N_('C4')],                 # Dbmaj7
    12.0: [N_('Bb2'), N_('Db3'), N_('F3'), N_('Ab3'), N_('C4')],     # Bbm9
}
ROOTS = {0.0: 'F1', 2.0: 'Db1', 4.0: 'Ab1', 6.0: 'Eb1', 8.0: 'F1', 10.0: 'Db1', 12.0: 'Bb0'}


# Scene 01 Ignite: swell into the burst, boom on the iris flood, burst streaks out.
place(reverse_swell(fr(5)), 0.0, 0.9)
place(whoosh(0.75, 9000, 600), fr(5), 0.8, verb=0.3)
place(boom(), fr(10), 0.9)
place(kick(0.8), fr(10))
place(pad(CHORDS[0.0], 1.0, cutoff=900), 0.0, 0.18, pan=-0.1, verb=0.4)

# Scene 02 Identity: hush, ticking 8ths, letters drop, scale-snap hit, type-on clicks, blur swell.
for k in range(4):
    place(tick(), 1.0 + k * 0.125, 0.5, pan=0.3)
place(tick(), fr(36), 0.8, pan=-0.4)
place(tick(), fr(37), 0.8, pan=-0.2)
place(kick(1.0), fr(38))
place(clap(), fr(38), 0.9, verb=0.35)
place(boom(), fr(38), 0.5)
for f in range(43, 52):
    place(tick(), fr(f), 0.55, pan=-0.5 + (f - 43) / 9)
place(pad(CHORDS[2.0], 1.0, cutoff=1100), 2.0, 0.22, verb=0.4)
place(reverse_swell(fr(72 - 64)), fr(64), 1.0)

# Scene 03 Role: groove enters; swaps get whooshes; the morph rises into the exit.
for b in range(6, 10):
    place(kick(), b * BEAT)
    place(hat(), b * BEAT + 0.25, 1.0, pan=0.35)
place(clap(), 3.5, 0.8, verb=0.3)
for f in (90, 96, 102):
    place(whoosh(0.28, 500, 7000), fr(f) - 0.06, 0.7, pan=0.3)
    place(tick(), fr(f), 0.7)
place(riser(fr(112 - 100), 400, 8000), fr(100), 0.8)
place(whoosh(0.32, 6000, 300), fr(112), 0.8, pan=0.6)
for k in range(8):
    t = 3.0 + k * 0.25
    place(bass(N_('Db1') + (12 if k % 2 else 0), 0.2), t, 0.55)
place(pad(CHORDS[2.0], 1.0, cutoff=1300), 3.0, 0.2, verb=0.4)

# Scene 04 Philosophy: drums drop; one kick + pluck per word, climbing; "simple." blooms.
for f, m in ((120, 'C5'), (132, 'Eb5'), (144, 'F5'), (156, 'Ab5')):
    place(kick(0.85), fr(f))
    place(pluck(N_(m), 1.4), fr(f), 0.5, pan=0.15, verb=0.5)
    place(pluck(N_(m) - 12, 1.0), fr(f), 0.25, pan=-0.15, verb=0.3)
place(pad(CHORDS[4.0], 2.0, cutoff=1400), 5.0, 0.2, verb=0.45)
place(bell(N_('C6'), 2.0), fr(162), 0.4, pan=0.2, verb=0.6)
place(pad([N_('Eb4'), N_('G4'), N_('Bb4'), N_('F5')], 1.0, cutoff=2400), fr(162), 0.16, verb=0.5)
place(bass(N_('Ab1'), 1.0), 5.0, 0.5)
place(bass(N_('Eb1'), 1.0), 6.5, 0.5)
place(riser(0.5, 500, 10000), 7.0, 0.7)

# Scenes 05–06 Experience + Craft: full groove 7.5–12.5 s.
for b in range(15, 25):
    t = b * BEAT
    place(kick(), t)
    if b % 2 == 0:
        place(clap(), t, 0.85, verb=0.3)
    for s in (0.125, 0.25, 0.375):
        place(hat(open_=(s == 0.25 and b % 2)), t + s, 0.9, pan=0.3 if s != 0.25 else -0.25)
for k in range(20):
    t = 7.5 + k * 0.25
    r = N_(ROOTS[max(x for x in ROOTS if x <= t)])
    place(bass(r + (12 if k % 4 == 2 else 0), 0.21), t, 0.6)
place(pad(CHORDS[6.0], 0.5, cutoff=1800), 7.5, 0.2, verb=0.4)
place(pad(CHORDS[8.0], 2.0, cutoff=1800), 8.0, 0.2, verb=0.4)
place(pad(CHORDS[10.0], 2.5, cutoff=2200), 10.0, 0.2, verb=0.4)
place(whoosh(0.3, 7000, 500), fr(198), 0.7)        # zoom-out into the card
place(clap(), fr(204), 0.6, verb=0.5)              # cut to Wynk
place(whoosh(0.3, 600, 7000), fr(222), 0.7, pan=-0.4)  # card slides, Paytm in
place(bell(N_('F5'), 1.2), fr(225), 0.18, pan=0.4, verb=0.6)

# Craft: an arpeggio rides the ring system; each word cut gets a shimmer.
arp = [N_('F4'), N_('Ab4'), N_('C5'), N_('Eb5'), N_('Db4'), N_('F4'), N_('Ab4'), N_('C5')]
for k in range(16):
    place(pluck(arp[(k % 4) + (4 if k >= 8 else 0)] + 12, 0.35, bright=1.4), 10.0 + k * 0.125, 0.18,
          pan=0.5 if k % 2 else -0.5, verb=0.35)
for f in (240, 252, 264, 276):
    place(whoosh(0.22, 3000, 9000), fr(f) - 0.03, 0.5)
place(riser(1.0, 800, 12000), 11.5, 0.45)          # the orbiting highlight on "Motion"

# Scene 07 Signature: drums out, the sentence ticks in, end card rings.
place(pad(CHORDS[12.0], 1.0, cutoff=1400), 12.5, 0.24, verb=0.5)
place(bass(N_('Bb0'), 0.9), 12.5, 0.4)
for f in (300, 306, 312):
    place(tick(), fr(f), 0.9)
    place(pluck(N_('F5'), 0.6), fr(f), 0.12, verb=0.4)
place(reverse_swell(0.5), fr(324) - 0.5, 0.9)
END = [N_('Ab2'), N_('Eb3'), N_('C4'), N_('G4'), N_('Bb4')]  # Abmaj9 — the lift into the light frame
place(pad(END, 0.9, cutoff=3000), fr(324), 0.22, verb=0.7)
for m, p in ((N_('C5'), -0.3), (N_('Eb5'), 0.3), (N_('G5'), 0.0)):
    place(bell(m, 1.6), fr(324), 0.35, pan=p, verb=0.8)
place(boom(), fr(324), 0.6)
place(whoosh(0.5, 2000, 400), fr(330), 0.4, pan=0.7)   # monogram rolls in from the right
place(tick(), fr(342), 1.0)                            # docks
place(pluck(N_('Ab5'), 1.5), fr(342), 0.2, verb=0.6)

# --------------------------------------------------------------- reverb + master

def reverb(sig, seconds=2.2, seed=1):
    r = np.random.default_rng(seed)
    t = tvec(seconds)
    ir = r.standard_normal(len(t)) * np.exp(-t * 3.2)
    ir = filt(ir, hi=6000)
    ir /= np.sqrt(np.sum(ir ** 2))
    n = len(sig) + len(ir)
    size = 1 << (n - 1).bit_length()
    out = np.fft.irfft(np.fft.rfft(sig, size) * np.fft.rfft(ir, size), size)[: len(sig)]
    return out


wet_l, wet_r = reverb(VERB_L, seed=1), reverb(VERB_R, seed=2)
mix_l, mix_r = L + 0.55 * wet_l, R + 0.55 * wet_r

# Gentle glue: soft-clip, then normalise to -1 dBFS and fade the last 150 ms.
mix = np.stack([mix_l, mix_r])
mix /= np.max(np.abs(mix)) + 1e-9
mix = np.tanh(mix * 1.6) / np.tanh(1.6)
mix *= 10 ** (-1 / 20) / np.max(np.abs(mix))
fade = np.ones(N)
fade[-int(0.15 * SR):] = np.linspace(1, 0, int(0.15 * SR))
mix *= fade

out = sys.argv[1] if len(sys.argv) > 1 else 'film/out/score.wav'
pcm = (np.clip(mix.T, -1, 1) * 32767).astype('<i2')
with wave.open(out, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print('wrote', out)
