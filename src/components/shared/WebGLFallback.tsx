import './WebGLFallback.css';

/**
 * Shown when WebGL is unavailable or has been lost. The composition, the
 * copy and every control stay in place; only the live scene is replaced.
 */
export function WebGLFallback() {
  return (
    <div className="glfb" role="img" aria-label="A swimmer crossing a sunlit pool, seen from the deck">
      <div className="glfb__sky" />
      <div className="glfb__deck" />
      <div className="glfb__water">
        <div className="glfb__caustics" />
        <div className="glfb__swimmer" />
      </div>
    </div>
  );
}

export function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
  } catch {
    return false;
  }
}
