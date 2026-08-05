"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import type { Project, ProjectImage } from "@/lib/portfolio-data";

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
      className={`product-frame product-frame-${image.theme} product-frame-${image.device ?? "desktop"} ${className}`}
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
        <div className="oms-showcase-intro">
          <div>
            <span className="project-eyebrow">{gallery.eyebrow}</span>
            <h2 id="project-showcase-title">{gallery.title}</h2>
          </div>
          <p>{gallery.intro}</p>
        </div>

        {isBanking ? (
          <div className="omid-mobile-hero" aria-label="Omid Bank mobile product highlights">
            <ProductFrame
              image={images[0]}
              priority
              className="omid-mobile-hero-main"
              onOpen={() => setActiveIndex(0)}
            />
            <ProductFrame
              image={images[1]}
              className="omid-mobile-hero-left"
              onOpen={() => setActiveIndex(1)}
            />
            <ProductFrame
              image={images[2]}
              className="omid-mobile-hero-right"
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

        <div className="oms-capabilities" aria-label={`Key ${project.title} capabilities`}>
          {gallery.capabilities.map(
            (capability, index) => (
              <span key={capability}><small>{String(index + 1).padStart(2, "0")}</small>{capability}</span>
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
              <div className="oms-gallery-heading">
                <span>{String(groupIndex + 1).padStart(2, "0")}</span>
                <h3 id={groupId}>{group.name}</h3>
                <p>{group.description}</p>
              </div>
              <div className="oms-gallery-grid">
                {groupImages.map((image) => {
                  const imageIndex = images.indexOf(image);
                  return (
                    <article
                      className={`oms-gallery-item oms-gallery-${image.emphasis} oms-gallery-${image.device ?? "desktop"}`}
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
                <div className="gallery-lightbox-top">
                  <div>
                    <Dialog.Title>{activeImage.label}</Dialog.Title>
                    <Dialog.Description>{activeImage.description}</Dialog.Description>
                  </div>
                  <span>{String((activeIndex ?? 0) + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}</span>
                  <Dialog.Close className="gallery-lightbox-close" aria-label="Close expanded screenshot">
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
                <div className="gallery-lightbox-controls">
                  <button type="button" onClick={() => move(-1)} aria-label="View previous screenshot">
                    <ChevronLeft size={20} /> Previous
                  </button>
                  <p>Use the arrow keys to explore</p>
                  <button type="button" onClick={() => move(1)} aria-label="View next screenshot">
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
