"use client";

import { motion, useSpring } from "framer-motion";
import { useEffect, useRef, type ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

type ProjectImageTiltProps = Pick<
  ComponentPropsWithoutRef<"button">,
  "children" | "className" | "onClick" | "aria-label"
>;

const tiltSpring = { stiffness: 180, damping: 22, mass: 0.8, restDelta: 0.001, restSpeed: 0.01 };
const maxTilt = 3;

export function ProjectImageTilt({ children, className, onClick, "aria-label": label }: ProjectImageTiltProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const rotateX = useSpring(0, tiltSpring);
  const rotateY = useSpring(0, tiltSpring);
  const y = useSpring(0, tiltSpring);

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    const motionAllowed = window.matchMedia(
      "(prefers-reduced-motion: no-preference) and (any-hover: hover) and (any-pointer: fine)",
    );

    const reset = () => {
      rotateX.set(0);
      rotateY.set(0);
      y.set(0);
    };

    const stop = () => {
      rotateX.jump(0);
      rotateY.jump(0);
      y.jump(0);
    };

    const track = (event: PointerEvent) => {
      if (!motionAllowed.matches || event.pointerType === "touch" || event.buttons) return;

      const bounds = button.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const x = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - 0.5) * 2));
      const pointerY = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - 0.5) * 2));

      rotateX.set(-pointerY * maxTilt);
      rotateY.set(x * maxTilt);
      y.set(-3);
    };

    button.addEventListener("pointerenter", track);
    button.addEventListener("pointermove", track);
    button.addEventListener("pointerleave", reset);
    button.addEventListener("pointercancel", reset);
    button.addEventListener("pointerdown", reset);
    window.addEventListener("blur", reset);
    motionAllowed.addEventListener("change", stop);

    return () => {
      button.removeEventListener("pointerenter", track);
      button.removeEventListener("pointermove", track);
      button.removeEventListener("pointerleave", reset);
      button.removeEventListener("pointercancel", reset);
      button.removeEventListener("pointerdown", reset);
      window.removeEventListener("blur", reset);
      motionAllowed.removeEventListener("change", stop);
      stop();
    };
  }, [rotateX, rotateY, y]);

  return (
    <button ref={buttonRef} type="button" className={className} onClick={onClick} aria-label={label}>
      <motion.span
        className={cn("project-image-tilt-surface", "block w-full pointer-events-none")}
        style={{ rotateX, rotateY, y, transformPerspective: 1600 }}
      >
        {children}
      </motion.span>
    </button>
  );
}
