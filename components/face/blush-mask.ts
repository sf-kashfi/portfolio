// Small, expression-registered masks are prepared once at texture upload, never
// during animation. All coordinates are portrait UVs, so the mesh carries the
// flush with the skin when a cheek is pulled.
export const BLUSH_SIZE = 256;

const smooth = (a: number, b: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

const gaussian = (u: number, v: number, x: number, y: number, rx: number, ry: number, slope = 0) => {
  const dx = u - x;
  const dy = v - y - slope * dx;
  return Math.exp(-0.5 * ((dx / rx) ** 2 + (dy / ry) ** 2));
};

// A tapered facial contour, rather than an ellipse with a visible rim.
const contour = [
  [0.18, 0.435, 0.563], [0.23, 0.400, 0.613],
  [0.30, 0.378, 0.648], [0.37, 0.375, 0.657],
  [0.43, 0.392, 0.646], [0.48, 0.418, 0.622],
  [0.52, 0.458, 0.586], [0.54, 0.490, 0.553],
] as const;

let distribution: Float32Array | undefined;

function facialDistribution() {
  if (distribution) return distribution;
  distribution = new Float32Array(BLUSH_SIZE * BLUSH_SIZE);
  for (let y = 0; y < BLUSH_SIZE; y++) for (let x = 0; x < BLUSH_SIZE; x++) {
    const u = (x + 0.5) / BLUSH_SIZE, v = (y + 0.5) / BLUSH_SIZE;
    if (v <= 0.18 || v >= 0.54) continue;
    let row = 0;
    while (row < contour.length - 2 && v > contour[row + 1][0]) row++;
    const a = contour[row], b = contour[row + 1];
    const t = smooth(a[0], b[0], v);
    const left = a[1] + (b[1] - a[1]) * t;
    const right = a[2] + (b[2] - a[2]) * t;
    const feather = smooth(0, 0.026, u - left) * smooth(0, 0.026, right - u)
      * smooth(0.18, 0.235, v) * (1 - smooth(0.475, 0.54, v));
    if (!feather) continue;

    // Follow the cheekbones, then diffuse into lower cheeks and the nose.
    // Different widths/slopes avoid two identical stamped-on cheek circles.
    const field = 0.91 * gaussian(u, v, 0.439, 0.391, 0.047, 0.027, 0.28)
      + 0.87 * gaussian(u, v, 0.597, 0.390, 0.050, 0.029, -0.32)
      + 0.46 * gaussian(u, v, 0.445, 0.423, 0.058, 0.049, 0.16)
      + 0.43 * gaussian(u, v, 0.590, 0.425, 0.056, 0.047, -0.18)
      + 0.64 * gaussian(u, v, 0.523, 0.391, 0.025, 0.024)
      + 0.27 * gaussian(u, v, 0.520, 0.357, 0.021, 0.039)
      + 0.16 * gaussian(u, v, 0.516, 0.376, 0.104, 0.092)
      + 0.07 * gaussian(u, v, 0.513, 0.257, 0.065, 0.043);

    // Keep the entire moving eye/brow and mouth regions clean, including
    // warm-coloured lids, lips and tongue that a colour key alone would catch.
    const eyes = smooth(0.345, 0.365, v)
      + (1 - smooth(0.252, 0.272, v));
    const bridge = 1 - smooth(0.019, 0.036, Math.abs(u - 0.521));
    const eyeProtection = Math.max(Math.min(1, eyes), bridge);
    const mouthX = 1 - smooth(0.052, 0.078, Math.abs(u - 0.525));
    const mouthY = smooth(0.418, 0.436, v) * (1 - smooth(0.501, 0.521, v));
    distribution[y * BLUSH_SIZE + x] = smooth(0, 1.42, field) * feather * eyeProtection * (1 - mouthX * mouthY);
  }
  return distribution;
}

export function createBlushMask(pixels: Uint8ClampedArray) {
  const shape = facialDistribution();
  const mask = new Uint8Array(BLUSH_SIZE * BLUSH_SIZE);
  for (let i = 0; i < mask.length; i++) {
    if (!shape[i]) continue;
    const r = pixels[i * 4], g = pixels[i * 4 + 1], b = pixels[i * 4 + 2];
    // Measured warm skin colours: exclude dark hair/brows, neutral eye whites
    // and teeth, and red lips. Soft confidence retains the skin's shading.
    const skin = smooth(80, 155, r) * smooth(6, 18, g - b)
      * smooth(20, 52, r - g) * smooth(0.34, 0.58, g / Math.max(r, 1));
    mask[i] = Math.round(255 * shape[i] * skin * pixels[i * 4 + 3] / 255);
  }
  return mask;
}
