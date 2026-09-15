import assert from "node:assert/strict";
import { test } from "node:test";
import { getGalleryCrop } from "./gallery-crop.ts";
import { projectGalleryCrops } from "./project-gallery-crops.ts";
import { projects } from "./portfolio-data.ts";

test("every curated modal screenshot has authored desktop and mobile crops", () => {
  const sources = new Set(projects.flatMap((project) => [
    ...(project.previewImageSources ?? []),
    ...(project.lightPreviewImages ?? []).map((image) => image.src),
  ]));
  assert.equal(sources.size, 28);
  assert.deepEqual(new Set(Object.keys(projectGalleryCrops)), sources);
  for (const src of sources) {
    for (const orientation of ["desktop", "mobile"]) {
      for (const state of ["compact", "expanded"]) {
        const [x, y, zoom] = projectGalleryCrops[src][orientation][state];
        assert.ok(x >= 0 && x <= 100 && y >= 0 && y <= 100 && zoom >= 1, `${src}: ${orientation}/${state}`);
      }
    }
  }
});

test("authored crops cover all edges throughout expansion, contraction, and parallax", () => {
  const shapes = [[375, 812], [1913, 909], [1440, 1024]];
  for (const presets of Object.values(projectGalleryCrops)) {
    for (const [imageWidth, imageHeight] of shapes) {
      for (const vertical of [false, true]) {
        const preset = presets[vertical ? "mobile" : "desktop"];
        for (const crossSize of vertical ? [220, 300, 520] : [240, 340, 480]) {
          for (let step = 0; step <= 40; step++) {
            const progress = step / 40;
            const [x, y, zoom] = preset.compact.map((start, i) => start + (preset.expanded[i] - start) * progress);
            const axisSize = 44 + ((vertical ? 300 : 700) - 44) * progress;
            const panelWidth = vertical ? crossSize : axisSize;
            const panelHeight = vertical ? axisSize : crossSize;
            for (const drift of [-12, 0, 12]) {
              const frame = getGalleryCrop({
                panelWidth, panelHeight, imageWidth, imageHeight, x, y, zoom,
                driftX: vertical ? 0 : drift, driftY: vertical ? drift : 0,
              });
              assert.ok(frame.x <= -16 + 1e-8);
              assert.ok(frame.y <= -16 + 1e-8);
              assert.ok(frame.x + imageWidth * frame.scale >= panelWidth + 16 - 1e-8);
              assert.ok(frame.y + imageHeight * frame.scale >= panelHeight + 16 - 1e-8);
              assert.ok(Number.isFinite(frame.scale) && frame.scale > 0);
            }
          }
        }
      }
    }
  }
});

test("source focal point is centered when bounds allow and clamped at source edges", () => {
  const input = { panelWidth: 300, panelHeight: 200, imageWidth: 1200, imageHeight: 800, x: 40, y: 60, zoom: 2 };
  const frame = getGalleryCrop(input);
  assert.ok(Math.abs(frame.x + input.imageWidth * frame.scale * 0.4 - 150) < 1e-8);
  assert.ok(Math.abs(frame.y + input.imageHeight * frame.scale * 0.6 - 100) < 1e-8);
  assert.equal(getGalleryCrop({ ...input, x: 0, y: 0 }).x, -16);
  assert.equal(getGalleryCrop({ ...input, x: 0, y: 0 }).y, -16);
  assert.equal(getGalleryCrop({ ...input, zoom: 0 }).scale, getGalleryCrop({ ...input, zoom: 1 }).scale);
});
