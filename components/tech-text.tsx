"use client";

import { useLayoutEffect, useRef } from "react";

type Box = { x: number; y: number; w: number; h: number };
type Art = { outline: HTMLCanvasElement; w: number; h: number };
type Glyph = Box & {
  char: string;
  position: number;
  line: number;
  hitBox: Box;
  art: Art;
  dx: number;
  dy: number;
  vx: number;
  vy: number;
};
type Kick = { index: number; at: number; strength: number };

const PAD = 32;
const MAX_PIXELS = 1_500_000;
const IDLE_STEP = 600;
const IDLE_PAUSE = 350;
const approach = (value: number, target: number, dt: number, lag = 0.075) =>
  target + (value - target) * Math.exp(-dt / lag);
const near = (value: number, target: number) => Math.abs(value - target) < 0.025;

/** Decorative, event-driven enhancement. The server heading remains the layout and accessibility source. */
export function TechText() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    const heading = host?.querySelector("h1");
    if (!canvas || !host || !heading) return;
    const ctx = canvas.getContext("2d");
    const probe = document.createElement("canvas").getContext("2d");
    if (!ctx || !probe) return;

    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let alive = true;
    let visible = false;
    let ready = false;
    let dirty = true;
    let raf = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let idleIndex = 0;
    let last = 0;
    let dpr = 1;
    let width = 0;
    let height = 0;
    let size = 0;
    let accent = "";
    let labelFont = "";
    let glyphs: Glyph[] = [];
    let idleLetters: number[] = [];
    let rect = { left: 0, top: 0 };
    let rectDirty = false;
    let focus = -1;
    let frameIndex = -1;
    let dragging = -1;
    let captured: number | null = null;
    let frameAlpha = 0;
    let frame: Box = { x: 0, y: 0, w: 0, h: 0 };
    const pointer = { x: 0, y: 0, inside: false };
    const grab = { x: 0, y: 0 };
    const press = { x: 0, y: 0, at: 0, index: -1 };
    const kicks: Kick[] = [];

    const allowed = () => alive && visible && !document.hidden;
    const stopTimer = () => {
      clearTimeout(timer);
      timer = undefined;
    };
    const showStatic = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      host.removeAttribute("data-tech-active");
      host.removeAttribute("data-tech-target");
      host.style.cursor = "";
    };
    const release = () => {
      if (captured !== null && host.hasPointerCapture(captured)) host.releasePointerCapture(captured);
      captured = null;
      dragging = -1;
      press.index = -1;
    };
    const suspend = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      stopTimer();
      release();
      pointer.inside = false;
      focus = -1;
      kicks.length = 0;
      frameAlpha = 0;
      for (const glyph of glyphs) glyph.dx = glyph.dy = glyph.vx = glyph.vy = 0;
      showStatic();
    };

    // Only called after resize, font loading, or a theme change; never in the animation loop.
    const layout = () => {
      showStatic();
      release();
      const bounds = host.getBoundingClientRect();
      rect = bounds;
      rectDirty = false;
      width = bounds.width + PAD * 2;
      height = bounds.height + PAD * 2;
      dpr = Math.min(devicePixelRatio || 1, 2, Math.sqrt(MAX_PIXELS / (width * height)));
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      const rootStyle = getComputedStyle(document.documentElement);
      accent = rootStyle.getPropertyValue("--muted").trim();
      labelFont = `10px ${getComputedStyle(document.body).getPropertyValue("--font-geist-mono").trim() || "monospace"}`;
      const lines = Array.from(heading.querySelectorAll<HTMLElement>("[data-tech-line]"));
      const next: Glyph[] = [];
      const cache = new Map<string, Art>();
      const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
      let position = 0;
      for (let text = walker.nextNode(); text; text = walker.nextNode()) {
        const element = text.parentElement!;
        const lineIndex = lines.indexOf(element.closest<HTMLElement>("[data-tech-line]")!);
        const style = getComputedStyle(element);
        const font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
        size = parseFloat(style.fontSize);
        probe.font = font;
        probe.textBaseline = "alphabetic";
        const metrics = probe.measureText("Hg");
        const ascent = metrics.fontBoundingBoxAscent ?? size * 0.9;
        const descent = metrics.fontBoundingBoxDescent ?? size * 0.22;
        const range = document.createRange();
        let offset = 0;
        for (const char of Array.from(text.textContent || "")) {
          const charPosition = position++;
          range.setStart(text, offset);
          offset += char.length;
          range.setEnd(text, offset);
          const charRect = range.getBoundingClientRect();
          if (!char.trim()) continue;
          // A span can wrap. Its union rectangle is not the current letter's line box.
          const baseline = charRect.top - bounds.top + (charRect.height - ascent - descent) / 2 + ascent;
          const m = probe.measureText(char);
          const key = `${font}|${style.color}|${char}`;
          let art = cache.get(key);
          if (!art) {
            const padding = 4;
            const left = -m.actualBoundingBoxLeft - padding;
            const top = -m.actualBoundingBoxAscent - padding;
            const w = Math.ceil(m.actualBoundingBoxLeft + m.actualBoundingBoxRight + padding * 2);
            const h = Math.ceil(m.actualBoundingBoxAscent + m.actualBoundingBoxDescent + padding * 2);
            const image = document.createElement("canvas");
            image.width = Math.max(1, Math.ceil(w * dpr));
            image.height = Math.max(1, Math.ceil(h * dpr));
            const c = image.getContext("2d");
            if (c) {
              c.setTransform(dpr, 0, 0, dpr, -left * dpr, -top * dpr);
              c.font = font;
              c.fillStyle = c.strokeStyle = style.color;
              c.lineWidth = 1.6;
              c.setLineDash([3, 2.2]);
              c.strokeText(char, 0, 0);
              // Cut only the sprite's interior, never the heading or the shared overlay.
              c.globalCompositeOperation = "destination-out";
              c.fillText(char, 0, 0);
            }
            art = { outline: image, w, h };
            cache.set(key, art);
          }
          // DOM ranges preserve the real line's kerning and tracking, including word spaces.
          const origin = charRect.left - bounds.left;
          next.push({ char, position: charPosition, line: lineIndex, art,
            hitBox: { x: origin, y: charRect.top - bounds.top, w: charRect.width, h: charRect.height },
            x: origin - m.actualBoundingBoxLeft, y: baseline - m.actualBoundingBoxAscent,
            w: m.actualBoundingBoxLeft + m.actualBoundingBoxRight,
            h: m.actualBoundingBoxAscent + m.actualBoundingBoxDescent,
            dx: 0, dy: 0, vx: 0, vy: 0 });
        }
        range.detach();
      }
      glyphs = next;
      const start = heading.textContent?.search(/\bclear\b/) ?? -1;
      idleLetters = start < 0 ? [] : Array.from({ length: 5 }, (_, offset) =>
        next.findIndex((glyph) => glyph.position === start + offset));
      if (idleLetters.some((index) => index < 0)) idleLetters = [];
      frameAlpha = 0;
      focus = -1;
      dirty = false;
      ready = next.length > 0;
      host.toggleAttribute("data-tech-ready", ready);
    };

    const hit = (x: number, y: number) => {
      let best = -1;
      let distance = Infinity;
      glyphs.forEach((glyph, index) => {
        // Both axes matter: a pointer on one line must never select a letter on another.
        const { x: gx, y: gy, w, h } = glyph.hitBox;
        const dx = Math.max(gx - x, 0, x - gx - w);
        const dy = Math.max(gy - y, 0, y - gy - h);
        const d = Math.hypot(dx, dy);
        if (dx === 0 && dy === 0 && d < distance) { best = index; distance = d; }
      });
      return best;
    };

    const drawArt = (g: Glyph) => {
      const art = g.art;
      ctx.globalAlpha = 1;
      // Sprite coordinates are relative to the ink bounds; padding is baked in.
      ctx.drawImage(art.outline, g.x - 4 + g.dx, g.y - 4 + g.dy, art.w, art.h);
    };

    const drawFrame = () => {
      if (frameAlpha < 0.002 || frameIndex < 0) return;
      const glyph = glyphs[frameIndex];
      ctx.strokeStyle = ctx.fillStyle = accent;
      ctx.lineWidth = 1;
      ctx.globalAlpha = frameAlpha * 0.65;
      ctx.strokeRect(frame.x, frame.y, frame.w, frame.h);
      ctx.globalAlpha = frameAlpha;
      for (const [x, y] of [[frame.x, frame.y], [frame.x + frame.w, frame.y], [frame.x, frame.y + frame.h], [frame.x + frame.w, frame.y + frame.h]]) {
        ctx.fillRect(Math.round(x) - 2, Math.round(y) - 2, 4, 4);
      }
      const moved = Math.hypot(glyph.dx, glyph.dy) > 1;
      if (moved) {
        ctx.globalAlpha = frameAlpha * 0.3;
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        ctx.moveTo(glyph.x + glyph.w / 2, glyph.y + glyph.h / 2);
        ctx.lineTo(glyph.x + glyph.w / 2 + glyph.dx, glyph.y + glyph.h / 2 + glyph.dy);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.font = labelFont;
      ctx.textBaseline = "bottom";
      ctx.globalAlpha = frameAlpha * 0.9;
      const label = moved
        ? `Δ ${Math.round(glyph.dx)}, ${Math.round(-glyph.dy)}`
        : `${glyph.char} / #${glyph.position + 1} / L${glyph.line + 1}`;
      const labelWidth = label.length * 6; // Fixed-width 10px mono labels; no frame-time font measurement.
      ctx.fillText(label, Math.max(0, Math.min(width - PAD * 2 - labelWidth, frame.x)), frame.y - 7);
    };

    const tick = (now: number) => {
      raf = 0;
      if (!allowed()) return;
      if (dirty) layout();
      if (!ready) return;
      const elapsed = Math.max(0.001, (now - last) / 1000);
      const dt = Math.min(0.032, elapsed);
      last = now;
      for (let i = kicks.length - 1; i >= 0; i--) {
        if (now < kicks[i].at) continue;
        glyphs[kicks[i].index].vy -= kicks[i].strength;
        kicks.splice(i, 1);
      }
      focus = motion.matches ? idleLetters[0] ?? -1
        : dragging >= 0 ? dragging : pointer.inside ? hit(pointer.x, pointer.y) : idleLetters[idleIndex] ?? -1;
      let moving = kicks.length > 0;
      glyphs.forEach((g, i) => {
        if (i === dragging) {
          const tx = Math.max(-24, Math.min(24, pointer.x - grab.x));
          const ty = Math.max(-22, Math.min(22, pointer.y - grab.y));
          g.dx = approach(g.dx, tx, dt, 0.025);
          g.dy = approach(g.dy, ty, dt, 0.025);
          moving ||= !near(g.dx, tx) || !near(g.dy, ty);
        } else if (Math.hypot(g.dx, g.dy, g.vx, g.vy) > 0.08) {
          // Substeps keep spring integration stable on slower mobile frames.
          for (let step = 0; step < 2; step++) {
            g.vx += (-300 * g.dx - 25 * g.vx) * dt / 2;
            g.vy += (-300 * g.dy - 25 * g.vy) * dt / 2;
            g.dx += g.vx * dt / 2;
            g.dy += g.vy * dt / 2;
          }
          moving = true;
        } else { g.dx = g.dy = g.vx = g.vy = 0; }
      });
      // Selection is atomic: no fading old outline or frame gliding over other letters.
      frameAlpha = focus >= 0 ? 1 : 0;
      frameIndex = focus;
      if (focus >= 0) {
        const g = glyphs[focus];
        frame = { x: g.x + g.dx - 5, y: g.y + g.dy - 5, w: g.w + 10, h: g.h + 10 };
      }
      const active = focus >= 0 || moving || frameAlpha > 0;
      if (!active) {
        showStatic();
        return;
      }
      ctx.setTransform(dpr, 0, 0, dpr, PAD * dpr, PAD * dpr);
      ctx.clearRect(-PAD, -PAD, width, height);
      if (focus >= 0) drawArt(glyphs[focus]);
      drawFrame();
      ctx.globalAlpha = 1;
      host.setAttribute("data-tech-active", "");
      if (focus >= 0) host.dataset.techTarget = String(glyphs[focus].position);
      else host.removeAttribute("data-tech-target");
      host.style.cursor = motion.matches ? "" : dragging >= 0 ? "grabbing" : pointer.inside && focus >= 0 ? "grab" : "";
      if (moving && !motion.matches) raf = requestAnimationFrame(tick);
      schedule();
    };

    const schedule = () => {
      if (timer !== undefined || !allowed() || motion.matches || pointer.inside || dragging >= 0 || !idleLetters.length) return;
      timer = setTimeout(() => {
        timer = undefined;
        idleIndex = (idleIndex + 1) % idleLetters.length;
        wake();
      }, IDLE_STEP + (idleIndex === idleLetters.length - 1 ? IDLE_PAUSE : 0));
    };
    const wake = () => {
      if (!allowed()) return;
      cancelAnimationFrame(raf);
      raf = 0;
      last = performance.now();
      tick(last);
    };
    const invalidate = () => {
      const hovering = pointer.inside;
      dirty = true;
      suspend();
      pointer.inside = hovering;
      wake();
    };
    const locate = (e: PointerEvent) => {
      if (rectDirty) { rect = host.getBoundingClientRect(); rectDirty = false; }
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
    };
    const onEnter = (e: PointerEvent) => {
      rect = host.getBoundingClientRect();
      onMove(e);
    };
    const onMove = (e: PointerEvent) => {
      if (!allowed() || motion.matches || (captured !== null && captured !== e.pointerId)) return;
      stopTimer();
      if (!ready) return;
      locate(e);
      pointer.inside = true;
      wake();
    };
    const resumeIdle = () => {
      if (pointer.inside && idleLetters.length) idleIndex = (idleIndex + 1) % idleLetters.length;
      pointer.inside = false;
      wake();
    };
    const onLeave = () => { if (dragging < 0) resumeIdle(); };
    const onDown = (e: PointerEvent) => {
      if (!allowed() || motion.matches || !e.isPrimary || e.button !== 0 || captured !== null) return;
      stopTimer();
      if (!ready) return;
      rect = host.getBoundingClientRect();
      locate(e);
      const index = hit(pointer.x, pointer.y);
      pointer.inside = true;
      if (index < 0) { wake(); return; }
      press.x = pointer.x; press.y = pointer.y; press.at = performance.now(); press.index = index;
      // Touch remains a native scrolling gesture. A stationary tap still triggers the bounce.
      if (e.pointerType !== "touch") {
        dragging = index;
        grab.x = pointer.x - glyphs[index].dx;
        grab.y = pointer.y - glyphs[index].dy;
        glyphs[index].vx = glyphs[index].vy = 0;
        captured = e.pointerId;
        host.setPointerCapture(e.pointerId);
      }
      wake();
    };
    const onUp = (e: PointerEvent) => {
      if (motion.matches || (!pointer.inside && press.index < 0 && captured === null)) return;
      if (captured !== null && captured !== e.pointerId) return;
      const index = press.index;
      const click = e.type === "pointerup" && index >= 0 && performance.now() - press.at < 450 &&
        Math.hypot(e.clientX - rect.left - press.x, e.clientY - rect.top - press.y) < 6;
      release();
      const inside = e.type !== "pointercancel" && e.pointerType !== "touch" && e.clientX >= rect.left && e.clientX <= rect.left + width - PAD * 2 &&
        e.clientY >= rect.top && e.clientY <= rect.top + height - PAD * 2;
      if (click) {
        const now = performance.now();
        for (let distance = 0; distance <= 3; distance++) {
          for (const neighbor of distance ? [index - distance, index + distance] : [index]) {
            if (glyphs[neighbor]?.line === glyphs[index].line) {
              kicks.push({ index: neighbor, at: now + distance * 45, strength: size * 2.1 * 0.55 ** distance });
            }
          }
        }
      }
      if (inside) { pointer.inside = true; wake(); }
      else resumeIdle();
    };
    const onLostCapture = () => { if (captured !== null) { captured = null; dragging = -1; press.index = -1; wake(); } };
    const onVisibility = () => { if (document.hidden) suspend(); else wake(); };
    const onMotion = () => {
      idleIndex = 0;
      suspend();
      wake();
    };
    const onScroll = () => { rectDirty = true; suspend(); wake(); };
    host.addEventListener("pointerenter", onEnter, { passive: true });
    host.addEventListener("pointermove", onMove, { passive: true });
    host.addEventListener("pointerleave", onLeave, { passive: true });
    host.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("pointerup", onUp, { passive: true });
    document.addEventListener("pointercancel", onUp, { passive: true });
    host.addEventListener("lostpointercapture", onLostCapture);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    motion.addEventListener("change", onMotion);
    const resize = new ResizeObserver(invalidate);
    resize.observe(host);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) wake(); else suspend();
    });
    intersection.observe(host);
    const theme = new MutationObserver(invalidate);
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style", "data-theme"] });
    // Load the existing mono face before drawing labels: otherwise its first use can
    // trigger a late font event in the middle of a drag. Static text stays visible.
    const monoFamily = getComputedStyle(document.body).getPropertyValue("--font-geist-mono").trim() || "monospace";
    const onFonts = () => { if (alive) invalidate(); };
    Promise.all([
      document.fonts.ready,
      document.fonts.load(`10px ${monoFamily}`, "Δ 0123456789 / L × I turn complex systems into clear products."),
    ]).then(onFonts, onFonts);

    // Paint c synchronously on mount, before waiting for fonts or the first observer callback.
    const bounds = host.getBoundingClientRect();
    visible = bounds.bottom > 0 && bounds.top < innerHeight && bounds.right > 0 && bounds.left < innerWidth;
    wake();

    return () => {
      alive = false;
      suspend();
      host.removeAttribute("data-tech-ready");
      resize.disconnect(); intersection.disconnect(); theme.disconnect();
      motion.removeEventListener("change", onMotion);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("scroll", onScroll, true);
      host.removeEventListener("pointerenter", onEnter);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      host.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointercancel", onUp);
      host.removeEventListener("lostpointercapture", onLostCapture);
    };
  }, []);

  return <canvas ref={canvasRef} className="tech-text-canvas pointer-events-none absolute" aria-hidden="true" />;
}
