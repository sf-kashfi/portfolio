"use client";

import { gsap } from "gsap";
import Image from "next/image";
import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent } from "react";
import { cn } from "@/lib/cn";
import { getGalleryCrop, type GalleryImageCrops } from "@/lib/gallery-crop";

export interface AccordionGalleryItem {
  src: string;
  alt: string;
  label: string;
  crop?: GalleryImageCrops;
}

export interface AccordionGalleryProps {
  items: readonly AccordionGalleryItem[];
  label: string;
  defaultIndex?: number;
  expandRatio?: number;
  className?: string;
}

export function AccordionGallery({
  items,
  label,
  defaultIndex = 0,
  expandRatio = 0.58,
  className,
}: AccordionGalleryProps) {
  const instructionsId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const layoutRef = useRef<((animate: boolean) => void) | null>(null);
  const renderMediaRef = useRef<(() => void) | null>(null);
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  const [selection, setSelection] = useState(defaultIndex);
  const count = items.length;
  const active = Math.max(0, Math.min(selection, count - 1));
  const activeRef = useRef(active);
  const ratio = Math.max(0.35, Math.min(expandRatio, 0.8));
  const grow = count > 1 ? (ratio * (count - 1)) / (1 - ratio) : 1;

  useEffect(() => {
    activeRef.current = active;
    layoutRef.current?.(true);
  }, [active]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !count) return;

    const panels = Array.from(root.querySelectorAll<HTMLElement>("[data-gallery-panel]"));
    const media = panels.map((panel) => panel.querySelector<HTMLElement>("[data-gallery-media]"));
    const surfaces = panels.map((panel) => panel.querySelector<HTMLElement>("[data-gallery-surface]")!);
    const images = panels.map((panel) => panel.querySelector<HTMLImageElement>("img")!);
    const captions = panels.map((panel) => panel.querySelector<HTMLElement>("[data-gallery-caption]"));
    const modes = gsap.matchMedia();

    modes.add({ reduced: "(prefers-reduced-motion: reduce)", all: "(min-width: 0px)" }, (context) => {
      const reduced = Boolean(context.conditions?.reduced);
      let timeline: gsap.core.Timeline | null = null;
      let vertical = getComputedStyle(root).flexDirection === "column";
      const crops = items.map((item, index) => {
        const preset = (vertical && item.crop?.mobile) || item.crop?.desktop;
        const [x, y, zoom] = preset?.[index === activeRef.current ? "expanded" : "compact"] ?? [50, 50, 1];
        return { x, y, zoom, driftX: 0, driftY: 0 };
      });

      const renderMedia = () => {
        // Read all live panel sizes before writing transforms. Cover must follow flex growth,
        // not just its endpoints, including when a running transition is interrupted.
        const bounds = surfaces.map((surface) => ({ panelWidth: surface.clientWidth, panelHeight: surface.clientHeight }));
        media.forEach((element, index) => {
          const image = images[index];
          if (!element || !image.naturalWidth || !image.naturalHeight) return;
          const frame = getGalleryCrop({
            ...bounds[index], ...crops[index], imageWidth: image.naturalWidth, imageHeight: image.naturalHeight,
          });
          element.style.inset = "0 auto auto 0";
          element.style.width = `${image.naturalWidth}px`;
          element.style.height = `${image.naturalHeight}px`;
          element.style.transform = `translate3d(${frame.x}px, ${frame.y}px, 0) scale(${frame.scale})`;
        });
      };

      const layout = (animate: boolean) => {
        // Retarget from the current visual state, never queue animations or reset on leave.
        timeline?.kill();
        const duration = animate && !reduced ? 0.6 : 0;
        timeline = gsap.timeline({
          defaults: { duration, ease: "power3.out", overwrite: "auto" },
          onUpdate: renderMedia,
        });
        panels.forEach((panel, index) => {
          const selected = index === activeRef.current;
          const rotation = reduced || selected ? 0 : index < activeRef.current ? 4 : -4;
          const drift = Math.max(-1.5, Math.min(1.5, activeRef.current - index));
          const shift = reduced || selected ? 0 : drift * 8;
          const preset = (vertical && items[index].crop?.mobile) || items[index].crop?.desktop;
          const [x, y, zoom] = preset?.[selected ? "expanded" : "compact"] ?? [50, 50, 1];
          timeline!.to(panel, {
            flexGrow: selected ? grow : 1,
            "--ag-gray": selected ? 0 : 1,
            "--ag-dim": selected ? 0 : 0.35,
          }, 0);
          // Keep hit targets flat: tilting the button itself creates moving hover boundaries.
          timeline!.to(surfaces[index], {
            rotationX: vertical ? -rotation : 0,
            rotationY: vertical ? 0 : rotation,
          }, 0);
          timeline!.to(crops[index], { x, y, zoom, driftX: vertical ? 0 : shift, driftY: vertical ? shift : 0 }, 0);
          timeline!.to(captions[index], { opacity: selected ? 1 : 0, x: selected ? 0 : -12 }, 0);
        });
        if (duration === 0) renderMedia();
      };

      const measure = () => {
        // CSS container queries own orientation; read it back so layout and parallax agree.
        vertical = getComputedStyle(root).flexDirection === "column";
        layout(false);
      };

      layoutRef.current = layout;
      renderMediaRef.current = renderMedia;
      measure();
      const observer = new ResizeObserver(measure);
      observer.observe(root);
      return () => {
        observer.disconnect();
        layoutRef.current = null;
        renderMediaRef.current = null;
        timeline?.kill();
        media.forEach((element) => element?.removeAttribute("style"));
      };
    });

    return () => {
      modes.revert();
    };
  }, [items, count, grow]);

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>, index: number) => {
    const vertical = getComputedStyle(rootRef.current!).flexDirection === "column";
    let next = index;
    if (event.key === "Home") next = 0;
    else if (event.key === "End") next = count - 1;
    else if (event.key === (vertical ? "ArrowDown" : "ArrowRight")) next = (index + 1) % count;
    else if (event.key === (vertical ? "ArrowUp" : "ArrowLeft")) next = (index - 1 + count) % count;
    else return;
    event.preventDefault();
    const buttons = rootRef.current?.querySelectorAll<HTMLButtonElement>("button[data-gallery-panel]");
    buttons?.[next]?.focus();
    setSelection(next);
  };

  if (!count) return null;

  return (
    <div className={cn("accordion-gallery-container min-w-0", className)}>
      {count > 1 && (
        <p id={instructionsId} className="sr-only">
          Use left and right arrow keys, or up and down in the vertical layout, to explore screenshots.
          Home and End select the first and last screenshot. You can also hover or tap a screenshot.
        </p>
      )}
      <div
        ref={rootRef}
        role="group"
        aria-label={label}
        aria-describedby={count > 1 ? instructionsId : undefined}
        className="accordion-gallery flex w-full gap-2.5"
        style={{ "--ag-grow": grow } as CSSProperties}
        onPointerMove={(event) => {
          if (event.pointerType === "touch" || event.buttons) return;
          if (rootRef.current?.querySelector("[data-gallery-panel]:focus-visible")) return;
          const previous = pointerRef.current;
          if (previous?.x === event.clientX && previous?.y === event.clientY) return;
          pointerRef.current = { x: event.clientX, y: event.clientY };
          const panel = (event.target as HTMLElement).closest<HTMLElement>("[data-gallery-panel]");
          if (panel && rootRef.current?.contains(panel)) setSelection(Number(panel.dataset.galleryPanel));
        }}
        onPointerLeave={() => { pointerRef.current = null; }}
      >
        {items.map((item, index) => {
          const selected = index === active;
          const Tag = count === 1 ? "div" : "button";
          return (
            <Tag
              key={item.src}
              type={count === 1 ? undefined : "button"}
              data-gallery-panel={index}
              data-active={selected}
              className="accordion-gallery-panel relative p-0 text-left outline-none"
              aria-label={count === 1 ? undefined : `${item.label}, screenshot ${index + 1} of ${count}`}
              aria-pressed={count === 1 ? undefined : selected}
              tabIndex={count === 1 ? undefined : selected ? 0 : -1}
              onFocus={count === 1 ? undefined : () => setSelection(index)}
              onClick={count === 1 ? undefined : (event: MouseEvent<HTMLElement>) => {
                event.currentTarget.focus({ preventScroll: true });
                setSelection(index);
              }}
              onKeyDown={count === 1 ? undefined : (event: KeyboardEvent<HTMLElement>) => handleKeyDown(event, index)}
            >
              <span data-gallery-surface className="accordion-gallery-surface pointer-events-none absolute inset-0 block overflow-hidden">
                <span data-gallery-media className="accordion-gallery-media absolute block">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 640px) 160vw, 1200px"
                    className="select-none object-cover"
                    draggable={false}
                    onLoad={() => renderMediaRef.current?.()}
                  />
                </span>
                <span className="accordion-gallery-dim absolute inset-0" aria-hidden="true" />
                <span data-gallery-caption className="accordion-gallery-caption absolute inset-x-3 bottom-3 flex items-center gap-2" aria-hidden={count > 1 ? true : undefined}>
                  <span className="accordion-gallery-accent h-5 w-0.5 shrink-0 rounded-full" />
                  <span className="truncate text-xs font-semibold sm:text-sm">{item.label}</span>
                </span>
              </span>
            </Tag>
          );
        })}
      </div>
    </div>
  );
}
