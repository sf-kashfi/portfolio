"use client";

import { useEffect, useRef } from "react";

const CHARACTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789{}[]()<>;:.,!?=+-*/%&|^~$#@_";
const TOKENS_BY_LENGTH: Record<number, readonly string[]> = {
  2: ["{}", "=>", "&&", "||", "?.", "??", "[]", "()", "/*", "*/", "++", "--", "::", "0x", "==", "!=", "<=", ">="],
  3: ["</>", "===", "!==", "<T>", "let", "var", "for", "new", "try", "get", "set"],
  4: ["null", "true", "void", "this", "else", "case"],
};
const TOKENS = Object.values(TOKENS_BY_LENGTH).flat();
const FRAME_INTERVAL = 1000 / 24;
const MAX_ACTIVE = 64;

type Cell = { x: number; y: number; token: string; seed: number; span: number; width: number };
type Glitch = { start: number; duration: number; strength: number; scramble: boolean };

function noise(index: number) {
  const value = Math.sin(index * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
}

function singleCharacter(seed: number) {
  return CHARACTERS[Math.floor(noise(seed) * CHARACTERS.length)];
}

function restingToken(seed: number, remaining: number) {
  const token = TOKENS[Math.floor(noise(seed + 17) * TOKENS.length)];
  // Never leave a partial token or an unfilled slot at the end of a row.
  return noise(seed + 29) < 0.55 || token.length > remaining ? singleCharacter(seed + 41) : token;
}

function replacementToken(seed: number, span: number) {
  if (span === 1) return singleCharacter(seed);
  const tokens = TOKENS_BY_LENGTH[span];
  return tokens[Math.floor(noise(seed) * tokens.length)];
}

export function CodeGlitchBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d", { alpha: true });
    // A detached backing surface caches the resting grid; only one canvas is mounted.
    const cache = document.createElement("canvas");
    const resting = cache.getContext("2d", { alpha: true });
    if (!context || !resting) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const active = new Map<number, Glitch>();
    let cells: Cell[] = [];
    let rowStarts: number[] = [];
    let width = 0;
    let height = 0;
    let rows = 0;
    let characterWidth = 0;
    let tokenGap = 0;
    let cellHeight = 16;
    let offsetY = 0;
    let font = "";
    let restColor = "";
    let waveColor = "";
    let accentColor = "";
    let frame = 0;
    let lastFrame = 0;
    let elapsed = 0;
    let nextCluster = 0;
    let pointer = { x: -1000, y: -1000, dirty: false };
    let disposed = false;

    function configure(target: CanvasRenderingContext2D, scale: number) {
      target.setTransform(scale, 0, 0, scale, 0, 0);
      target.font = font;
      target.textAlign = "left";
      target.textBaseline = "middle";
    }

    function drawCell(target: CanvasRenderingContext2D, cell: Cell, token = cell.token) {
      // Native monospace spacing inside a token; the extra gap belongs only after it.
      target.fillText(token, cell.x, cell.y);
    }

    function rebuild() {
      width = canvas!.clientWidth;
      height = canvas!.clientHeight;
      if (!width || !height) return;
      const compact = width < 640;
      const baseFontSize = compact ? 11 : 18;
      const fontSize = baseFontSize * 1.05;
      cellHeight = baseFontSize + 4;
      // Cap both pixel ratio and total backing pixels, including large monitors.
      const scale = Math.min(window.devicePixelRatio || 1, 1.5, Math.sqrt(3_000_000 / (width * height)));
      canvas!.width = cache.width = Math.round(width * scale);
      canvas!.height = cache.height = Math.round(height * scale);
      const styles = getComputedStyle(canvas!);
      font = `${fontSize}px ${styles.fontFamily}`;
      restColor = styles.getPropertyValue("--glitch-rest").trim();
      waveColor = styles.getPropertyValue("--glitch-wave").trim();
      accentColor = styles.getPropertyValue("--glitch-accent").trim();
      configure(context!, scale);
      configure(resting!, scale);
      characterWidth = resting!.measureText("M").width;
      tokenGap = baseFontSize * 0.15 + 15.9;
      rows = Math.floor(height / cellHeight);
      offsetY = (height - rows * cellHeight) / 2;
      cells = [];
      rowStarts = [];
      for (let row = 0; row < rows; row++) {
        rowStarts.push(cells.length);
        let cursor = tokenGap;
        for (let column = 0; cursor + characterWidth + tokenGap <= width;) {
          const key = row * 997 + column;
          const remaining = Math.floor((width - cursor - tokenGap) / characterWidth);
          const token = restingToken(key, remaining);
          const tokenWidth = token.length * characterWidth;
          cells.push({
            x: cursor,
            y: offsetY + (row + 0.5) * cellHeight,
            token,
            seed: noise(key),
            span: token.length,
            width: tokenWidth,
          });
          cursor += tokenWidth + tokenGap;
          column += token.length;
        }
      }
      rowStarts.push(cells.length);
      active.clear();
      resting!.fillStyle = restColor;
      for (const cell of cells) drawCell(resting!, cell);
      paintResting();
    }

    function paintResting() {
      context!.clearRect(0, 0, width, height);
      context!.drawImage(cache, 0, 0, width, height);
    }

    function activate(index: number, strength: number, duration: number, scramble = true) {
      if (!cells[index] || active.has(index) || active.size >= MAX_ACTIVE) return;
      active.set(index, { start: elapsed, duration, strength, scramble });
    }

    function cellAt(x: number, row: number) {
      if (row < 0 || row >= rows) return -1;
      for (let index = rowStarts[row]; index < rowStarts[row + 1]; index++) {
        if (x <= cells[index].x + cells[index].width + tokenGap / 2) return index;
      }
      return rowStarts[row + 1] - 1;
    }

    function cluster(x: number, row: number, radius: number, strength: number) {
      for (let y = Math.max(0, row - 1); y <= Math.min(rows - 1, row + 1); y++) {
        const center = cellAt(x, y);
        for (let index = Math.max(rowStarts[y], center - radius); index <= Math.min(rowStarts[y + 1] - 1, center + radius); index++) {
          activate(index, strength, 280 + noise(index + y * 31) * 320);
        }
      }
    }

    function ambientGlint() {
      // Prefer visible gutters and section gaps instead of pulsing behind opaque cards.
      let anchor = -1;
      for (let attempt = 0; attempt < 96; attempt++) {
        const index = Math.floor(Math.random() * cells.length);
        const cell = cells[index];
        if (cell && [cell.x, cell.x + cell.width / 2, cell.x + cell.width].some(x => isExposed(document.elementFromPoint(x, cell.y)))) {
          anchor = index;
          break;
        }
      }
      if (anchor < 0) return;
      const cell = cells[anchor];
      const row = Math.floor((cell.y - offsetY) / cellHeight);
      for (let y = row; y <= Math.min(rows - 1, row + 1); y++) {
        const center = cellAt(cell.x, y);
        for (let index = center; index <= Math.min(rowStarts[y + 1] - 1, center + 1); index++) {
          activate(index, index === anchor ? 0.96 : 0.76, 1500 + noise(index) * 300, false);
        }
      }
    }

    function paint() {
      paintResting();
      for (const [index, glitch] of active) {
        const cell = cells[index];
        const progress = (elapsed - glitch.start) / glitch.duration;
        if (progress >= 1) {
          active.delete(index);
          continue;
        }
        const fade = Math.pow(Math.sin(Math.PI * progress), 1.5) * glitch.strength;
        context!.clearRect(cell.x - tokenGap / 2, cell.y - cellHeight / 2, cell.width + tokenGap, cellHeight);
        // Replacements occupy exactly the same character cells as the original.
        const token = glitch.scramble && progress < 0.65
          ? replacementToken(Math.floor((elapsed - glitch.start) / 85) + cell.seed * 997, cell.span)
          : cell.token;
        // Keep the resting opacity underneath the highlight, even at either fade endpoint.
        context!.globalAlpha = 1;
        context!.fillStyle = restColor;
        drawCell(context!, cell, token);
        context!.globalAlpha = fade;
        context!.fillStyle = !glitch.scramble || cell.seed > 0.7 ? accentColor : waveColor;
        drawCell(context!, cell, token);
      }
      context!.globalAlpha = 1;
    }

    function tick(now: number) {
      frame = window.requestAnimationFrame(tick);
      if (now - lastFrame < FRAME_INTERVAL) return;
      elapsed += lastFrame ? Math.min(now - lastFrame, 100) : FRAME_INTERVAL;
      lastFrame = now;
      if (elapsed >= nextCluster) {
        ambientGlint();
        nextCluster = elapsed + 1000 + Math.random() * 1400;
      }
      if (pointer.dirty) {
        cluster(pointer.x, Math.floor((pointer.y - offsetY) / cellHeight), 1, 0.7);
        pointer.dirty = false;
      }
      paint();
    }

    function syncAnimation() {
      window.cancelAnimationFrame(frame);
      frame = 0;
      lastFrame = 0;
      pointer.dirty = false;
      active.clear();
      nextCluster = elapsed + 350;
      paintResting();
      if (!motionQuery.matches && !document.hidden) frame = window.requestAnimationFrame(tick);
    }

    // Only bare page/margin targets qualify. Foreground content and portals never react.
    function isExposed(target: EventTarget | null) {
      return target instanceof Element && target.matches("body, html, .portfolio-main");
    }

    function onPointerMove(event: PointerEvent) {
      if (motionQuery.matches || document.hidden || !pointerQuery.matches || event.pointerType !== "mouse" || event.buttons || !isExposed(event.target)) return;
      if (Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) < 12) return;
      pointer = { x: event.clientX, y: event.clientY, dirty: true };
    }

    function onClick(event: MouseEvent) {
      if (motionQuery.matches || document.hidden || !pointerQuery.matches || !isExposed(event.target) || event.defaultPrevented || window.getSelection()?.toString()) return;
      const row = Math.floor((event.clientY - offsetY) / cellHeight);
      if (row < 0 || row >= rows) return;
      const center = cellAt(event.clientX, row);
      for (let index = Math.max(rowStarts[row], center - 5); index <= Math.min(rowStarts[row + 1] - 1, center + 5); index++) {
        activate(index, (1 - Math.abs(index - center) / 7) * 0.9, 420);
      }
    }

    function refresh() {
      rebuild();
      syncAnimation();
    }

    const resizeObserver = new ResizeObserver(refresh);
    const themeObserver = new MutationObserver(refresh);
    resizeObserver.observe(canvas);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style"] });
    motionQuery.addEventListener("change", syncAnimation);
    pointerQuery.addEventListener("change", syncAnimation);
    document.addEventListener("visibilitychange", syncAnimation);
    window.addEventListener("resize", refresh, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("click", onClick, { passive: true });
    refresh();
    // Re-cache once the portfolio's monospace web font is available.
    void document.fonts.ready.then(() => { if (!disposed) refresh(); });

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      motionQuery.removeEventListener("change", syncAnimation);
      pointerQuery.removeEventListener("change", syncAnimation);
      document.removeEventListener("visibilitychange", syncAnimation);
      window.removeEventListener("resize", refresh);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("click", onClick);
      active.clear();
    };
  }, []);

  return <canvas ref={canvasRef} className="code-glitch-background" aria-hidden="true" />;
}
