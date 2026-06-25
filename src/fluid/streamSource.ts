export type SwirlStreamSource = {
  type: "swirl";
  center: [number, number];
  strength: number;
  falloff: number;
};

export type StreamSource = SwirlStreamSource;

export const DEFAULT_BULLET_STREAM_SOURCE: StreamSource = {
  type: "swirl",
  center: [0.5, 0.5],
  strength: 0.0003,
  falloff: 4.0,
};
