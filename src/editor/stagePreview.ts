import type { StageDefinition } from "../stage/stageDefinition";
import { getStreamSource } from "../fluid/streamCatalog";
import { sampleStreamSource } from "../fluid/streamFieldMap";
import { getShelterConfig } from "../stage/shelterCatalog";

const PREVIEW_WORLD_HEIGHT = 4.2;
const PREVIEW_WORLD_WIDTH = PREVIEW_WORLD_HEIGHT * (16 / 9);
const PREVIEW_VIEWBOX_WIDTH = 1600;
const PREVIEW_VIEWBOX_HEIGHT = 900;
const STREAM_OVERLAY_COLS = 20;
const STREAM_OVERLAY_ROWS = 11;
const STREAM_OVERLAY_SCALE = 260000;

export type StagePreviewOptions = {
  showStreamOverlay?: boolean;
};

export function createStagePreview(
  stage: StageDefinition,
  options: StagePreviewOptions = {}
): HTMLElement {
  const section = document.createElement("section");
  section.style.margin = "0 0 16px";
  section.appendChild(createSectionTitle(options.showStreamOverlay ? "16:9 Stage Preview + Stream" : "16:9 Stage Preview"));

  const svg = createSvgElement("svg");
  svg.setAttribute("viewBox", `0 0 ${PREVIEW_VIEWBOX_WIDTH} ${PREVIEW_VIEWBOX_HEIGHT}`);
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", `${stage.name} layout preview`);
  svg.style.display = "block";
  svg.style.width = "100%";
  svg.style.aspectRatio = "16 / 9";
  svg.style.border = "1px solid rgba(255,255,255,0.18)";
  svg.style.borderRadius = "6px";
  svg.style.background = "#020407";

  appendPreviewBackground(svg);
  if (options.showStreamOverlay) {
    appendStreamOverlay(svg, stage);
  }

  for (const shelter of stage.shelters) {
    const config = getShelterConfig(shelter.type);
    const center = worldToPreview(shelter.position[0], shelter.position[1]);
    const width = (config.colliderHalfExtents[0] * 2 / PREVIEW_WORLD_WIDTH) * PREVIEW_VIEWBOX_WIDTH;
    const height = (config.colliderHalfExtents[1] * 2 / PREVIEW_WORLD_HEIGHT) * PREVIEW_VIEWBOX_HEIGHT;
    appendRectMarker(svg, {
      x: center.x - width / 2,
      y: center.y - height / 2,
      width,
      height,
      fill: "rgba(80, 190, 230, 0.32)",
      stroke: "rgba(140, 235, 255, 0.88)",
      label: shelter.id,
    });
  }

  for (const hazard of stage.hazardEmitters) {
    const pos = worldToPreview(hazard.position[0], hazard.position[1]);
    appendCircleMarker(svg, {
      x: pos.x,
      y: pos.y,
      radius: 20,
      fill: "rgba(255, 58, 48, 0.82)",
      stroke: "rgba(255, 190, 180, 0.95)",
      label: hazard.id,
    });
  }

  for (const enemy of stage.enemies) {
    const pos = worldToPreview(enemy.centerPosition[0], enemy.centerPosition[1]);
    appendCircleMarker(svg, {
      x: pos.x,
      y: pos.y,
      radius: 24,
      fill: "rgba(255, 120, 145, 0.86)",
      stroke: "rgba(255, 220, 225, 0.95)",
      label: enemy.id,
    });
  }

  const playerPos = worldToPreview(stage.playerStart[0], stage.playerStart[1]);
  appendDiamondMarker(svg, {
    x: playerPos.x,
    y: playerPos.y,
    size: 34,
    fill: "rgba(80, 220, 255, 0.9)",
    stroke: "rgba(230, 255, 255, 1)",
    label: "player",
  });

  const legend = document.createElement("div");
  legend.style.display = "flex";
  legend.style.flexWrap = "wrap";
  legend.style.gap = "8px 12px";
  legend.style.marginTop = "8px";
  legend.style.fontSize = "12px";
  legend.style.color = "rgba(238,244,255,0.76)";
  legend.append(
    createLegendItem("#50dcff", "Player"),
    createLegendItem("#8cecff", "Shelter"),
    createLegendItem("#ff7891", "Enemy"),
    createLegendItem("#ff3a30", "Hazard"),
    ...(options.showStreamOverlay ? [createLegendItem("#b7ff62", "Stream")] : [])
  );

  section.append(svg, legend);
  return section;
}

function appendStreamOverlay(svg: SVGSVGElement, stage: StageDefinition): void {
  const stream = stage.streams[0];
  if (!stream) return;

  const source = getStreamSource(stream.sourceId);

  for (let y = 0; y < STREAM_OVERLAY_ROWS; y += 1) {
    for (let x = 0; x < STREAM_OVERLAY_COLS; x += 1) {
      const u = (x + 0.5) / STREAM_OVERLAY_COLS;
      const v = (y + 0.5) / STREAM_OVERLAY_ROWS;
      const sample = sampleStreamSource(source, u, v);
      const len = Math.hypot(sample.x, sample.y);
      if (len < 1e-8) continue;

      const center = {
        x: u * PREVIEW_VIEWBOX_WIDTH,
        y: (1 - v) * PREVIEW_VIEWBOX_HEIGHT,
      };
      const dirX = sample.x / len;
      const dirY = -sample.y / len;
      const length = clamp(len * STREAM_OVERLAY_SCALE, 12, 48);
      appendArrow(svg, center.x, center.y, dirX, dirY, length);
    }
  }
}

function appendArrow(
  svg: SVGSVGElement,
  x: number,
  y: number,
  dirX: number,
  dirY: number,
  length: number
): void {
  const x2 = x + dirX * length;
  const y2 = y + dirY * length;
  const stroke = "rgba(183,255,98,0.62)";

  appendLine(svg, x, y, x2, y2, stroke, 4);

  const perpX = -dirY;
  const perpY = dirX;
  const headLength = Math.min(11, length * 0.45);
  const baseX = x2 - dirX * headLength;
  const baseY = y2 - dirY * headLength;

  const head = createSvgElement("polygon");
  head.setAttribute(
    "points",
    `${x2},${y2} ${baseX + perpX * headLength * 0.45},${baseY + perpY * headLength * 0.45} ${baseX - perpX * headLength * 0.45},${baseY - perpY * headLength * 0.45}`
  );
  head.setAttribute("fill", stroke);
  svg.appendChild(head);
}

function appendPreviewBackground(svg: SVGSVGElement): void {
  const bg = createSvgElement("rect");
  bg.setAttribute("x", "0");
  bg.setAttribute("y", "0");
  bg.setAttribute("width", String(PREVIEW_VIEWBOX_WIDTH));
  bg.setAttribute("height", String(PREVIEW_VIEWBOX_HEIGHT));
  bg.setAttribute("fill", "#020407");
  svg.appendChild(bg);

  for (let i = 1; i < 4; i += 1) {
    const x = (PREVIEW_VIEWBOX_WIDTH / 4) * i;
    appendLine(svg, x, 0, x, PREVIEW_VIEWBOX_HEIGHT, "rgba(255,255,255,0.07)");
  }

  for (let i = 1; i < 3; i += 1) {
    const y = (PREVIEW_VIEWBOX_HEIGHT / 3) * i;
    appendLine(svg, 0, y, PREVIEW_VIEWBOX_WIDTH, y, "rgba(255,255,255,0.07)");
  }

  appendLine(svg, PREVIEW_VIEWBOX_WIDTH / 2, 0, PREVIEW_VIEWBOX_WIDTH / 2, PREVIEW_VIEWBOX_HEIGHT, "rgba(120,170,255,0.22)");
  appendLine(svg, 0, PREVIEW_VIEWBOX_HEIGHT / 2, PREVIEW_VIEWBOX_WIDTH, PREVIEW_VIEWBOX_HEIGHT / 2, "rgba(120,170,255,0.22)");
}

function appendRectMarker(
  svg: SVGSVGElement,
  opts: {
    x: number;
    y: number;
    width: number;
    height: number;
    fill: string;
    stroke: string;
    label: string;
  }
): void {
  const rect = createSvgElement("rect");
  rect.setAttribute("x", String(opts.x));
  rect.setAttribute("y", String(opts.y));
  rect.setAttribute("width", String(opts.width));
  rect.setAttribute("height", String(opts.height));
  rect.setAttribute("rx", "8");
  rect.setAttribute("fill", opts.fill);
  rect.setAttribute("stroke", opts.stroke);
  rect.setAttribute("stroke-width", "4");
  rect.appendChild(createSvgTitle(opts.label));
  svg.appendChild(rect);
}

function appendCircleMarker(
  svg: SVGSVGElement,
  opts: {
    x: number;
    y: number;
    radius: number;
    fill: string;
    stroke: string;
    label: string;
  }
): void {
  const circle = createSvgElement("circle");
  circle.setAttribute("cx", String(opts.x));
  circle.setAttribute("cy", String(opts.y));
  circle.setAttribute("r", String(opts.radius));
  circle.setAttribute("fill", opts.fill);
  circle.setAttribute("stroke", opts.stroke);
  circle.setAttribute("stroke-width", "4");
  circle.appendChild(createSvgTitle(opts.label));
  svg.appendChild(circle);
}

function appendDiamondMarker(
  svg: SVGSVGElement,
  opts: {
    x: number;
    y: number;
    size: number;
    fill: string;
    stroke: string;
    label: string;
  }
): void {
  const half = opts.size / 2;
  const polygon = createSvgElement("polygon");
  polygon.setAttribute(
    "points",
    `${opts.x},${opts.y - half} ${opts.x + half},${opts.y} ${opts.x},${opts.y + half} ${opts.x - half},${opts.y}`
  );
  polygon.setAttribute("fill", opts.fill);
  polygon.setAttribute("stroke", opts.stroke);
  polygon.setAttribute("stroke-width", "4");
  polygon.appendChild(createSvgTitle(opts.label));
  svg.appendChild(polygon);
}

function appendLine(
  svg: SVGSVGElement,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  stroke: string,
  strokeWidth = 2
): void {
  const line = createSvgElement("line");
  line.setAttribute("x1", String(x1));
  line.setAttribute("y1", String(y1));
  line.setAttribute("x2", String(x2));
  line.setAttribute("y2", String(y2));
  line.setAttribute("stroke", stroke);
  line.setAttribute("stroke-width", String(strokeWidth));
  line.setAttribute("stroke-linecap", "round");
  svg.appendChild(line);
}

function createLegendItem(color: string, label: string): HTMLElement {
  const item = document.createElement("span");
  item.style.display = "inline-flex";
  item.style.alignItems = "center";
  item.style.gap = "5px";

  const chip = document.createElement("span");
  chip.style.display = "inline-block";
  chip.style.width = "9px";
  chip.style.height = "9px";
  chip.style.borderRadius = "999px";
  chip.style.background = color;

  item.append(chip, label);
  return item;
}

function createSectionTitle(text: string): HTMLElement {
  const title = document.createElement("h3");
  title.textContent = text;
  title.style.margin = "0 0 8px";
  title.style.fontSize = "14px";
  title.style.color = "#cfe3ff";
  return title;
}

function createSvgTitle(text: string): SVGTitleElement {
  const title = createSvgElement("title");
  title.textContent = text;
  return title;
}

function createSvgElement<K extends keyof SVGElementTagNameMap>(
  tagName: K
): SVGElementTagNameMap[K] {
  return document.createElementNS("http://www.w3.org/2000/svg", tagName);
}

function worldToPreview(x: number, y: number): { x: number; y: number } {
  return {
    x: ((x + PREVIEW_WORLD_WIDTH / 2) / PREVIEW_WORLD_WIDTH) * PREVIEW_VIEWBOX_WIDTH,
    y: ((PREVIEW_WORLD_HEIGHT / 2 - y) / PREVIEW_WORLD_HEIGHT) * PREVIEW_VIEWBOX_HEIGHT,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
