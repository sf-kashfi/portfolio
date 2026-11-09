export const vertexShader = `#version 300 es
in vec2 aUv;
uniform vec2 uView;
uniform vec3 uStage;
uniform vec3 uPortrait;
uniform vec4 uGrab[4];
uniform vec2 uJolt;
out vec2 vUv;
out vec2 vStage;
out float vStretch;
void main() {
  vec2 position = uPortrait.xy + (aUv + uJolt) * uPortrait.z;
  float stretch = 0.0;
  for (int i = 0; i < 4; i++) {
    vec2 d = aUv - uGrab[i].xy;
    float len = length(uGrab[i].zw);
    float sigma = 0.064 * (1.0 + 0.4 * len);
    float w = exp(-dot(d,d) / (2.0 * sigma * sigma));
    position += uGrab[i].zw * w;
    stretch += w * len;
  }
  vUv = aUv;
  vStage = position;
  vStretch = stretch;
  vec2 clip = (uStage.xy + position * uStage.z) / uView * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
}`;

export const fragmentShader = `#version 300 es
precision highp float;
in vec2 vUv;
in vec2 vStage;
in float vStretch;
uniform sampler2D uA;
uniform sampler2D uB;
uniform highp sampler2DArray uBlush;
uniform vec2 uBlushLayers;
uniform float uMix;
uniform vec4 uBackdrop;
uniform vec3 uBackdropShape;
uniform vec4 uCheeks;
uniform vec4 uFace;
uniform vec3 uNose;
uniform float uFlush;
out vec4 outColor;
float blob(vec2 p, vec2 c, float r) {
  vec2 d = p-c;
  return exp(-dot(d,d)/(2.0*r*r));
}
vec4 flushedSkin(vec4 c, float layer) {
  vec3 rgb = c.a > 0.001 ? c.rgb/c.a : vec3(0.0);
  float mask = texture(uBlush,vec3(vUv,layer)).r;
  // Recheck full-resolution source colour at feature edges: the small mask's
  // bilinear filtering must never warm a hair, white tooth or eye pixel.
  float skin = smoothstep(0.025,0.11,rgb.g-rgb.b)
    *smoothstep(0.30,0.58,rgb.r)*smoothstep(0.075,0.20,rgb.r-rgb.g);
  float amount = mask*skin;
  // Multiplicative colour keeps the original highlight/shadow texture; use
  // red-channel headroom instead of gain to avoid clipping away highlights.
  rgb.r += (1.0-rgb.r)*0.75*amount;
  rgb.gb *= vec2(1.0)-vec2(0.55,0.38)*amount;
  return vec4(rgb*c.a,c.a);
}
void main() {
  // Both textures are premultiplied: interpolate before unpremultiplying.
  vec4 a = texture(uA,vUv), b = texture(uB,vUv);
  vec4 c = mix(a,b,uMix);
  // Clip AFTER deformation in fixed stage space, using the same rotated
  // superellipse as the SVG and CPU picker. The head can break the top edge.
  vec2 d = vStage-uBackdrop.xy;
  vec2 p = vec2(uBackdropShape.x*d.x+uBackdropShape.y*d.y,
    -uBackdropShape.y*d.x+uBackdropShape.x*d.y)/uBackdrop.zw;
  float distanceToEdge = pow(abs(p.x),uBackdropShape.z)+pow(abs(p.y),uBackdropShape.z)-1.0;
  float aa = max(fwidth(distanceToEdge),0.00001);
  float pebble = 1.0-smoothstep(-aa*0.5,aa*0.5,distanceToEdge);
  c *= vStage.y <= uBackdrop.y ? 1.0 : pebble;
  vec3 rgb = c.a > 0.001 ? c.rgb/c.a : vec3(0.0);
  float oval = 1.0-smoothstep(0.78,1.0,length((vUv-uFace.xy)/uFace.zw));
  // Warm skin only; dark hair, clothes, white eyes and the backdrop stay clean.
  float skin = smoothstep(0.035,0.14,rgb.r-rgb.b)*smoothstep(0.16,0.38,rgb.r)*oval;
  float blush = blob(vUv,uCheeks.xy,0.039)+blob(vUv,uCheeks.zw,0.039)+0.7*blob(vUv,uNose.xy,uNose.z);
  // Preserve the original rosy cheeks through 50% patience, exactly. Below
  // that point replace the old face-wide oval, rather than intensifying it.
  float subtleFlush = min(uFlush,0.5);
  float amount = (blush*smoothstep(0.0,0.5,subtleFlush)+0.8*oval*smoothstep(0.4,1.0,subtleFlush)+min(vStretch*0.35,0.2))*skin;
  rgb *= mix(vec3(1.0),vec3(1.08,0.58,0.57),clamp(amount,0.0,0.85));
  if (uFlush > 0.5) {
    // Tint each expression before crossfading. A cheek from one texture must
    // not lend its skin mask to the other's moving eyes, teeth or hair.
    vec4 warm = mix(flushedSkin(a,uBlushLayers.x),flushedSkin(b,uBlushLayers.y),uMix);
    vec3 warmRgb = warm.a > 0.001 ? warm.rgb/warm.a : vec3(0.0);
    rgb = mix(rgb,warmRgb,smoothstep(0.5,1.0,uFlush));
  }
  outColor = vec4(rgb*c.a,c.a);
}`;
