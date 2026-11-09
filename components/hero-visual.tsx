"use client";

import { useEffect, useId, useRef } from "react";
import { backdropPath, expressions, faceSource, grabExpression, portraitMaskPath, releaseExpressions, rig, type Expression } from "./face/portrait-rig";
import type { PortraitEngine } from "./face/engine";

const BLEED = 0.35;
const HOLD_MS = 5000;

export function HeroVisual() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hitRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const hitClipRef = useRef<SVGClipPathElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const moodRef = useRef<HTMLSpanElement>(null);
  const patienceRef = useRef<HTMLSpanElement>(null);
  const clipId = useId().replaceAll(":", "");

  useEffect(() => {
    const root = rootRef.current!;
    const canvas = canvasRef.current!;
    const hit = hitRef.current!;
    const path = pathRef.current!;
    const ring = ringRef.current!;
    let engine: PortraitEngine | null = null;
    let disposed = false;
    let visible = true;
    let initFrame = 0;
    let warmTimer = 0;
    let idleTimer = 0;
    let meterTimer = 0;
    let face: Expression = "base";
    let requested: Expression = "base";
    let mode: "neutral" | "held" | "after" = "neutral";
    let lastRelease: Expression | null = null;
    let cursor: { x: number; y: number } | null = null;
    let lastPointer: { x: number; y: number } | null = null;
    const available = new Set<Expression>(["base"]);
    const loads = new Set<HTMLImageElement>();
    const downs = new Map<number, { at: number; x: number; y: number; moved: number; u: number; v: number }>();
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const load = (key: Expression) => new Promise<HTMLImageElement | null>((resolve) => {
      const image = new window.Image();
      loads.add(image);
      image.decoding = "async";
      image.onload = async () => {
        try { await image.decode(); } catch { /* onload has already provided usable pixels */ }
        loads.delete(image);
        resolve(disposed ? null : image);
      };
      image.onerror = () => { loads.delete(image); resolve(null); };
      image.src = faceSource(key);
    });

    const layout = () => {
      const width = root.clientWidth, height = root.clientHeight;
      if (!width || !height) return;
      hit.setAttribute("viewBox", `0 0 ${width} ${height}`);
      path.setAttribute("transform", `translate(${-width * BLEED} ${-height * BLEED})`);
      hitClipRef.current!.setAttribute("transform", `translate(${width * 0.04} ${height * 0.04}) scale(${width * 0.92 / 1000})`);
      engine?.resize(width * (1 + BLEED * 2), height * (1 + BLEED * 2), {
        x: width * (BLEED + 0.04), y: height * (BLEED + 0.04), size: width * 0.92,
      });
    };

    const local = (clientX: number, clientY: number) => {
      const rect = root.getBoundingClientRect();
      return { x: clientX - rect.left + root.clientWidth * BLEED, y: clientY - rect.top + root.clientHeight * BLEED };
    };

    const show = (next: Expression) => {
      requested = next;
      const resolved = engine?.setFace(next) ?? "base";
      if (face !== resolved) {
        face = resolved;
        root.dataset.expression = resolved;
        moodRef.current!.textContent = expressions[resolved];
      }
    };

    const neutral = (): Expression => {
      if (!cursor || !engine) return "base";
      const p = local(cursor.x, cursor.y);
      const at = engine.pick(p.x, p.y);
      if (at && Math.hypot(at.u - rig.nose.x, at.v - rig.nose.y) < rig.nose.r * 1.35) return "x_cross";
      const rect = root.getBoundingClientRect();
      const dx = (cursor.x - rect.left) / rect.width - 0.5;
      if (dx < -0.16) return "l_left";
      if (dx > 0.16) return "l_right";
      return "base";
    };

    const ringAt = (event: PointerEvent, on: boolean) => {
      if (event.pointerType !== "mouse") return;
      const rect = root.getBoundingClientRect();
      ring.style.transform = `translate3d(${event.clientX - rect.left}px,${event.clientY - rect.top}px,0)`;
      ring.dataset.on = on ? "true" : "false";
      ring.dataset.held = downs.has(event.pointerId) ? "true" : "false";
    };

    const resetIdle = () => {
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        if (disposed || downs.size) return;
        mode = "neutral";
        show("base");
      }, HOLD_MS);
    };

    const cancel = () => {
      for (const id of downs.keys()) if (hit.hasPointerCapture(id)) hit.releasePointerCapture(id);
      downs.clear();
      engine?.cancelAll();
      ring.dataset.on = "false";
      if (mode === "held") { mode = "after"; show("base"); resetIdle(); }
    };

    const down = (event: PointerEvent) => {
      if (!engine || (event.pointerType === "mouse" && event.button !== 0) || downs.size >= 4) return;
      const p = local(event.clientX, event.clientY);
      const at = engine.pick(p.x, p.y);
      if (!at || !engine.grab(event.pointerId, at)) return;
      event.preventDefault();
      window.clearTimeout(idleTimer);
      downs.set(event.pointerId, { at: performance.now(), x: event.clientX, y: event.clientY, moved: 0, ...at });
      hit.setPointerCapture(event.pointerId);
      root.dataset.interacted = "true";
      mode = "held";
      show(grabExpression(at.u, at.v));
      ringAt(event, true);
    };

    const move = (event: PointerEvent) => {
      const d = downs.get(event.pointerId);
      if (d) {
        d.moved = Math.max(d.moved, Math.hypot(event.clientX - d.x, event.clientY - d.y));
        engine?.drag(event.pointerId, event.clientX - d.x, event.clientY - d.y);
      }
      if (event.pointerType === "mouse") {
        const p = local(event.clientX, event.clientY);
        const at = engine?.pick(p.x, p.y);
        ringAt(event, !!d || !!at);
        path.style.cursor = at || d ? "none" : "";
      }
    };

    const up = (event: PointerEvent) => {
      const d = downs.get(event.pointerId);
      if (!d || !engine) return;
      downs.delete(event.pointerId);
      engine.release(event.pointerId);
      if (hit.hasPointerCapture(event.pointerId)) hit.releasePointerCapture(event.pointerId);
      ringAt(event, false);
      if (downs.size) {
        const remaining = [...downs.values()].at(-1)!;
        show(grabExpression(remaining.u, remaining.v));
        return;
      }
      if (event.type === "pointercancel" || event.type === "lostpointercapture") show("base");
      else if (performance.now() - d.at < 260 && d.moved < 8) {
        engine.poke();
        show("x_shock");
      } else if (engine.flush > 0.8) show("x_dizzy");
      else {
        const pool = releaseExpressions.filter((key) => key !== lastRelease && available.has(key));
        const next = pool[Math.floor(Math.random() * pool.length)] ?? "base";
        lastRelease = next;
        show(next);
      }
      mode = "after";
      resetIdle();
    };

    const windowMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || !visible || document.hidden) return;
      cursor = { x: event.clientX, y: event.clientY };
      // Avoid expensive picking when the mouse has not actually moved.
      if (lastPointer?.x === cursor.x && lastPointer?.y === cursor.y) return;
      lastPointer = cursor;
      if (mode === "neutral") show(neutral());
    };
    const leave = () => { if (!downs.size) ring.dataset.on = "false"; };
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") cancel();
      if ((event.key === "Enter" || event.key === " ") && engine) {
        event.preventDefault();
        root.dataset.interacted = "true";
        engine.poke(); show("x_shock"); mode = "after"; resetIdle();
      }
    };
    const motionChange = () => engine?.setReducedMotion(motion.matches);
    const visibility = () => {
      if (document.hidden) cancel();
      engine?.pause(!visible || document.hidden);
    };
    const contextLost = (event: Event) => {
      event.preventDefault();
      cancel();
      engine?.destroy(); engine = null;
      root.dataset.ready = "false";
      root.dataset.failed = "true";
      ring.dataset.on = "false";
    };

    const resize = new ResizeObserver(layout);
    resize.observe(root);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) cancel();
      engine?.pause(!visible || document.hidden);
    }, { rootMargin: "80px" });
    intersection.observe(root);
    hit.addEventListener("pointerdown", down);
    hit.addEventListener("pointermove", move);
    hit.addEventListener("pointerup", up);
    hit.addEventListener("pointercancel", up);
    hit.addEventListener("lostpointercapture", up);
    hit.addEventListener("pointerleave", leave);
    root.addEventListener("keydown", keydown);
    window.addEventListener("pointermove", windowMove, { passive: true });
    window.addEventListener("blur", cancel);
    window.addEventListener("resize", layout, { passive: true });
    document.addEventListener("visibilitychange", visibility);
    motion.addEventListener("change", motionChange);
    canvas.addEventListener("webglcontextlost", contextLost);

    const init = async () => {
      const [base, module] = await Promise.all([load("base"), import("./face/engine")]);
      if (disposed) return;
      if (!base) { root.dataset.failed = "true"; return; }
      try {
        engine = new module.PortraitEngine(canvas, base, motion.matches, (d) => path.setAttribute("d", d));
        layout();
        engine.pause(!visible || document.hidden);
        initFrame = requestAnimationFrame(() => {
          if (!disposed && engine) root.dataset.ready = "true";
        });
      } catch {
        root.dataset.failed = "true";
        return;
      }
      const queue = (Object.keys(expressions) as Expression[]).filter((key) => key !== "base");
      
      const warm = async () => {
        if (disposed || !engine) return;
        if (!visible || document.hidden) { warmTimer = window.setTimeout(warm, 700); return; }
        const key = queue.shift();
        if (!key) return;
        const image = await load(key);
        if (disposed || !engine) return;
        if (image) {
          try {
            engine.addExpression(key, image);
            available.add(key);
            if (requested === key) show(key);
          } catch { /* Missing/unusable expressions resolve to neutral. */ }
        }
        warmTimer = window.setTimeout(warm, 80);
      };
      warmTimer = window.setTimeout(warm, 180);
      meterTimer = window.setInterval(() => {
        if (!visible || document.hidden || !engine) return;
        patienceRef.current!.style.transform = `scaleX(${1 - engine.flush})`;
      }, 200);
    };
    void init().catch(() => { if (!disposed) root.dataset.failed = "true"; });

    return () => {
      disposed = true;
      cancelAnimationFrame(initFrame);
      window.clearTimeout(warmTimer);
      window.clearTimeout(idleTimer);
      window.clearInterval(meterTimer);
      for (const image of loads) { image.onload = null; image.onerror = null; image.src = ""; }
      loads.clear();
      cancel();
      window.clearTimeout(idleTimer);
      resize.disconnect(); intersection.disconnect();
      hit.removeEventListener("pointerdown", down);
      hit.removeEventListener("pointermove", move);
      hit.removeEventListener("pointerup", up);
      hit.removeEventListener("pointercancel", up);
      hit.removeEventListener("lostpointercapture", up);
      hit.removeEventListener("pointerleave", leave);
      root.removeEventListener("keydown", keydown);
      window.removeEventListener("pointermove", windowMove);
      window.removeEventListener("blur", cancel);
      window.removeEventListener("resize", layout);
      document.removeEventListener("visibilitychange", visibility);
      motion.removeEventListener("change", motionChange);
      canvas.removeEventListener("webglcontextlost", contextLost);
      engine?.destroy();
      root.dataset.ready = "false";
    };
  }, []);

  return (
    <div ref={rootRef} className="face-portrait relative mx-auto aspect-square w-full max-w-[560px] select-none" data-expression="base" tabIndex={0} role="group" aria-label="Interactive portrait of Fatemeh Kashfi. Drag the face to stretch it, or press Enter for a reaction.">
      <div className="face-stage pointer-events-none absolute inset-[4%]">
        <svg className="face-backdrop absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 1000 1000" aria-hidden="true">
          <defs>
            <linearGradient id={`${clipId}-color`} x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="var(--portrait-light)" />
              <stop offset="0.55" stopColor="var(--portrait-mid)" />
              <stop offset="1" stopColor="var(--portrait-deep)" />
            </linearGradient>
            <radialGradient id={`${clipId}-sheen`} cx="0.26" cy="0.16" r="0.8">
              <stop stopColor="var(--portrait-sheen)" />
              <stop offset="1" stopColor="var(--portrait-sheen)" stopOpacity="0" />
            </radialGradient>
          </defs>
          <path d={backdropPath()} fill={`url(#${clipId}-color)`} />
          <path d={backdropPath()} fill={`url(#${clipId}-sheen)`} stroke="var(--portrait-rim)" strokeWidth="1.5" />
        </svg>
        <svg className="face-static absolute inset-0 h-full w-full" viewBox="0 0 1000 1000" role="img" aria-label="Portrait of Fatemeh Kashfi">
          <defs><clipPath id={clipId} clipPathUnits="userSpaceOnUse"><path d={portraitMaskPath()} /></clipPath></defs>
          <g clipPath={`url(#${clipId})`}>
            <image href={faceSource("base")} x={rig.portrait.x * 1000} y={rig.portrait.y * 1000} width={rig.portrait.scale * 1000} height={rig.portrait.scale * 1000} />
          </g>
        </svg>
      </div>
      <canvas ref={canvasRef} className="face-canvas pointer-events-none absolute" aria-hidden="true" />
      <svg ref={hitRef} className="face-hit pointer-events-none absolute inset-0 h-full w-full overflow-hidden" aria-hidden="true">
        <defs><clipPath ref={hitClipRef} id={`${clipId}-hit`} clipPathUnits="userSpaceOnUse"><path d={portraitMaskPath()} /></clipPath></defs>
        <g clipPath={`url(#${clipId}-hit)`}>
          <path ref={pathRef} fill="transparent" fillRule="evenodd" className="face-hit-path" />
        </g>
      </svg>
      <div className="face-hint pointer-events-none absolute right-[1%] top-[14%] -rotate-6" aria-hidden="true">
        <span>Pull my face</span>
        <svg width="56" height="42" viewBox="0 0 56 42" fill="none"><path d="M48 5C30 5 30 28 9 32m8-9-9 10 12 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
      <div className="face-caption pointer-events-none absolute inset-x-[14%] bottom-0 flex items-center justify-between gap-4">
        <span ref={moodRef} className="face-mood" aria-live="polite" aria-atomic="true">neutral</span>
        <span className="face-patience" title="Patience" aria-hidden="true"><span ref={patienceRef} /></span>
      </div>
      <div ref={ringRef} className="face-ring pointer-events-none absolute left-0 top-0" aria-hidden="true" />
    </div>
  );
}
