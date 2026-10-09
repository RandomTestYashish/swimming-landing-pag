# Portfolio film

15-second, 1920×1080, 24 fps typographic film built from `docs/portfolio_storyboard.md`.

- `index.html` + `film.js`: the film as a single canvas. `renderFrame(f)` draws frame `f` (0–359) deterministically.
  Open `index.html` in a browser to watch it loop, or `index.html?f=120` to inspect one frame.
- `render.cjs`: renders every frame in headless Chromium and pipes them to ffmpeg:
  `NODE_PATH="$(npm root -g)" node film/render.cjs` → `film/out/yashish-portfolio-film.mp4`
- `fonts/`: Inter Display Bold/ExtraBold (SIL OFL 1.1, see `LICENSE-Inter.txt`).

The film is silent. Add a track later and nudge cut frames ±2 to land on its beats.
