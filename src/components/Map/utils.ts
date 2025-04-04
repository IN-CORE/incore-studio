/**
 * See discussions here: https://github.com/mapbox/mapbox-gl-js/issues/6707
 */
export function runWhenReady(map: maplibregl.Map, fn: () => void) {
    if (map.loaded()) {
        fn();
    } else {
        map.once("render", fn);
    }
}

/**
 * MapLibre GL JS v3 has removed `mapbox-gl-supported` from their API.
 * This function is copied from: https://maplibre.org/maplibre-gl-js/docs/examples/check-for-support/
 *
 * Caveat: This function creates a new WebGL context which won't be destroyed until garbage collection.
 * Calling this function repeatedly will likely cause the "too many active WebGL contexts" error.
 */
function detectWebglSupport() {
    if (window.WebGLRenderingContext) {
        const canvas = document.createElement("canvas");
        try {
            // Note that { failIfMajorPerformanceCaveat: true } can be passed as a second argument
            // to canvas.getContext(), causing the check to fail if hardware rendering is not available. See
            // https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext
            // for more details.
            const context = canvas.getContext("webgl2") || canvas.getContext("webgl");
            if (context && typeof context.getParameter === "function") {
                return true;
            }
        } catch (e) {
            // WebGL is supported, but disabled
        }
        return false;
    }
    // WebGL not supported
    return false;
}

export const IS_WEBGL_SUPPORTED = detectWebglSupport();
