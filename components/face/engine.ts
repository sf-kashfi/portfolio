import { expressions, insidePortraitMask, registration, rig, type Expression } from "./portrait-rig";
import { fragmentShader, vertexShader } from "./shaders";
import { BLUSH_SIZE, createBlushMask } from "./blush-mask";

const GRID = 128;
const ALPHA_SIZE = 128;
type Point = { u: number; v: number };
type Slot = { pointer: number | null; u: number; v: number; x: number; y: number; tx: number; ty: number; vx: number; vy: number; live: boolean };

export class PortraitEngine {
  private gl: WebGL2RenderingContext;
  private program!: WebGLProgram;
  private vao: WebGLVertexArrayObject | null = null;
  private buffers: WebGLBuffer[] = [];
  private textures = new Map<Expression, WebGLTexture>();
  private blushTexture: WebGLTexture | null = null;
  private blushLayers = new Map<Expression, number>();
  private uniforms: Record<string, WebGLUniformLocation | null> = {};
  private alpha: Uint8ClampedArray = new Uint8ClampedArray();
  private outline: Point[][] = [];
  private slots: Slot[] = Array.from({ length: 4 }, () => ({ pointer: null, u: 0, v: 0, x: 0, y: 0, tx: 0, ty: 0, vx: 0, vy: 0, live: false }));
  private grabs = new Float32Array(16);
  private stage = { x: 1, y: 1, size: 1 };
  private view = { w: 1, h: 1 };
  private a: Expression = "base";
  private b: Expression = "base";
  private mix = 1;
  private raf = 0;
  private last = 0;
  private paused = false;
  private disposed = false;
  private jolt = { x: 0, y: 0, vx: 0, vy: 0 };
  private indexCount = GRID * GRID * 6;
  private outlineDirty = true;
  flush = 0;

  constructor(
    private canvas: HTMLCanvasElement,
    base: HTMLImageElement,
    private reducedMotion: boolean,
    private onShape: (path: string) => void,
  ) {
    const gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: true, antialias: true, powerPreference: "low-power" });
    if (!gl) throw new Error("WebGL2 unavailable");
    this.gl = gl;
    try {
      this.program = this.compile();
      for (const name of ["uView", "uStage", "uPortrait", "uGrab[0]", "uJolt", "uA", "uB", "uMix", "uBackdrop", "uBackdropShape", "uCheeks", "uFace", "uNose", "uFlush", "uBlush", "uBlushLayers"]) {
        this.uniforms[name] = gl.getUniformLocation(this.program, name);
      }
      this.createMesh();
      this.blushTexture = gl.createTexture();
      if (!this.blushTexture) throw new Error("Cannot allocate blush masks");
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D_ARRAY, this.blushTexture);
      gl.texStorage3D(gl.TEXTURE_2D_ARRAY, 1, gl.R8, BLUSH_SIZE, BLUSH_SIZE, Object.keys(expressions).length);
      gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.activeTexture(gl.TEXTURE0);
      this.addExpression("base", base);
      this.createAlpha(base);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    } catch (error) {
      this.destroy();
      throw error;
    }
  }

  private compile() {
    const gl = this.gl;
    const program = gl.createProgram();
    if (!program) throw new Error("Cannot allocate program");
    const shaders: WebGLShader[] = [];
    try {
      for (const [kind, source] of [[gl.VERTEX_SHADER, vertexShader], [gl.FRAGMENT_SHADER, fragmentShader]] as const) {
        const shader = gl.createShader(kind);
        if (!shader) throw new Error("Cannot allocate shader");
        shaders.push(shader);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) ?? "Shader compile failed");
        gl.attachShader(program, shader);
      }
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? "Program link failed");
      return program;
    } catch (error) {
      gl.deleteProgram(program);
      throw error;
    } finally {
      for (const shader of shaders) gl.deleteShader(shader);
    }
  }

  private createMesh() {
    const gl = this.gl;
    const n = GRID + 1;
    const vertices = new Float32Array(n * n * 2);
    const indices = new Uint16Array(this.indexCount);
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) vertices.set([x / GRID, y / GRID], (y * n + x) * 2);
    let k = 0;
    for (let y = 0; y < GRID; y++) for (let x = 0; x < GRID; x++) {
      const a = y * n + x;
      indices.set([a, a + 1, a + n, a + 1, a + n + 1, a + n], k);
      k += 6;
    }
    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);
    for (const [target, data] of [[gl.ARRAY_BUFFER, vertices], [gl.ELEMENT_ARRAY_BUFFER, indices]] as const) {
      const buffer = gl.createBuffer();
      if (!buffer) throw new Error("Cannot allocate mesh");
      this.buffers.push(buffer);
      gl.bindBuffer(target, buffer);
      gl.bufferData(target, data, gl.STATIC_DRAW);
    }
    const location = gl.getAttribLocation(this.program, "aUv");
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
  }

  addExpression(key: Expression, image: HTMLImageElement) {
    if (this.disposed || this.textures.has(key)) return;
    // Bounded 1024px uploads also keep the 14-expression texture budget at ~56MB.
    const c = document.createElement("canvas");
    c.width = c.height = 1024;
    const ctx = c.getContext("2d");
    if (!ctx) throw new Error("Cannot prepare portrait");
    const r = registration[key] ?? { scale: 1, x: 0, y: 0 };
    ctx.drawImage(image, (0.5 - r.scale / 2 + r.x) * 1024, (0.5 - r.scale / 2 + r.y) * 1024, r.scale * 1024, r.scale * 1024);
    const gl = this.gl;
    const texture = gl.createTexture();
    if (!texture) throw new Error("Cannot allocate texture");
    this.textures.set(key, texture);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    // Read the same registered image used by the portrait, so expression
    // framing and changing features cannot make a static mask drift.
    const maskCanvas = document.createElement("canvas");
    maskCanvas.width = maskCanvas.height = BLUSH_SIZE;
    const maskContext = maskCanvas.getContext("2d", { willReadFrequently: true });
    if (!maskContext) throw new Error("Cannot prepare blush mask");
    maskContext.drawImage(c, 0, 0, BLUSH_SIZE, BLUSH_SIZE);
    const mask = createBlushMask(maskContext.getImageData(0, 0, BLUSH_SIZE, BLUSH_SIZE).data);
    const layer = this.blushLayers.size;
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, this.blushTexture);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, layer, BLUSH_SIZE, BLUSH_SIZE, 1, gl.RED, gl.UNSIGNED_BYTE, mask);
    this.blushLayers.set(key, layer);
    gl.activeTexture(gl.TEXTURE0);
    maskCanvas.width = maskCanvas.height = 1;
    c.width = c.height = 1;
  }

  private opaque(u: number, v: number) {
    if (u < 0 || v < 0 || u >= 1 || v >= 1) return false;
    return this.alpha[(Math.floor(v * ALPHA_SIZE) * ALPHA_SIZE + Math.floor(u * ALPHA_SIZE)) * 4 + 3] > 160;
  }

  private createAlpha(image: HTMLImageElement) {
    const c = document.createElement("canvas");
    c.width = c.height = ALPHA_SIZE;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("Cannot prepare hit mask");
    ctx.drawImage(image, 0, 0, ALPHA_SIZE, ALPHA_SIZE);
    this.alpha = ctx.getImageData(0, 0, ALPHA_SIZE, ALPHA_SIZE).data;
    const n = 64;
    const solid = (x: number, y: number) => x >= 0 && y >= 0 && x < n && y < n && this.opaque((x + 0.5) / n, (y + 0.5) / n);
    const edges = new Map<string, [number, number][]>();
    const add = (x: number, y: number, tx: number, ty: number) => {
      const key = `${x},${y}`;
      const list = edges.get(key) ?? [];
      list.push([tx, ty]);
      edges.set(key, list);
    };
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      if (!solid(x, y)) continue;
      if (!solid(x, y - 1)) add(x, y, x + 1, y);
      if (!solid(x + 1, y)) add(x + 1, y, x + 1, y + 1);
      if (!solid(x, y + 1)) add(x + 1, y + 1, x, y + 1);
      if (!solid(x - 1, y)) add(x, y + 1, x, y);
    }
    while (edges.size) {
      const first = edges.keys().next().value!;
      let key = first;
      const loop: Point[] = [];
      do {
        const [x, y] = key.split(",").map(Number);
        loop.push({ u: x / n, v: y / n });
        const list = edges.get(key);
        if (!list?.length) break;
        const next = list.pop()!;
        if (!list.length) edges.delete(key);
        key = next.join(",");
      } while (key !== first);
      if (loop.length > 3) this.outline.push(loop);
    }
    c.width = c.height = 1;
  }

  resize(w: number, h: number, stage: { x: number; y: number; size: number }) {
    this.view = { w, h };
    this.stage = stage;
    const dpr = Math.min(window.devicePixelRatio || 1, 2, 1600 / Math.max(w, h));
    const width = Math.max(1, Math.round(w * dpr));
    const height = Math.max(1, Math.round(h * dpr));
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
    this.outlineDirty = true;
    this.wake();
  }

  setReducedMotion(value: boolean) {
    this.reducedMotion = value;
    if (value) {
      this.jolt = { x: 0, y: 0, vx: 0, vy: 0 };
      for (const s of this.slots) if (s.pointer === null) s.live = false;
    }
    this.outlineDirty = true;
    this.wake();
  }

  setFace(key: Expression): Expression {
    const resolved = this.textures.has(key) ? key : "base";
    if (resolved === this.b) return resolved;
    if (this.mix >= 0.5) this.a = this.b;
    this.b = resolved;
    this.mix = this.reducedMotion ? 1 : 0;
    this.wake();
    return resolved;
  }

  private deform(u: number, v: number): [number, number] {
    const portrait = rig.portrait;
    let x = portrait.x + (u + this.jolt.x) * portrait.scale;
    let y = portrait.y + (v + this.jolt.y) * portrait.scale;
    for (const s of this.slots) {
      if (!s.live) continue;
      const sigma = 0.064 * (1 + 0.4 * Math.hypot(s.x, s.y));
      const weight = Math.exp(-((u - s.u) ** 2 + (v - s.v) ** 2) / (2 * sigma * sigma));
      x += s.x * weight;
      y += s.y * weight;
    }
    return [x, y];
  }

  pick(px: number, py: number): Point | null {
    const x = (px - this.stage.x) / this.stage.size;
    const y = (py - this.stage.y) / this.stage.size;
    if (!insidePortraitMask(x, y)) return null;
    if (!this.slots.some((s) => s.live)) {
      const portrait = rig.portrait;
      const u = (x - portrait.x) / portrait.scale - this.jolt.x;
      const v = (y - portrait.y) / portrait.scale - this.jolt.y;
      return this.opaque(u, v) ? { u, v } : null;
    }
    const n = GRID + 1;
    const points = new Float32Array(n * n * 2);
    for (let iy = 0; iy < n; iy++) for (let ix = 0; ix < n; ix++) points.set(this.deform(ix / GRID, iy / GRID), (iy * n + ix) * 2);
    const triangle = (a: number, b: number, c: number): Point | null => {
      const ax = points[a * 2], ay = points[a * 2 + 1], bx = points[b * 2], by = points[b * 2 + 1], cx = points[c * 2], cy = points[c * 2 + 1];
      if (x < Math.min(ax, bx, cx) || x > Math.max(ax, bx, cx) || y < Math.min(ay, by, cy) || y > Math.max(ay, by, cy)) return null;
      const den = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy);
      if (Math.abs(den) < 1e-10) return null;
      const wa = ((by - cy) * (x - cx) + (cx - bx) * (y - cy)) / den;
      const wb = ((cy - ay) * (x - cx) + (ax - cx) * (y - cy)) / den;
      const wc = 1 - wa - wb;
      if (Math.min(wa, wb, wc) < -0.0001) return null;
      const u = (wa * (a % n) + wb * (b % n) + wc * (c % n)) / GRID;
      const v = (wa * Math.floor(a / n) + wb * Math.floor(b / n) + wc * Math.floor(c / n)) / GRID;
      return this.opaque(u, v) ? { u, v } : null;
    };
    for (let iy = GRID - 1; iy >= 0; iy--) for (let ix = GRID - 1; ix >= 0; ix--) {
      const a = iy * n + ix;
      const hit = triangle(a + 1, a + n + 1, a + n) ?? triangle(a, a + 1, a + n);
      if (hit) return hit;
    }
    return null;
  }

  grab(pointer: number, at: Point) {
    const slot = this.slots.find((s) => !s.live) ?? this.slots.filter((s) => s.pointer === null).sort((a, b) => Math.hypot(a.x, a.y) - Math.hypot(b.x, b.y))[0];
    if (!slot) return false;
    Object.assign(slot, { pointer, u: at.u, v: at.v, x: 0, y: 0, tx: 0, ty: 0, vx: 0, vy: 0, live: true });
    this.wake();
    return true;
  }

  drag(pointer: number, dx: number, dy: number) {
    const s = this.slots.find((slot) => slot.pointer === pointer);
    if (!s) return;
    const { x: left, y: top, size } = this.stage;
    const portrait = rig.portrait;
    const ax = left + (portrait.x + s.u * portrait.scale) * size;
    const ay = top + (portrait.y + s.v * portrait.scale) * size;
    const x = (Math.min(this.view.w - 8, Math.max(8, ax + dx)) - ax) / size;
    const y = (Math.min(this.view.h - 8, Math.max(8, ay + dy)) - ay) / size;
    const length = Math.hypot(x, y);
    const max = this.reducedMotion ? 0.18 : 0.92;
    const k = length ? max * Math.tanh(length / max) / length : 0;
    s.tx = x * k;
    s.ty = y * k;
    this.wake();
  }

  release(pointer: number) {
    const s = this.slots.find((slot) => slot.pointer === pointer);
    if (!s) return;
    s.pointer = null;
    if (this.reducedMotion) s.live = false;
    const speed = Math.hypot(s.vx, s.vy);
    if (speed > 4) { s.vx *= 4 / speed; s.vy *= 4 / speed; }
    this.outlineDirty = true;
    this.wake();
  }

  cancelAll() {
    for (const s of this.slots) if (s.pointer !== null) this.release(s.pointer);
  }

  poke() {
    if (this.reducedMotion) return;
    this.jolt.vx = 0.16;
    this.jolt.vy = -0.48;
    this.wake();
  }

  get held() { return this.slots.some((s) => s.pointer !== null); }
  get stretch() { return Math.max(0, ...this.slots.filter((s) => s.pointer !== null).map((s) => Math.hypot(s.x, s.y))); }

  pause(value: boolean) {
    this.paused = value;
    if (value) { cancelAnimationFrame(this.raf); this.raf = 0; this.last = 0; }
    else this.wake();
  }

  private wake() {
    if (this.disposed || this.paused || this.raf) return;
    this.raf = requestAnimationFrame(this.tick);
  }

  private tick = (now: number) => {
    this.raf = 0;
    if (this.disposed || this.paused) return;
    const dt = this.last ? Math.min((now - this.last) / 1000, 1 / 30) : 1 / 60;
    this.last = now;
    let moving = false;
    for (const s of this.slots) {
      if (!s.live) continue;
      moving = true;
      this.outlineDirty = true;
      if (s.pointer !== null) {
        const k = 1 - Math.exp(-55 * dt);
        const dx = (s.tx - s.x) * k, dy = (s.ty - s.y) * k;
        s.x += dx; s.y += dy;
        s.vx = dx / dt; s.vy = dy / dt;
      } else {
        for (let i = 0; i < 3; i++) {
          const h = dt / 3;
          s.vx += (-260 * s.x - 13 * s.vx) * h;
          s.vy += (-260 * s.y - 13 * s.vy) * h;
          s.x += s.vx * h; s.y += s.vy * h;
        }
        if (Math.hypot(s.x, s.y) < 0.0005 && Math.hypot(s.vx, s.vy) < 0.008) { s.live = false; s.x = s.y = 0; }
      }
    }
    if (Math.hypot(this.jolt.x, this.jolt.y, this.jolt.vx, this.jolt.vy) > 0.0005) {
      moving = true;
      this.outlineDirty = true;
      for (let i = 0; i < 3; i++) {
        const h = dt / 3;
        this.jolt.vx += (-260 * this.jolt.x - 14 * this.jolt.vx) * h;
        this.jolt.vy += (-260 * this.jolt.y - 14 * this.jolt.vy) * h;
        this.jolt.x += this.jolt.vx * h; this.jolt.y += this.jolt.vy * h;
      }
    } else if (this.jolt.x || this.jolt.y) {
      this.jolt = { x: 0, y: 0, vx: 0, vy: 0 };
      this.outlineDirty = true;
    }
    if (this.held && this.stretch > 0.025) this.flush = Math.min(1, this.flush + dt * 0.21 * Math.min(1, this.stretch / 0.22));
    else this.flush = Math.max(0, this.flush - dt * 0.13);
    this.mix = Math.min(1, this.mix + dt / 0.09);
    if (this.mix === 1) this.a = this.b;
    this.draw();
    if (this.outlineDirty) {
      const { x, y, size } = this.stage;
      this.onShape(this.outline.map((loop) => loop.map((p, i) => {
        const [u, v] = this.deform(p.u, p.v);
        return `${i ? "L" : "M"}${(x + u * size).toFixed(1)},${(y + v * size).toFixed(1)}`;
      }).join("") + "Z").join(""));
      this.outlineDirty = false;
    }
    if (moving || this.flush > 0 || this.mix < 1) this.wake();
    else this.last = 0;
  };

  private draw() {
    const gl = this.gl, u = this.uniforms;
    const { backdrop, cheeks, face, nose } = rig;
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(this.program);
    gl.uniform2f(u.uView, this.view.w, this.view.h);
    gl.uniform3f(u.uStage, this.stage.x, this.stage.y, this.stage.size);
    gl.uniform3f(u.uPortrait, rig.portrait.x, rig.portrait.y, rig.portrait.scale);
    this.grabs.fill(0);
    this.slots.forEach((s, i) => { if (s.live) this.grabs.set([s.u, s.v, s.x, s.y], i * 4); });
    gl.uniform4fv(u["uGrab[0]"], this.grabs);
    gl.uniform2f(u.uJolt, this.jolt.x, this.jolt.y);
    gl.uniform4f(u.uBackdrop, backdrop.x, backdrop.y, backdrop.rx, backdrop.ry);
    gl.uniform3f(u.uBackdropShape, Math.cos(backdrop.angle), Math.sin(backdrop.angle), backdrop.power);
    gl.uniform4f(u.uCheeks, cheeks[0].x, cheeks[0].y, cheeks[1].x, cheeks[1].y);
    gl.uniform4f(u.uFace, face.x, face.y, face.rx, face.ry);
    gl.uniform3f(u.uNose, nose.x, nose.y, nose.r);
    gl.uniform1f(u.uFlush, this.flush);
    gl.uniform1f(u.uMix, this.mix);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, this.blushTexture);
    gl.uniform1i(u.uBlush, 2);
    gl.uniform2f(u.uBlushLayers, this.blushLayers.get(this.a)!, this.blushLayers.get(this.b)!);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.textures.get(this.a)!);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.textures.get(this.b)!);
    gl.uniform1i(u.uA, 0); gl.uniform1i(u.uB, 1);
    gl.bindVertexArray(this.vao);
    gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);
    gl.bindVertexArray(null);
  }

  destroy() {
    if (this.disposed) return;
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    const gl = this.gl;
    for (const texture of this.textures.values()) gl.deleteTexture(texture);
    gl.deleteTexture(this.blushTexture);
    for (const buffer of this.buffers) gl.deleteBuffer(buffer);
    gl.deleteVertexArray(this.vao);
    if (this.program) gl.deleteProgram(this.program);
    this.textures.clear();
    this.blushLayers.clear();
    this.outline = [];
  }
}
