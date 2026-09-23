export function hasWebGLSupport(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      (canvas.getContext("webgl2") as WebGLRenderingContext | null) ||
      (canvas.getContext("webgl") as WebGLRenderingContext | null) ||
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);
    if (!gl) return false;

    // Some sandboxed/GPU-disabled browsers still return a context object,
    // but report vendor/renderer as literally "Disabled" — that context is
    // unusable even though it exists, so check for it explicitly.
    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    if (debugInfo) {
      const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      if (typeof vendor === "string" && /disabled/i.test(vendor)) return false;
      if (typeof renderer === "string" && /disabled/i.test(renderer)) return false;
    }
    return true;
  } catch {
    return false;
  }
}
