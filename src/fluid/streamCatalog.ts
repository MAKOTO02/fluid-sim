import type { StreamSource } from "./streamSource";

export type StreamSourceId = "default-swirl" | "wide-swirl";

export const streamSourceCatalog: Record<StreamSourceId, StreamSource> = {
  "default-swirl": {
    type: "swirl",
    center: [0.5, 0.5],
    strength: 0.0003,
    falloff: 4.0,
  },
  "wide-swirl": {
    type: "swirl",
    center: [0.42, 0.58],
    strength: 0.00024,
    falloff: 3.6,
  },
};

export function getStreamSource(id: StreamSourceId): StreamSource {
  return streamSourceCatalog[id];
}
