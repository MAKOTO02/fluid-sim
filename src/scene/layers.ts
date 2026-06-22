export const SceneLayers = {
  default: 1 << 0,
  obstacle: 1 << 1,
  stream: 1 << 2,
} as const;

export type SceneLayers = typeof SceneLayers;
