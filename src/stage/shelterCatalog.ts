export type ShelterTypeId = "basic";

export type ShelterConfig = {
  id: ShelterTypeId;
  name: string;
  health: number;
  recoveryPerSecond: number;
  inkRecoveryPerSecond: number;
  colliderHalfExtents: [number, number, number];
  visualScale: [number, number, number];
};

export const shelterCatalog: Record<ShelterTypeId, ShelterConfig> = {
  basic: {
    id: "basic",
    name: "Basic Shelter",
    health: 200,
    recoveryPerSecond: 25,
    inkRecoveryPerSecond: 35,
    colliderHalfExtents: [0.5, 0.5, 0.05],
    visualScale: [0.5, 0.5, 0.5],
  },
};

export function getShelterConfig(typeId: ShelterTypeId): ShelterConfig {
  return shelterCatalog[typeId];
}
