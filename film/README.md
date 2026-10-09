# Portfolio film

15-second, 1920×1080, 24 fps typographic film built from `docs/portfolio_storyboard.md`.

- `index.html` + `film.js`: the film as a single canvas. `renderFrame(f)` draws frame `f` (0–359) deterministically.
  Open `index.html` in a browser to watch it loop, or `index.html?f=120` to inspect one frame.
- `render.cjs`: renders every frame in headless Chromium and pipes them to ffmpeg:
  `NODE_PATH="$(npm root -g)" node film/render.cjs` → `film/out/yashish-portfolio-film.mp4`
- `fonts/`: Inter Display Bold/ExtraBold (SIL OFL 1.1, see `LICENSE-Inter.txt`).

`preview.html` is a player with a scrubber, scene jumps and the score in sync.

## Music

`music.py` synthesises an original score (numpy only, 120 BPM, F minor) with every hit placed on a film frame.
`python3 film/music.py` writes `out/score.wav`; `render.cjs` muxes it into the MP4 automatically when it exists.
To swap in a licensed track, replace `out/score.wav` (15.0 s, 48 kHz) and re-render.
