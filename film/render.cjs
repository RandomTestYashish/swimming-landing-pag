// Renders film/index.html frame by frame in headless Chromium and encodes an MP4 with ffmpeg.
// Usage: NODE_PATH="$(npm root -g)" node film/render.cjs [outFile] [--frames=a-b]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const args = process.argv.slice(2);
const out = path.resolve(args.find((a) => !a.startsWith('--')) || path.join(__dirname, 'out', 'yashish-portfolio-film.mp4'));
const range = (args.find((a) => a.startsWith('--frames=')) || '--frames=0-359').slice(9).split('-').map(Number);

(async () => {
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  page.on('pageerror', (e) => { console.error(e); process.exit(1); });
  await page.goto('file://' + path.join(__dirname, 'index.html') + '?still');
  await page.evaluate(() => document.fonts.ready);
  const fontsOk = await page.evaluate(() => document.fonts.check('800 100px "Inter Display"') && document.fonts.check('700 100px "Inter Display"'));
  if (!fontsOk) throw new Error('Inter Display failed to load');

  const ff = spawn('ffmpeg', [
    '-y', '-v', 'error', '-f', 'image2pipe', '-framerate', '24', '-c:v', 'png', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-pix_fmt', 'yuv420p',
    '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709',
    '-movflags', '+faststart', out,
  ], { stdio: ['pipe', 'inherit', 'inherit'] });

  for (let f = range[0]; f <= range[1]; f++) {
    const data = await page.evaluate((n) => {
      renderFrame(n);
      return document.getElementById('film').toDataURL('image/png');
    }, f);
    const buf = Buffer.from(data.split(',')[1], 'base64');
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (f % 24 === 0) process.stdout.write(`frame ${f}\n`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
  await browser.close();
  console.log('wrote', out);
})();
