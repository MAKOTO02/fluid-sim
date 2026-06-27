export type HazardEmitterTypeId = "red-vent";

export type HazardEmitterConfig = {
  name: string;
  intervalSec: number;
  strength: number;
  visualColor: { r: number; g: number; b: number; a?: number };
  logicColor: { r: number; g: number; b: number; a?: number };
};

export const hazardEmitterCatalog: Record<HazardEmitterTypeId, HazardEmitterConfig> = {
  "red-vent": {
    name: "Red Vent",
    intervalSec: 0.08,
    strength: 0.0,
    visualColor: { r: 0.9, g: 0.05, b: 0.02, a: 0.75 },
    logicColor: { r: 1.0, g: 0.0, b: 0.0, a: 1.0 },
  },
};

export function getHazardEmitterConfig(typeId: HazardEmitterTypeId): HazardEmitterConfig {
  return hazardEmitterCatalog[typeId];
}
