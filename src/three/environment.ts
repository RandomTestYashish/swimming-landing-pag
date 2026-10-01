import * as THREE from 'three';

/**
 * A procedural sky used as the scene's environment map.
 *
 * Everything here is generated at runtime: no HDRI is fetched, so the page
 * has no external asset dependency and no licensing question, and it still
 * gives physically based materials something real to reflect.
 */
function skyCanvas(dark: boolean): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 256;
  const ctx = c.getContext('2d')!;

  // late morning, or the same sky two hours after sunset
  const sky = ctx.createLinearGradient(0, 0, 0, 128);
  if (dark) {
    sky.addColorStop(0, '#0a1119');
    sky.addColorStop(0.55, '#16242f');
    sky.addColorStop(1, '#2b3c48');
  } else {
    sky.addColorStop(0, '#9fc4dd');
    sky.addColorStop(0.55, '#cfe0ea');
    sky.addColorStop(1, '#f4efe6');
  }
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 512, 128);

  // ground bounce: warm limestone, the dominant fill light on the swimmer
  const ground = ctx.createLinearGradient(0, 128, 0, 256);
  if (dark) {
    ground.addColorStop(0, '#1b2630');
    ground.addColorStop(1, '#0d141a');
  } else {
    ground.addColorStop(0, '#e9ecec');
    ground.addColorStop(1, '#bfc6c6');
  }
  ctx.fillStyle = ground;
  ctx.fillRect(0, 128, 512, 128);

  // the sun, placed to match the directional light
  const sun = ctx.createRadialGradient(150, dark ? 96 : 40, 2, 150, dark ? 96 : 40, dark ? 72 : 54);
  if (dark) {
    sun.addColorStop(0, 'rgba(255,236,196,0.5)');
    sun.addColorStop(0.3, 'rgba(236,190,132,0.2)');
    sun.addColorStop(1, 'rgba(236,190,132,0)');
  } else {
    sun.addColorStop(0, '#fffdf6');
    sun.addColorStop(0.25, 'rgba(255,250,232,0.85)');
    sun.addColorStop(1, 'rgba(255,247,225,0)');
  }
  ctx.fillStyle = sun;
  ctx.fillRect(96, 0, 108, 108);

  // a few soft clouds so reflections have structure to pick up
  ctx.globalAlpha = dark ? 0.12 : 0.5;
  ctx.fillStyle = '#ffffff';
  for (const [x, y, rx, ry] of [
    [330, 44, 70, 15], [380, 58, 46, 11], [70, 66, 54, 12], [455, 34, 40, 9],
  ] as const) {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  return c;
}

/**
 * Returns the render target rather than its texture: the caller needs the
 * target to release the framebuffer as well, and disposing the texture alone
 * strands one FBO per theme change.
 */
export function buildEnvironment(renderer: THREE.WebGLRenderer, dark = false) {
  const tex = new THREE.CanvasTexture(skyCanvas(dark));
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.SRGBColorSpace;

  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  const rt = pmrem.fromEquirectangular(tex);

  tex.dispose();
  pmrem.dispose();
  return rt;
}
