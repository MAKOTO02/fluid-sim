export const PLAYER_FLUID_INK_COLOR = {
  r: 0,
  g: 0.35,
  b: 1.0,
} as const;

export const SHELTER_STORED_INK_COLOR = {
  ...PLAYER_FLUID_INK_COLOR,
  a: 0.85,
} as const;
