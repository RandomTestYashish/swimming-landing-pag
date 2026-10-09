# Style Guide: Reference Analysis and Motion Specification

**Reference:** Pinterest "Premiere Spotlight" launch spot (Pinterest pin 747667975687362303, file supplied by Yashish).
**Source specs:** 702×396 (16:9), 24 fps, 30.0 s, 720 frames, with a music track.
**Method:** I extracted frames at 4 fps for the whole film, plus 8–24 fps contact sheets of each transition. I ran ffmpeg scene-change detection to find cuts and sampled colours from the pixels. Hex values marked "sampled" come from the video. Values marked "by eye" are estimates, because compression smears saturated colours.

> We borrow the **visual grammar** only. Pinterest's logo, red brand mark, product UI, photography, illustrations and copy are not used. Where the reference relies on photos, 3D renders or illustrated characters, our film uses **abstract geometry and typography**.

---

## 1. Shot-by-shot breakdown of the reference

| # | Time (s) | What happens | Device |
|---|---|---|---|
| R1 | 0.00–0.20 | Blush off-white frame with a small red brand mark in the centre. Still. | Brand cold open |
| R2 | 0.20–0.45 | Hundreds of short coloured **dashes** stream in radially from the frame edges and close in on the centre. The white centre shrinks to a **black disc** holding the word "Grab". The black then floods outward from the disc and replaces the background in about 3 frames. | Radial burst + iris to black |
| R3 | 0.45–1.70 | The burst keeps streaming outward with zoom blur around the disc and rotates slightly. | Sustained energy |
| R4 | 1.70–2.80 | **Hard cut to black.** A tiny centred "the spotlight" (about 3% of frame height) pushes in slowly, about 100% → 140% over 1 s. | Scale contrast, slow push |
| R5 | 2.80–2.95 | The letters drop out from the left ("he spotlight") over 2 frames, then a **hard cut** to "Spotlight" set huge (about 13% of frame height) in the lower right. | Scale snap |
| R6 | 3.15–3.55 | "Introducing" and then "Premiere" **type on letter by letter**, 1 character per frame, flush left above. The result is a 3-line stack: left, left, then the last line indented right. The stack fills the frame and almost bleeds off the edges. | Kinetic stack build |
| R7 | 3.55–4.90 | Stack holds with micro push-in. | Hold |
| R8 | 4.80–5.15 | **Staggered defocus exit:** the bottom line blurs first, then the middle, then the top. A rounded-rect card **sharpens out of the blur** at centre. Blur hands the shot on, not a cut. | Rack-focus hand-off |
| R9 | 5.15–9.00 | Phone-ratio card grows. Its content scrolls, then a second card **swaps in with a 3D yaw** (about 7.75 s). | Card system |
| R10 | 9.00–10.40 | Card morphs portrait → landscape. The illustrated figure **breaks out of the card edge**. The card shrinks and drifts off bottom-right. | Frame-breaking |
| R11 | 10.40–13.90 | One-word cards on black: "Our / highest / impact / ad. / Ever." Words change by **letter scramble**: shared letters stay, the rest blink out in random order over 2–3 frames, and new letters pop in. The first frame of "Our" is **orange**, then it settles to white. "Ever." **scales up** about 100% → 115% in its last 0.4 s. | Word-by-word kinetic type |
| R12 | 13.90–17.00 | Full-bleed saturated 3D still life with huge white 2-line "Own the / screen". Background and text **shrink into a card** (zoom out). Dark bubble field behind. | Zoom-out reveal |
| R13 | 17.00–18.30 | Card centred, flanked by "Own" on the left and "the moment" on the right. The sentence is **split around an object**. | Split-flank composition |
| R14 | 18.30–21.40 | Card slides sideways onto a new full-bleed still life. Text inside the card changes "Get seen" → "where it matters". | Card over field |
| R15 | 21.40–23.20 | Black. A small 2-line centred sentence **builds word by word**, about 0.12–0.25 s apart: "Your audience is / already on Pinterest." Pulls back slightly (100% → 95%) at the end. | Line build + pull-back |
| R16 | 23.20–25.00 | Kaleidoscopic **radial ring system** (petals, circles, glowing lilac rays) that rotates and **changes form on each word**: "Step / into / the spotlight". One word per beat, centred. | Geometry as rhythm |
| R17 | 25.00–27.20 | Symmetrical illustration (two faces, hands, eye) with "All eyes on you". | Hero image |
| R18 | 27.20–30.00 | **Hard cut** to blush off-white. Red wordmark centred. The round brand mark **rolls in** from the right (rotating), docks after the wordmark, then the lockup resolves to the brand logo. Holds about 1.5 s. | Signature end card |

**Cut points detected:** 0.88, 13.92, 21.38, 23.29, 23.71, 24.96, 27.25 s, plus many type-only hard cuts below the detection threshold.

---

## 2. Colour

The film uses **two grounds**: black for type, and blush off-white for the brand bookends. Between them sits a **warm-to-cool gradient family** (hot pink → coral → amber, with lilac light).

| Role | Reference value | Notes |
|---|---|---|
| Type ground | `#020000` (sampled) | Pure black. All kinetic type sits here. |
| Bookend ground | `#FFF4FA` (sampled) | Blush off-white, never pure white |
| Type colour | `#FBF3F7` (by eye; antialiased samples read about `#EBE4E8`) | Warm off-white, never `#FFFFFF` |
| Hot coral | `#E4515A` (sampled) | Top-left of gradient fields |
| Amber | `#F19C50` (sampled) | Bottom-right of gradient fields |
| Deep red | `#D6313C` (sampled) | Petal mid-tones |
| Magenta-plum | `#A02856` (sampled) | Petal shadows |
| Lilac light | about `#C7A8FF` (by eye) | Rays, glows, highlights. The only cool colour. |
| Orange accent flash | about `#FF9A1A` (by eye) | Used for **one frame** on the first word of a sequence |
| Brand red | Pinterest red | **Not used** (trademark) |

**Rules seen in the reference**
- Gradients always run **diagonally, warm top-left → warmer amber bottom-right**.
- Black is never tinted. Colour arrives as **objects** (dashes, cards, petals), not as background washes, except in full-bleed "hero" shots.
- Text over colour is always the warm off-white.

### Our adaptation

| Token | Value | Use |
|---|---|---|
| `--ink` | `#050404` | Type ground |
| `--paper` | `#FFF5F8` | Opening and closing ground |
| `--type` | `#FBF3F7` | All type on dark |
| `--coral` | `#E4515A` | Gradient start |
| `--amber` | `#F19C50` | Gradient end |
| `--plum` | `#8E2350` | Geometry shadows |
| `--lilac` | `#C7A8FF` | Light, rays, highlight dot |
| `--signature` | `#FF4A1C` (proposed) | Our replacement for the brand red: monogram, end-card wordmark, one-frame accent flash |

The signature is a vermilion that stays clear of **Airtel red** and **Pinterest red**. It's a proposal: tell me if you have a personal brand colour.

---

## 3. Typography

| Property | Reference | Our spec |
|---|---|---|
| Family | Pinterest Sans (proprietary grotesk, close to Helvetica Now Display / Neue Haas) | **Inter Tight** (Google Fonts, free). Alternative: Neue Haas Grotesk Display, if you hold a licence. |
| Weight | Bold throughout. One weight only, no light or regular. | 700 (stack lines up to 800) |
| Case | **Sentence case** everywhere, including headlines ("Introducing Premiere Spotlight") | Sentence or title case (see decision below) |
| Tracking | Tight, about −2% on display sizes, about −1% on small | −3% at ≥ 200 px, −1.5% at ≤ 60 px |
| Leading | Very tight on stacks, about 0.86 × size. Lines nearly touch. | 0.86 |
| Alignment | Centred for single words and sentences. **Flush-left with an indented last line** for stacks. | Same |
| Punctuation | Full stops used for emphasis ("ad.", "Ever.") | Same: full stop on the philosophy and closing lines |

**Scale ladder** (as % of frame height, measured in the reference):

| Level | Height | Use |
|---|---|---|
| XS | 2.5–3% | Opening whisper ("the spotlight"), small sentence builds |
| S | 5–6% | Single-word cards, words over geometry |
| M | 9–10% | Text inside cards |
| L | 13–15% | Full-frame stacks, hero lines |

The dramatic moves always **jump between non-adjacent levels** (XS → L), never step gradually.

**Copy decision:** the reference never uses ALL CAPS. Your draft copy is in caps. I've written the storyboard in **title / sentence case** to match the reference (the words are unchanged). Say if you want caps instead.

---

## 4. Motion language

### 4.1 Core principles
1. **Hard cuts carry the rhythm. Motion lives inside shots.** Almost every scene change is a straight cut on the beat. Only two hand-offs are true transitions: the blur hand-off (R8) and the zoom-out into a card (R12).
2. **Scale contrast over movement.** Type rarely translates across the frame. It appears, changes size or swaps letters.
3. **Typing at frame rate.** Characters appear **1 per frame** (24 cps), with no fade, slide or ease. Each character simply exists.
4. **Letter scramble between words.** When a word replaces another in the same spot, letters the two words share stay put, the others vanish in random order over 2–3 frames, and new letters snap in.
5. **Slow drift on holds.** Every hold has a barely visible push-in (about 2–5% over the hold) so the frame never fully stops.
6. **One accent frame.** A new sequence's first word flashes in accent colour for 1–2 frames, then settles to off-white.
7. **Geometry changes on the beat.** Background geometry rotates continuously, about 15–30° per second, and **changes form** (petals → circles → ring) on each word cut.
8. **Objects break the frame.** Content escapes its container (figure out of card) to signal energy.

### 4.2 Easing

| Move | Curve | Duration |
|---|---|---|
| Slow push or pull on holds | linear or `cubic-bezier(.33,0,.67,1)` | whole hold |
| Card grow, zoom into card | expo-out `cubic-bezier(.16,1,.3,1)` | 8–10 frames |
| Card slide or yaw swap | `cubic-bezier(.7,0,.2,1)` (in-out, front-loaded) | 6–8 frames |
| Punch scale (end of a word sequence) | expo-out | 8–10 frames, +12–15% |
| Burst dashes inbound | expo-in then hard stop | 5–6 frames |
| Black iris flood | linear | 3 frames |
| Defocus exit | ease-in, 0 → 24 px blur | 6 frames per line, 2-frame stagger |
| End mark roll-in | expo-out translate + 360° rotation | 10–12 frames |

No bounce, overshoot or elastic springs anywhere.

### 4.3 Timing and pacing
- **Average shot:** about 1.6 s. **Word beats:** 0.45–0.6 s each, consistent with a mid-tempo music track. This is estimated from the cut timing, not measured from the audio.
- **Sentence builds:** 0.12–0.25 s between words.
- **Structure:** energy (burst) → statement (stack) → demonstration (cards) → rhythm (word beats) → demonstration (hero fields) → rhythm (rings) → signature. Fast and dense passages alternate with full-bleed hero beats.
- **Bookends:** it opens and closes on the light ground. Everything between is dark.

### 4.4 Camera
No simulated camera moves (no pans or orbit). "Camera" is expressed through **scale**: push-ins on holds, zoom-outs that reveal a container, and one 3D yaw on the card swap (about 25°, with slight perspective).

---

## 5. Composition
- **Centre axis dominates.** Single words, sentences, cards and the ring system are all centred on the frame.
- **Stacks break the centre:** flush-left at about 2% margin with an indented last line, filling about 95% of the frame width. Type reaches the frame edges **without being cropped**.
- **Negative space:** small text sits in ≥ 90% empty black. Contrast comes from extremes: either near-empty or edge-to-edge.
- **Split-flank:** words placed either side of a central object, on the same baseline, with equal gaps.
- **Symmetry** in all geometry (radial or mirrored).

---

## 6. Texture, light and effects
- **No film grain, no vignette, no noise.** It's a clean digital finish.
- **Motion blur** on fast radial dashes (directional, along the radius).
- **Soft glow** on lilac rays and petal edges (additive, large radius, low intensity).
- **Defocus (Gaussian) blur** as a transition tool only, never as decoration.
- **Card treatment:** rounded rect (corner radius about 6% of card width), 1–2 px light inner edge, no drop shadow on black.
- **Specular highlight dot:** a small soft white circle on the black disc (R16–R17). It reads as a lens or eye.

---

## 7. How shots connect

| Connection | Example | Our use |
|---|---|---|
| Radial converge → disc → iris flood | R1 → R2 | Opening |
| Hard cut with scale jump (XS → L) | R4 → R5 | Name reveal |
| Letter drop-out before the cut | R5 | Name reveal |
| Defocus hand-off: old text blurs while the new object sharpens | R8 | Name → role |
| Zoom-out into container | R12 | Experience |
| Card swap (yaw / slide) | R9, R14 | Role, experience |
| Letter scramble in place | R11 | Philosophy |
| Geometry morph on beat | R16 | Craft |
| Hard cut dark → light for the signature | R17 → R18 | Closing |

---

## 8. Translation rules for our film
1. Photos, 3D still lifes and illustrations → **procedural gradient fields and geometric ring systems** in our palette.
2. Product UI cards → **empty rounded-rect frames**, a nod to product design without showing UI screenshots or employer products.
3. Brand mark → a **"Y" monogram disc** in `--signature` (needs your approval).
4. Copy length: never more than **4 words on screen at once**, except the end-card signature.
5. Format: **1920×1080, 24 fps, 360 frames (15.0 s)**, matching the reference's frame rate so typing at 1 character per frame reads the same.
6. Audio: the reference is cut to music. We need a licensed track, or a decision to go silent (see storyboard open questions).
