"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import type { Project, ProjectImage } from "@/lib/portfolio-data";
import { cn } from "@/lib/cn";

const omsGallery = {
  eyebrow: "Product walkthrough",
  title: "One platform, every trading decision.",
  intro:
    "From market discovery and technical analysis to execution, OTC workflows, and portfolio visibility, the interface keeps complex financial operations connected without flattening their detail.",
  capabilities: ["Market watch", "Orders & trades", "Portfolio", "Accounting", "Analysis", "OTC", "Treemap"],
  groups: [
    { name: "Market intelligence", description: "Dense live data becomes a set of focused surfaces for scanning, comparison, and deeper analysis." },
    { name: "Trading operations", description: "Execution workflows keep market context, validation, and order state close to every action." },
    { name: "Portfolio & access", description: "Portfolio views connect allocation, positions, and secure access to the broader trading workflow." },
  ],
};

function gallerySpan(emphasis: ProjectImage["emphasis"]) {
  if (emphasis === "hero") return "col-span-full lg:col-span-12";
  if (emphasis === "feature") return "col-span-full md:col-span-1 lg:col-span-7";
  return "col-span-full md:col-span-1 lg:col-span-5";
}

function ProductFrame({
  image,
  priority = false,
  onOpen,
  className = "",
}: {
  image: ProjectImage;
  priority?: boolean;
  onOpen: () => void;
  className?: string;
}) {
  return (
    <button
      className={cn(
        `product-frame product-frame-${image.theme} product-frame-${image.device ?? "desktop"}`,
        "min-w-0",
        className,
      )}
      type="button"
      onClick={onOpen}
      aria-label={`Expand ${image.label} screenshot`}
    >
      <span className="product-frame-bar" aria-hidden="true">
        <i /><i /><i />
        <small>{image.label}</small>
        <Expand size={14} />
      </span>
      <span
        className="product-frame-image"
        style={{ aspectRatio: `${image.width} / ${image.height}` }}
      >
        <Image
          src={image.src}
          alt={image.alt}
          fill
          priority={priority}
          sizes={image.emphasis === "hero"
            ? "(max-width: 640px) 100vw, 88vw"
            : image.emphasis === "feature"
              ? "(max-width: 760px) 100vw, 68vw"
              : "(max-width: 760px) 100vw, 42vw"}
        />
      </span>
    </button>
  );
}

export function ProjectGallery({ project }: { project: Project }) {
  const images = project.images ?? [];
  const gallery = project.gallery ?? omsGallery;
  const isBanking = project.previewVariant === "banking";
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeImage = activeIndex === null ? null : images[activeIndex];

  const move = (direction: 1 | -1) => {
    setActiveIndex((current) => {
      if (current === null) return 0;
      return (current + direction + images.length) % images.length;
    });
  };

  return (
    <>
      <section className={`oms-showcase project-showcase-${project.previewVariant ?? "trading"}`} aria-labelledby="project-showcase-title">
        <div className={cn("oms-showcase-intro", "grid grid-cols-1 md:grid-cols-2 gap-6")}>
          <div className="min-w-0">
            <span className="project-eyebrow">{gallery.eyebrow}</span>
            <h2 id="project-showcase-title">{gallery.title}</h2>
          </div>
          <p className="min-w-0 md:self-end">{gallery.intro}</p>
        </div>

        {isBanking ? (
          <div
            className={cn(
              "omid-mobile-hero",
              "flex gap-3 overflow-x-auto snap-x snap-mandatory",
              "md:grid md:grid-cols-[0.85fr_1.15fr_0.85fr] md:items-end md:justify-items-center md:gap-6 md:overflow-visible md:snap-none",
            )}
            aria-label="Omid Bank mobile product highlights"
          >
            <ProductFrame
              image={images[0]}
              priority
              className={cn(
                "omid-mobile-hero-main",
                "w-[min(72vw,280px)] shrink-0 snap-center md:order-2 md:w-full md:max-w-[280px]",
              )}
              onOpen={() => setActiveIndex(0)}
            />
            <ProductFrame
              image={images[1]}
              className={cn(
                "omid-mobile-hero-left",
                "w-[min(72vw,280px)] shrink-0 snap-center md:order-1 md:w-full md:max-w-[220px]",
              )}
              onOpen={() => setActiveIndex(1)}
            />
            <ProductFrame
              image={images[2]}
              className={cn(
                "omid-mobile-hero-right",
                "w-[min(72vw,280px)] shrink-0 snap-center md:order-3 md:w-full md:max-w-[220px]",
              )}
              onOpen={() => setActiveIndex(2)}
            />
          </div>
        ) : (
          <ProductFrame
            image={images[0]}
            priority
            className="product-frame-hero"
            onOpen={() => setActiveIndex(0)}
          />
        )}

        <div
          className={cn("oms-capabilities", "grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2")}
          aria-label={`Key ${project.title} capabilities`}
        >
          {gallery.capabilities.map(
            (capability, index) => (
              <span key={capability} className="min-w-0">
                <small>{String(index + 1).padStart(2, "0")}</small>
                {capability}
              </span>
            ),
          )}
        </div>

        {gallery.groups.map((group, groupIndex) => {
          const groupImages = images.filter(
            (image, index) => image.group === group.name && (isBanking ? index > 2 : index !== 0),
          );
          const groupId = `group-${group.name.toLowerCase().replaceAll(" ", "-").replaceAll("&", "and")}`;

          if (!groupImages.length) return null;

          return (
            <section className="oms-gallery-group" key={group.name} aria-labelledby={groupId}>
              <div
                className={cn(
                  "oms-gallery-heading",
                  "grid grid-cols-[44px_minmax(0,1fr)] md:grid-cols-[54px_minmax(0,0.7fr)_minmax(0,1fr)] gap-3 md:gap-x-5",
                )}
              >
                <span>{String(groupIndex + 1).padStart(2, "0")}</span>
                <h3 id={groupId} className="min-w-0">{group.name}</h3>
                <p className={cn("min-w-0 col-start-2 md:col-auto")}>{group.description}</p>
              </div>
              <div className={cn("oms-gallery-grid", "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5")}>
                {groupImages.map((image) => {
                  const imageIndex = images.indexOf(image);
                  return (
                    <article
                      className={cn(
                        `oms-gallery-item oms-gallery-${image.emphasis} oms-gallery-${image.device ?? "desktop"}`,
                        "min-w-0",
                        gallerySpan(image.emphasis),
                      )}
                      key={image.label}
                    >
                      <ProductFrame image={image} onOpen={() => setActiveIndex(imageIndex)} />
                      <div className="oms-gallery-caption">
                        <h4>{image.label}</h4>
                        <p>{image.description}</p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </section>

      <Dialog.Root open={activeIndex !== null} onOpenChange={(open) => !open && setActiveIndex(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="gallery-lightbox-overlay" />
          <Dialog.Content
            className="gallery-lightbox"
            onKeyDown={(event) => {
              if (event.key === "ArrowRight") {
                event.preventDefault();
                move(1);
              }
              if (event.key === "ArrowLeft") {
                event.preventDefault();
                move(-1);
              }
            }}
          >
            {activeImage && (
              <>
                <div className={cn("gallery-lightbox-top", "min-w-0")}>
                  <div className="min-w-0">
                    <Dialog.Title>{activeImage.label}</Dialog.Title>
                    <Dialog.Description>{activeImage.description}</Dialog.Description>
                  </div>
                  <span>{String((activeIndex ?? 0) + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}</span>
                  <Dialog.Close className={cn("gallery-lightbox-close", "min-h-11 min-w-11")} aria-label="Close expanded screenshot">
                    <X size={20} />
                  </Dialog.Close>
                </div>
                <div className={`gallery-lightbox-image gallery-lightbox-image-${activeImage.theme}`}>
                  <Image
                    key={activeImage.label}
                    src={activeImage.src}
                    alt={activeImage.alt}
                    fill
                    sizes="100vw"
                  />
                </div>
                <div className={cn("gallery-lightbox-controls", "grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center")}>
                  <button type="button" onClick={() => move(-1)} aria-label="View previous screenshot" className="min-h-11">
                    <ChevronLeft size={20} /> Previous
                  </button>
                  <p className="hidden sm:block">Use the arrow keys to explore</p>
                  <button type="button" onClick={() => move(1)} aria-label="View next screenshot" className="min-h-11 sm:justify-self-end">
                    Next <ChevronRight size={20} />
                  </button>
                </div>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
