"use client";

import { useEffect, useRef } from "react";

/** Opt-in pointer coordinates for a positioned `.surface-light` host. */
export function useSurfaceLight<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const surface = ref.current;
    if (!surface) return;

    const capability = window.matchMedia(
      "(any-hover: hover) and (any-pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    let bounds: DOMRect | null = null;
    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;
    let tracking = false;

    const reset = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      bounds = null;
      delete surface.dataset.lightActive;
      if (!tracking) return;
      tracking = false;
      observer.disconnect();
      window.removeEventListener("scroll", reset, true);
      window.removeEventListener("resize", reset);
      window.removeEventListener("blur", reset);
    };

    // Geometry is cached for the hover session, not measured on every move.
    const observer = new ResizeObserver(() => { bounds = null; });

    const paint = () => {
      frame = 0;
      bounds ??= surface.getBoundingClientRect();
      surface.style.setProperty("--surface-light-x", `${(pointerX - bounds.left).toFixed(1)}px`);
      surface.style.setProperty("--surface-light-y", `${(pointerY - bounds.top).toFixed(1)}px`);
      surface.dataset.lightActive = "";
    };

    const track = (event: PointerEvent) => {
      if (!capability.matches || event.pointerType === "touch") return;
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (!tracking) {
        tracking = true;
        observer.observe(surface);
        // Only the hovered surface listens; scrolling clears stale illumination.
        window.addEventListener("scroll", reset, { passive: true, capture: true });
        window.addEventListener("resize", reset, { passive: true });
        window.addEventListener("blur", reset);
      }
      // Coalesce input bursts into one write; there is no idle animation loop.
      if (!frame) frame = requestAnimationFrame(paint);
    };

    const sync = () => {
      reset();
      surface.removeEventListener("pointerenter", track);
      surface.removeEventListener("pointermove", track);
      surface.removeEventListener("pointerleave", reset);
      surface.removeEventListener("pointercancel", reset);
      if (!capability.matches) return;
      surface.addEventListener("pointerenter", track, { passive: true });
      surface.addEventListener("pointermove", track, { passive: true });
      surface.addEventListener("pointerleave", reset);
      surface.addEventListener("pointercancel", reset);
    };

    sync();
    capability.addEventListener("change", sync);
    return () => {
      reset();
      observer.disconnect();
      capability.removeEventListener("change", sync);
      surface.removeEventListener("pointerenter", track);
      surface.removeEventListener("pointermove", track);
      surface.removeEventListener("pointerleave", reset);
      surface.removeEventListener("pointercancel", reset);
      surface.style.removeProperty("--surface-light-x");
      surface.style.removeProperty("--surface-light-y");
    };
  }, []);

  return ref;
}
