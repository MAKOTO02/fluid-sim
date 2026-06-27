import { getStreamSource } from "../fluid/streamCatalog";
import { sampleStreamSource } from "../fluid/streamFieldMap";
import type { StageDefinition } from "../stage/stageDefinition";

const STREAM_PREVIEW_WIDTH = 160;
const STREAM_PREVIEW_HEIGHT = 90;
const STREAM_VISUAL_SCALE = 5000;

export function createStreamPreviewList(stage: StageDefinition): HTMLElement {
  const section = document.createElement("section");
  section.style.margin = "0 0 16px";
  section.appendChild(createSectionTitle("Stream Preview"));

  if (stage.streams.length === 0) {
    const empty = document.createElement("div");
    empty.textContent = "No streams";
    empty.style.color = "rgba(238,244,255,0.55)";
    empty.style.fontSize = "13px";
    section.appendChild(empty);
    return section;
  }

  const grid = document.createElement("div");
  grid.style.display = "grid";
  grid.style.gridTemplateColumns = "repeat(auto-fit, minmax(220px, 1fr))";
  grid.style.gap = "10px";

  for (const stream of stage.streams) {
    const card = document.createElement("div");
    card.style.padding = "10px";
    card.style.border = "1px solid rgba(255,255,255,0.12)";
    card.style.borderRadius = "6px";
    card.style.background = "rgba(0,0,0,0.18)";

    const title = document.createElement("div");
    title.textContent = `${stream.id} / ${stream.sourceId}`;
    title.style.marginBottom = "8px";
    title.style.font = "12px/1.4 Consolas, Monaco, monospace";
    title.style.color = "rgba(238,244,255,0.78)";

    const canvas = document.createElement("canvas");
    canvas.width = STREAM_PREVIEW_WIDTH;
    canvas.height = STREAM_PREVIEW_HEIGHT;
    canvas.style.display = "block";
    canvas.style.width = "100%";
    canvas.style.aspectRatio = "16 / 9";
    canvas.style.border = "1px solid rgba(255,255,255,0.16)";
    canvas.style.borderRadius = "4px";
    canvas.style.imageRendering = "pixelated";

    renderStreamPreview(canvas, stream.sourceId);
    card.append(title, canvas);
    grid.appendChild(card);
  }

  section.appendChild(grid);
  return section;
}

function renderStreamPreview(canvas: HTMLCanvasElement, sourceId: StageDefinition["streams"][number]["sourceId"]): void {
  const context = canvas.getContext("2d");
  if (!context) return;

  const source = getStreamSource(sourceId);
  const image = context.createImageData(canvas.width, canvas.height);

  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      const u = canvas.width <= 1 ? 0 : x / (canvas.width - 1);
      const v = canvas.height <= 1 ? 0 : 1 - y / (canvas.height - 1);
      const sample = sampleStreamSource(source, u, v);
      const color = streamSampleToColor(sample.x, sample.y);
      const index = (y * canvas.width + x) * 4;
      image.data[index] = color.r;
      image.data[index + 1] = color.g;
      image.data[index + 2] = color.b;
      image.data[index + 3] = 255;
    }
  }

  context.putImageData(image, 0, 0);
}

function streamSampleToColor(x: number, y: number): { r: number; g: number; b: number } {
  const len = Math.hypot(x, y);
  const mag = clamp(len * STREAM_VISUAL_SCALE, 0, 1);
  const dirX = len > 1e-8 ? x / len : 0;
  const dirY = len > 1e-8 ? y / len : 0;

  const base = { r: 0.02, g: 0.04, b: 0.08 };
  const direction = {
    r: dirX * 0.5 + 0.5,
    g: dirY * 0.5 + 0.5,
    b: 0,
  };

  return {
    r: toByte(lerp(base.r, direction.r, mag) + mag * 0.25),
    g: toByte(lerp(base.g, direction.g, mag) + mag * 0.25),
    b: toByte(lerp(base.b, direction.b, mag) + mag * 0.25),
  };
}

function createSectionTitle(text: string): HTMLElement {
  const title = document.createElement("h3");
  title.textContent = text;
  title.style.margin = "0 0 8px";
  title.style.fontSize = "14px";
  title.style.color = "#cfe3ff";
  return title;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function toByte(value: number): number {
  return Math.round(clamp(value, 0, 1) * 255);
}
