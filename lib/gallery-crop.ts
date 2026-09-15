// Focal coordinates are percentages of the source image, not object-position values.
export type GalleryCrop = readonly [x: number, y: number, zoom: number];

export type GalleryImageCrops = {
  desktop: { compact: GalleryCrop; expanded: GalleryCrop };
  mobile?: { compact: GalleryCrop; expanded: GalleryCrop };
};

export function getGalleryCrop({
  panelWidth, panelHeight, imageWidth, imageHeight, x, y, zoom, driftX = 0, driftY = 0,
}: {
  panelWidth: number;
  panelHeight: number;
  imageWidth: number;
  imageHeight: number;
  x: number;
  y: number;
  zoom: number;
  driftX?: number;
  driftY?: number;
}) {
  const bleed = 16;
  const scale = Math.max((panelWidth + bleed * 2) / imageWidth, (panelHeight + bleed * 2) / imageHeight) * Math.max(1, zoom);
  const width = imageWidth * scale;
  const height = imageHeight * scale;

  // Clamp AFTER focal positioning and parallax, keeping bleed on every edge at every frame.
  return {
    scale,
    x: Math.min(-bleed, Math.max(panelWidth + bleed - width, panelWidth / 2 - width * x / 100 + driftX)),
    y: Math.min(-bleed, Math.max(panelHeight + bleed - height, panelHeight / 2 - height * y / 100 + driftY)),
  };
}
