import type { StreamSource } from "./streamSource";

export type StreamSample = {
  x: number;
  y: number;
};

export class StreamFieldMap {
  readonly width: number;
  readonly height: number;
  private readonly data: Float32Array;

  constructor(width: number, height: number, data: Float32Array) {
    this.width = width;
    this.height = height;
    this.data = data;
  }

  sample(u: number, v: number): StreamSample {
    const x = clamp(u, 0, 1) * (this.width - 1);
    const y = clamp(v, 0, 1) * (this.height - 1);
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const x1 = Math.min(x0 + 1, this.width - 1);
    const y1 = Math.min(y0 + 1, this.height - 1);
    const tx = x - x0;
    const ty = y - y0;

    const a = this.read(x0, y0);
    const b = this.read(x1, y0);
    const c = this.read(x0, y1);
    const d = this.read(x1, y1);

    const xTop = lerp(a.x, b.x, tx);
    const yTop = lerp(a.y, b.y, tx);
    const xBottom = lerp(c.x, d.x, tx);
    const yBottom = lerp(c.y, d.y, tx);

    return {
      x: lerp(xTop, xBottom, ty),
      y: lerp(yTop, yBottom, ty),
    };
  }

  read(x: number, y: number): StreamSample {
    const index = (y * this.width + x) * 2;
    return {
      x: this.data[index],
      y: this.data[index + 1],
    };
  }
}

export function createStreamFieldMap(
  source: StreamSource,
  width = 32,
  height = 32
): StreamFieldMap {
  const data = new Float32Array(width * height * 2);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const u = width <= 1 ? 0 : x / (width - 1);
      const v = height <= 1 ? 0 : y / (height - 1);
      const sample = sampleStreamSource(source, u, v);
      const index = (y * width + x) * 2;
      data[index] = sample.x;
      data[index + 1] = sample.y;
    }
  }

  return new StreamFieldMap(width, height, data);
}

export function sampleStreamSource(
  source: StreamSource,
  u: number,
  v: number
): StreamSample {
  switch (source.type) {
    case "swirl":
      return sampleSwirl(source, u, v);
  }
}

function sampleSwirl(
  source: Extract<StreamSource, { type: "swirl" }>,
  u: number,
  v: number
): StreamSample {
  const px = u - source.center[0];
  const py = v - source.center[1];
  const r = Math.hypot(px, py);

  if (r < 1e-4) {
    return { x: 0, y: 0 };
  }

  const falloff = Math.exp(-r * source.falloff);
  const scale = falloff * source.strength;

  return {
    x: (-py / r) * scale,
    y: (px / r) * scale,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
