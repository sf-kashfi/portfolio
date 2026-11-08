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
uniform float uMix;
uniform vec4 uDisc;
uniform vec4 uCheeks;
uniform vec4 uFace;
uniform vec3 uNose;
uniform float uFlush;
out vec4 outColor;
float blob(vec2 p, vec2 c, float r) {
  vec2 d = p-c;
  return exp(-dot(d,d)/(2.0*r*r));
}
void main() {
  // Both textures are premultiplied: interpolate before unpremultiplying.
  vec4 c = mix(texture(uA,vUv),texture(uB,vUv),uMix);
  // Clip AFTER mesh deformation in the disc's fixed stage coordinates.
  // UV-space clipping deforms the mask and lets shoulders escape the circle.
  float distanceToEdge = length(vStage-uDisc.xy)-uDisc.z;
  float aa = max(fwidth(distanceToEdge),0.00001);
  float circle = 1.0-smoothstep(-aa*0.5,aa*0.5,distanceToEdge);
  c *= vStage.y <= uDisc.y ? 1.0 : circle;
  vec3 rgb = c.a > 0.001 ? c.rgb/c.a : vec3(0.0);
  float oval = 1.0-smoothstep(0.78,1.0,length((vUv-uFace.xy)/uFace.zw));
  // Warm skin only; dark hair, clothes, white eyes and the disc stay clean.
  float skin = smoothstep(0.035,0.14,rgb.r-rgb.b)*smoothstep(0.16,0.38,rgb.r)*oval;
  float blush = blob(vUv,uCheeks.xy,0.039)+blob(vUv,uCheeks.zw,0.039)+0.7*blob(vUv,uNose.xy,uNose.z);
  float amount = (blush*smoothstep(0.0,0.5,uFlush)+0.8*oval*smoothstep(0.4,1.0,uFlush)+min(vStretch*0.35,0.2))*skin;
  rgb *= mix(vec3(1.0),vec3(1.08,0.58,0.57),clamp(amount,0.0,0.85));
  outColor = vec4(rgb*c.a,c.a);
}`;
