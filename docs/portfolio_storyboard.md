# Portfolio Film: Storyboard

**Working title:** *Yashish: Designing What's Next*
**Format:** 1920×1080 (16:9) · 24 fps · 15.0 s (360 frames) · fully typographic
**Visual system:** see [`style_guide.md`](./style_guide.md). **Copy sources:** see [`portfolio_content.md`](./portfolio_content.md).

## Concept

**"From complex to simple, in fifteen seconds."**

The film opens loud: a burst of hundreds of coloured dashes, a little like data noise. Over 15 seconds the frame calms down step by step into a single quiet signature on a light ground. The structure acts out the philosophy line, *making complexity feel simple*, rather than just saying it.

It follows the reference's rhythm: energy → statement → demonstration → word beats → hero fields → geometry rhythm → signature.

Name treatment: **"Yashish" only** (per your note). There's no surname anywhere on screen.

## Timeline overview

| # | Scene | Time (s) | Frames | Reference device borrowed |
|---|---|---|---|---|
| 01 | Ignite | 0.00–1.00 | 0–23 | Radial burst → black disc → iris flood (R1–R3) |
| 02 | Identity | 1.00–3.00 | 24–71 | XS push-in → letter drop → L stack typed on (R4–R7) |
| 03 | Role | 3.00–5.00 | 72–119 | Defocus hand-off → card system → yaw swaps (R8–R10) |
| 04 | Philosophy | 5.00–7.40 | 120–177 | Word-by-word letter scramble + punch (R11) |
| 05 | Experience | 7.40–10.00 | 178–239 | Full-bleed hero → zoom-out into card → split-flank → card over field (R12–R14) |
| 06 | Craft | 10.00–12.60 | 240–301 | Rotating ring system, word per beat (R16) |
| 07 | Signature | 12.60–15.00 | 302–359 | Sentence build → hard cut to light end card → mark roll-in (R15, R18) |

> **Retimed for the score (120 BPM, 1 beat = 12 frames).** Cuts that were 1–3 frames off the grid now sit on it: Role swaps f90/96/102, morph f108; "feel" f144; Experience starts f180 (zoom-out f198, Paytm slide f222); Craft words f240/252/264/276; Signature sentence f300/306/312, light end card f324, monogram roll f330–342. `film/film.js` holds the exact frames.

Frame numbers are 0-indexed at 24 fps. "Beat" means a cut point that should land on the music's beat once we pick a track. Timings shift by ±2 frames to snap to it.

---

## Scene 01: Ignite · 0.00–1.00 s (24 f)

| | |
|---|---|
| **Text** | "Meet" |
| **Position / hierarchy** | Centred inside a black disc (disc Ø 18% of frame height). Text at level S (about 5% height), `--type`. |
| **Background** | `--paper` blush for f0–5, then `--ink` black after the iris flood. |
| **Effects** | About 220 radial dashes (lengths 20–90 px, widths 6–10 px) coloured from `--coral`, `--amber`, `--plum`, `--lilac`, `--type` and `--ink`, with radial motion blur. |
| **Assets** | "Y" monogram disc (to design, in `--signature`); dash palette; Inter Tight 700. |

| Time | Action | Easing |
|---|---|---|
| 0.00–0.20 (f0–4) | Blush frame, small **"Y" monogram disc** centred (Ø 7% height). Still. | none |
| 0.20–0.33 (f5–7) | Dashes rush **inward** from all four edges and close a ring around the monogram. | expo-in, hard stop |
| 0.33–0.42 (f8–9) | The white centre collapses to the **black disc**. The monogram is replaced by "Meet". | cut |
| 0.42–0.54 (f10–12) | **Iris flood:** black expands from the disc to cover the background (the dashes stay on top). | linear, 3 f |
| 0.54–1.00 (f13–23) | Dashes stream **outward** with zoom blur and the field rotates +6°. "Meet" holds. | linear |
| **Exit / transition** | **Hard cut on beat** to black. | |

---

## Scene 02: Identity · 1.00–3.00 s (48 f)

| | |
|---|---|
| **Text** | 1) "Yashish" (XS whisper) → 2) stack: "Hello," / "I'm" / **"Yashish"** |
| **Position / hierarchy** | Whisper: centred, level XS (3% height). Stack: level L (about 14% height), leading 0.86, tracking −3%. "Hello," and "I'm" sit flush left at 2% margin; "Yashish" sits **indented right**, so its right edge is at 98% width. The stack fills about 95% of the frame width. |
| **Background** | `--ink`, flat. |
| **Assets** | Inter Tight 800 for the stack. |

| Time | Action | Easing |
|---|---|---|
| 1.00–1.50 (f24–35) | Tiny lowercase "yashish" centred, **slow push-in** 100% → 135%. | linear |
| 1.50–1.58 (f36–37) | Letters drop out from the left ("ashish" → "shish"), 1 per frame. | step |
| 1.58 (f38) | **Hard cut / scale snap:** "Yashish" at level L in the bottom-right slot. | cut |
| 1.79–2.21 (f43–53) | "Hello," types on top-left, then "I'm" on line 2, **1 character per frame**. "Yashish" is placed **first** and the lines above build onto it, as in the reference. | step, 24 cps |
| 2.21–2.75 (f53–65) | Hold, with micro push-in 100% → 102%. | linear |
| 2.75–3.00 (f66–71) | **Defocus exit**, staggered bottom-up: "Yashish" blurs first (0 → 24 px over 6 f), then "I'm" (+2 f), then "Hello," (+2 f), fading as they blur. | ease-in |
| **Transition** | Scene 03's card **sharpens from blur at centre** during the exit, so the scenes overlap by about 4 frames. | |

**Copy note:** "Hello, I'm" is **new copy** I added so the reference's three-line stack still works now that the name is one word. Fallback: "Yashish" alone, set at L and centred. Pick one.

---

## Scene 03: Role · 3.00–5.00 s (48 f)

| | |
|---|---|
| **Primary text** | "Lead Product Designer" |
| **Secondary text** | "Strategy." · "Experience." · "Interaction." |
| **Position / hierarchy** | A portrait **rounded-rect frame** (9:16, 30% of frame height at rest, growing to 62%), centred. Primary text sits inside the frame at level M, on 3 lines, white, left-aligned with a 10% inset at the top. Secondary words sit inside the frame at level M, centred, one at a time. |
| **Background** | `--ink`. Frame fill: diagonal gradient `--coral` → `--amber` with a slow drifting lilac glow blob, to stand in for the reference's photo content. |
| **Effects** | Frame corner radius 6% of width, 1.5 px light inner edge. No drop shadow. |
| **Assets** | Gradient field shader / layer; frame shape. |

| Time | Action | Easing |
|---|---|---|
| 3.00–3.30 (f72–79) | Frame **sharpens out of blur** (24 px → 0) and grows 30% → 62% of frame height. | expo-out |
| 3.30–3.65 (f80–87) | "Lead / Product / Designer" **types on** inside the frame, 1 character per frame. | step |
| 3.65–3.80 (f88–91) | Hold. | — |
| 3.80 (f92) | **Card yaw swap:** the frame swings out left (yaw −25°) as a new frame swings in from the right. The new frame has a lilac-weighted gradient and holds "Strategy." | in-out, 6 f |
| 4.10 (f99) | Swap on beat → "Experience." (amber-weighted gradient) | in-out, 6 f |
| 4.40 (f106) | Swap on beat → "Interaction." (coral-weighted gradient) | in-out, 6 f |
| 4.60–5.00 (f110–119) | The frame **morphs portrait → landscape** (16:9, 55% width). The word "Interaction." **breaks out** of the frame's top edge. The frame then shrinks and drifts off the bottom-right as the word slides out with it. | expo-in |
| **Transition** | **Hard cut** to empty black on beat. | |

---

## Scene 04: Philosophy · 5.00–7.40 s (58 f)

| | |
|---|---|
| **Text** | "Making" → "complexity" → "feel" → "simple." |
| **Position / hierarchy** | One word at a time, centred, level S (about 6% height). On "simple." the punch takes it to about 6.9%. |
| **Background** | `--ink`, flat. Maximum negative space. |
| **Effects** | Letter scramble between words. One-frame **accent flash** on "Making" (`--signature`, f120–121), then `--type`. |

| Time | Word | Transition in |
|---|---|---|
| 5.00–5.50 (f120–131) | "Making" | Snaps in with an accent flash on the first 2 frames |
| 5.50–6.05 (f132–145) | "complexity" | **Letter scramble**: "Making" letters vanish in random order over 3 f, "complexity" letters snap in over 3 f |
| 6.05–6.50 (f146–155) | "feel" | Scramble. Shared letters **e, l** stay locked in place while the rest vanish. |
| 6.50–7.40 (f156–177) | "simple." | Scramble. **l, e** stay. Then a **punch scale** 100% → 115% over 10 f (expo-out) and a hold to the cut. |

Shared letters are the whole idea of this scene: complexity sheds letters until it becomes *simple*.

- **Transition:** **Hard cut** on beat into Scene 05's full-bleed field.
- **Assets:** a letter-matching table (computed at build time).

---

## Scene 05: Experience · 7.40–10.00 s (62 f)

| | |
|---|---|
| **Text** | "Airtel / Digital" → "Wynk" [card] "Music" → "Paytm" |
| **Position / hierarchy** | Hero: 2 lines at level L, white, centred-left (the reference's "Own the / screen"). Split-flank: "Wynk" left and "Music" right of a centred card, both at level S on the card's vertical centre line, with equal 4% gaps. Paytm: inside the card at level M, centred. |
| **Background** | Full-bleed **abstract field** in place of the reference's 3D still lifes: deep gradient `--coral`→`--amber`, with floating soft 3D-ish **pills and rings** (`--plum`, `--lilac`, glossy highlights) drifting slowly. Each company gets a variation: Airtel coral/plum, Wynk lilac/plum, Paytm amber/coral. **No company logos or brand colours.** |
| **Assets** | 3 geometric field compositions (procedural or pre-rendered); card frame. |

| Time | Action | Easing |
|---|---|---|
| 7.40–8.20 (f178–196) | Full-bleed Airtel field, "Airtel / Digital" huge white. Field shapes drift and the frame pushes in 100% → 103%. | linear |
| 8.20–8.50 (f197–203) | **Zoom-out reveal:** the field and text shrink into a centred portrait card (62% height). Black appears around it. | expo-out, 8 f |
| 8.50–8.58 (f204–205) | The card's contents swap (cut) to the Wynk field. | cut |
| 8.58–9.20 (f206–220) | **Split-flank:** "Wynk" appears left and "Music" right of the card (2 f stagger). Hold, card micro push. | snap |
| 9.20–9.45 (f221–226) | The card **slides left off-frame** while a new card slides in from the right. Behind it, the Paytm field **fills the whole frame** (card over field, as in the reference's "Get seen"). | in-out, 6 f |
| 9.45–10.00 (f227–239) | "Paytm" inside the card, white on black card top. Hold. | — |
| **Transition** | **Hard cut** on beat. | |

**Order:** companies appear in the order you gave. If the order should be chronological (most recent last, or first), tell me the dates (see open questions).

---

## Scene 06: Craft · 10.00–12.60 s (62 f)

| | |
|---|---|
| **Text** | "Product thinking" → "Interaction" → "Visual storytelling" → "Motion" |
| **Position / hierarchy** | Centred inside the ring system, level S. Two-word items go on two lines (leading 0.9). |
| **Background** | `--ink` with a **radial ring system** that rotates continuously (+20°/s) and **changes form on each word cut**. |
| **Effects** | Lilac rays behind the rings (additive glow), soft edges on petals. |
| **Assets** | 4 ring-system states (procedural geometry). |

| Time | Word | Ring state (on the cut) |
|---|---|---|
| 10.00–10.55 (f240–252) | "Product / thinking" | **Petals:** 16 coral/red petals, inner ring of 14 small lilac circles, lilac rays |
| 10.55–11.05 (f253–264) | "Interaction" | **Circles:** large overlapping pink/lilac discs orbiting at the edge, dark centre |
| 11.05–11.60 (f265–277) | "Visual / storytelling" | **Pills:** amber/coral pills pointing inward, lilac halo ring |
| 11.60–12.60 (f278–301) | "Motion" | **Iris:** lilac ring around a black disc. "Motion" sits inside the disc and a small white **highlight dot orbits** the disc's rim, so the word itself shows motion. Ring rotation slows to a stop by f301. |

- **Transition:** **Hard cut** on beat to black.
- **Why this works:** the strengths become *objects* the geometry reorganises around. The film gets more ordered here, on the way to the calm close.

---

## Scene 07: Signature · 12.60–15.00 s (58 f)

| | |
|---|---|
| **Text** | 1) "Designing / what's next." 2) End card: "Yashish" + "Y" monogram disc, then "Lead Product Designer" |
| **Position / hierarchy** | 1) Centred, 2 lines, level XS–S (4% height), `--type` on `--ink`. 2) "Yashish" centred, level S, `--signature` on `--paper`. Monogram docks to the right of the wordmark. The secondary line sits below at XS, `--ink` at 70%. |
| **Assets** | Monogram disc; the end card. |

| Time | Action | Easing |
|---|---|---|
| 12.60–13.10 (f302–314) | **Word-by-word build:** "Designing" (f302), "what's" (f308), "next." (f312), 1 word every 4–6 frames. | snap |
| 13.10–13.60 (f315–326) | Hold, with a gentle **pull-back** 100% → 95%. | linear |
| 13.60 (f327) | **Hard cut dark → light** (`--paper`). "Yashish" wordmark centred in `--signature`. | cut |
| 13.80–14.25 (f331–342) | **"Y" monogram disc rolls in** from the right edge, rotating 360°, and docks after the wordmark. The wordmark shifts left by half the disc width so the lockup stays centred. | expo-out, 11 f |
| 14.25–14.45 (f342–347) | "Lead Product Designer" **types on** below, 1 character per frame (2 per frame if needed to fit). | step |
| 14.45–15.00 (f347–359) | **Hold, no motion.** This is the film's only perfectly still moment, and the deliberate pause. | — |
| **Exit** | Ends on the held frame. No fade. | |

---

## Asset list

| Asset | Status |
|---|---|
| Inter Tight 700/800 (Google Fonts, OFL) | Available |
| "Y" monogram disc | To design. Needs your approval. |
| Radial dash burst (procedural) | To build |
| Gradient frame fills, 3 variants (procedural) | To build |
| Company abstract fields, 3 variants (procedural pills/rings) | To build |
| Ring-system states, 4 (procedural) | To build |
| Letter-scramble mapping (computed) | To build |
| Music track (licensed) | **Needed from you**, or confirm silent |

## Open questions for you

1. **Stack copy:** use "Hello, / I'm / Yashish" (new copy) or "Yashish" alone at L?
2. **Case:** keep sentence/title case to match the reference, or switch to ALL CAPS as in your original draft?
3. **End card secondary line:** "Lead Product Designer" or "Product Designer"?
4. **Signature colour:** is the proposed vermilion `#FF4A1C` okay, or do you have a personal brand colour?
5. **Music:** do you have a track? It's needed to lock the beat timings. Otherwise the film stays silent and the beat grid stays at roughly 0.5 s.
6. **Company order:** keep Airtel → Wynk → Paytm, or switch to chronological order?
7. **Delivery format:** MP4 render, a web page that plays the animation in the browser, or both?
