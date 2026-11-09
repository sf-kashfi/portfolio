export const expressions = {
  base: "neutral",
  l_left: "looking left",
  l_right: "looking right",
  x_cross: "cross-eyed",
  x_tongue: "playful",
  x_shock: "startled",
  x_laugh: "laughing",
  x_skeptic: "skeptical",
  x_whistle: "whistling",
  x_smug: "smug",
  x_dizzy: "dizzy",
  g_grimace: "being squeezed",
  g_ouch: "ouch!",
  g_squish: "pinched",
} as const;

export type Expression = keyof typeof expressions;
export const faceSource = (key: Expression) => `/faces/${key}.png`;
export const releaseExpressions: Expression[] = ["x_tongue", "x_laugh", "x_skeptic", "x_whistle", "x_smug", "x_cross"];

/**
 * UVs measured from these assets: silhouette x .11–.89, hair top .07,
 * eye line ~.29, jaw ~.53, shoulders ~.69. The reference's nose at .505
 * would land near this portrait's chin. Keep skin masks inside the hair.
 */
export const rig = {
  portrait: { x: -0.06, y: -0.012, scale: 1.12 },
  backdrop: { x: 0.5, y: 0.565, rx: 0.385, ry: 0.37, angle: -0.105, power: 2.6 },
  nose: { x: 0.522, y: 0.361, r: 0.034 },
  cheeks: [{ x: 0.438, y: 0.397 }, { x: 0.599, y: 0.397 }],
  face: { x: 0.514, y: 0.36, rx: 0.139, ry: 0.184 },
  hairLine: 0.228,
  sides: { left: 0.36, right: 0.652, jaw: 0.53 },
} as const;

export function backdropPath(units = 1000) {
  const { x, y, rx, ry, angle, power } = rig.backdrop;
  const cos = Math.cos(angle), sin = Math.sin(angle);
  return Array.from({ length: 160 }, (_, i) => {
    const t = i / 160 * Math.PI * 2;
    const a = Math.cos(t), b = Math.sin(t);
    const px = rx * Math.sign(a) * Math.abs(a) ** (2 / power);
    const py = ry * Math.sign(b) * Math.abs(b) ** (2 / power);
    return `${i ? "L" : "M"}${((x + cos * px - sin * py) * units).toFixed(3)},${((y + sin * px + cos * py) * units).toFixed(3)}`;
  }).join("") + "Z";
}

export function portraitMaskPath(units = 1000) {
  return `M${-2 * units},${-2 * units}H${3 * units}V${rig.backdrop.y * units}H${-2 * units}Z ` + backdropPath(units);
}

export function insidePortraitMask(x: number, y: number) {
  const { x: cx, y: cy, rx, ry, angle, power } = rig.backdrop;
  if (y <= cy) return true;
  const dx = x - cx, dy = y - cy;
  const px = (Math.cos(angle) * dx + Math.sin(angle) * dy) / rx;
  const py = (-Math.sin(angle) * dx + Math.cos(angle) * dy) / ry;
  return Math.abs(px) ** power + Math.abs(py) ** power <= 1;
}

/**
 * Register expression textures to neutral before upload. Measured with a
 * robust RGB/alpha fit over the outer hair and shoulders, excluding the
 * changing features and dizzy stars. Scale about the image centre, then
 * translate. The gaze/cross assets have noticeably different framing.
 */
export const registration: Partial<Record<Expression, { scale: number; x: number; y: number }>> = {
  g_grimace: { scale: 0.99, x: 0, y: 0.00375 },
  g_ouch: { scale: 0.99, x: 0, y: 0.005 },
  g_squish: { scale: 0.99, x: 0, y: 0.00375 },
  l_left: { scale: 0.97625, x: -0.01, y: -0.01125 },
  l_right: { scale: 1.0225, x: -0.00125, y: -0.01375 },
  x_cross: { scale: 0.97125, x: -0.005, y: -0.01375 },
  x_shock: { scale: 0.99, x: 0, y: 0.005 },
  x_whistle: { scale: 0.99, x: 0, y: 0.00375 },
};

export function grabExpression(u: number, v: number): Expression {
  if (v < rig.hairLine || (v < rig.sides.jaw && (u < rig.sides.left || u > rig.sides.right))) return "g_ouch";
  if (rig.cheeks.some((p) => Math.hypot((u - p.x) / 0.066, (v - p.y) / 0.065) < 1)) return "g_squish";
  return "g_grimace";
}
