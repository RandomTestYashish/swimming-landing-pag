import * as THREE from 'three';

/**
 * A procedural sky used as the scene's environment map.
 *
 * Everything here is generated at runtime: no HDRI is fetched, so the page
 * has no external asset dependency and no licensing question, and it still
 * gives physically based materials something real to reflect.
 */
function skyCanvas(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 256;
  const ctx = c.getContext('2d')!;

  // sky: warm at the horizon, cool overhead — late morning
  const sky = ctx.createLinearGradient(0, 0, 0, 128);
  sky.addColorStop(0, '#9fc4dd');
  sky.addColorStop(0.55, '#cfe0ea');
  sky.addColorStop(1, '#f4efe6');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 512, 128);

  // ground bounce: warm limestone, the dominant fill light on the swimmer
  const ground = ctx.createLinearGradient(0, 128, 0, 256);
  ground.addColorStop(0, '#efe7da');
  ground.addColorStop(1, '#c9bfae');
  ctx.fillStyle = ground;
  ctx.fillRect(0, 128, 512, 128);

  // the sun, placed to match the directional light
  const sun = ctx.createRadialGradient(150, 40, 2, 150, 40, 54);
  sun.addColorStop(0, '#fffdf6');
  sun.addColorStop(0.25, 'rgba(255,250,232,0.85)');
  sun.addColorStop(1, 'rgba(255,247,225,0)');
  ctx.fillStyle = sun;
  ctx.fillRect(96, 0, 108, 108);

  // a few soft clouds so reflections have structure to pick up
  ctx.globalAlpha = 0.5;
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

export function buildEnvironment(renderer: THREE.WebGLRenderer) {
  const tex = new THREE.CanvasTexture(skyCanvas());
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.SRGBColorSpace;

  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  const rt = pmrem.fromEquirectangular(tex);

  tex.dispose();
  pmrem.dispose();
  return rt.texture;
}
