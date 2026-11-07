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
  disc: { x: 0.5, y: 0.575, r: 0.405 },
  nose: { x: 0.522, y: 0.361, r: 0.034 },
  cheeks: [{ x: 0.438, y: 0.397 }, { x: 0.599, y: 0.397 }],
  face: { x: 0.514, y: 0.36, rx: 0.139, ry: 0.184 },
  hairLine: 0.228,
  sides: { left: 0.36, right: 0.652, jaw: 0.53 },
} as const;

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
