import { VERT, FRAG } from './waterShader';

type Options = {
  surface: number;   // waterline position in uv space (0 = bottom, 1 = top)
  quality: number;   // 1 full, 0 static
};

const hex = (h: string): [number, number, number] => [
  parseInt(h.slice(1, 3), 16) / 255,
  parseInt(h.slice(3, 5), 16) / 255,
  parseInt(h.slice(5, 7), 16) / 255,
];

/**
 * Owns one WebGL context drawing the pool. Deliberately small: a single
 * full-quad pass, no geometry, no textures. It stops rendering whenever it
 * is off screen or the tab is hidden, so the page costs nothing when the
 * water is not visible.
 */
export class WaterRenderer {
  private gl: WebGLRenderingContext | null = null;
  private uniforms: Record<string, WebGLUniformLocation | null> = {};
  private raf = 0;
  private start = performance.now();
  private running = false;
  private visible = true;
  private dpr = 1;
  private depth = 0;
  private opts: Options;

  constructor(private canvas: HTMLCanvasElement, opts: Options) {
    this.opts = opts;
    this.init();
  }

  private compile(type: number, src: string) {
    const gl = this.gl!;
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn('[water] shader compile failed', gl.getShaderInfoLog(s));
      gl.deleteShader(s);
      return null;
    }
    return s;
  }

  private init() {
    const gl = this.canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false,
    });
    if (!gl) return; // caller keeps its CSS gradient fallback
    this.gl = gl;

    const vs = this.compile(gl.VERTEX_SHADER, VERT);
    const fs = this.compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) { this.gl = null; return; }

    const p = gl.createProgram()!;
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      console.warn('[water] link failed', gl.getProgramInfoLog(p));
      this.gl = null;
      return;
    }
    gl.useProgram(p);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(p, 'aPos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    for (const n of ['uTime', 'uRes', 'uDepth', 'uSurface', 'uSurfaceCol', 'uMidCol', 'uDeepCol', 'uQuality']) {
      this.uniforms[n] = gl.getUniformLocation(p, n);
    }

    const css = getComputedStyle(document.documentElement);
    const col = (name: string, fallback: string) =>
      hex((css.getPropertyValue(name).trim() || fallback));
    gl.uniform3fv(this.uniforms.uSurfaceCol!, col('--pool-surface', '#48c7e6'));
    gl.uniform3fv(this.uniforms.uMidCol!, col('--pool-mid', '#159fc5'));
    gl.uniform3fv(this.uniforms.uDeepCol!, col('--pool-deep', '#087fa8'));
    gl.uniform1f(this.uniforms.uSurface!, this.opts.surface);
    gl.uniform1f(this.uniforms.uQuality!, this.opts.quality);

    this.resize();
  }

  get supported() { return this.gl !== null; }

  setDepth(d: number) { this.depth = d; }

  setVisible(v: boolean) {
    this.visible = v;
    if (v) this.play(); else this.pause();
  }

  resize() {
    const gl = this.gl;
    if (!gl) return;
    // A pool of moving light does not need device-pixel sharpness; capping
    // the buffer here is the single biggest performance lever.
    this.dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.max(1, Math.round(this.canvas.clientWidth * this.dpr));
    const h = Math.max(1, Math.round(this.canvas.clientHeight * this.dpr));
    if (this.canvas.width === w && this.canvas.height === h) return;
    this.canvas.width = w;
    this.canvas.height = h;
    gl.viewport(0, 0, w, h);
    gl.uniform2f(this.uniforms.uRes!, w, h);
    if (!this.running) this.frame(performance.now()); // repaint while paused
  }

  private frame = (now: number) => {
    const gl = this.gl;
    if (!gl) return;
    gl.uniform1f(this.uniforms.uTime!, (now - this.start) / 1000);
    gl.uniform1f(this.uniforms.uDepth!, this.depth);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (this.running) this.raf = requestAnimationFrame(this.frame);
  };

  play() {
    if (this.running || !this.gl || !this.visible || this.opts.quality === 0) {
      if (this.gl && this.opts.quality === 0) this.frame(performance.now());
      return;
    }
    this.running = true;
    this.raf = requestAnimationFrame(this.frame);
  }

  pause() {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  destroy() {
    this.pause();
    const gl = this.gl;
    if (gl) {
      const ext = gl.getExtension('WEBGL_lose_context');
      if (ext) ext.loseContext();
    }
    this.gl = null;
  }
}
