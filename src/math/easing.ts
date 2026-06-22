export function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

export function lerp(from: number, to: number, t: number) {
  const amount = clamp01(t);
  return from + (to - from) * amount;
}

export function easeOutCubic(t: number) {
  const amount = 1 - clamp01(t);
  return 1 - amount * amount * amount;
}

export function easeInOutSine(t: number) {
  return -(Math.cos(Math.PI * clamp01(t)) - 1) / 2;
}
