import type { CollisionLayer } from "./collider";

export type ProjectileTypeId = "enemy-small" | "enemy-hazard";
export type ProjectileMaterialKey = "enemyBullet" | "hazardBullet";

export type ProjectileFluidDefinition = {
  strength: number;
  color: { r: number; g: number; b: number; a?: number };
  dragStrength?: number;
  logicSplat?: boolean;
  logicColor?: { r: number; g: number; b: number; a?: number };
};

export type ProjectileDefinition = {
  id: ProjectileTypeId;
  name: string;
  visual: "sphere" | "texture";
  materialKey: ProjectileMaterialKey;
  radius: number;
  visualSize?: number;
  speed: number;
  lifeSec: number;
  damage: number;
  colliderLayer: CollisionLayer;
  hitLayers: CollisionLayer[];
  fluid?: ProjectileFluidDefinition;
};

export const projectileDefinitions: Record<ProjectileTypeId, ProjectileDefinition> = {
  "enemy-small": {
    id: "enemy-small",
    name: "EnemySmallBullet",
    visual: "sphere",
    materialKey: "enemyBullet",
    radius: 0.05,
    speed: 3.0,
    lifeSec: 10,
    damage: 10,
    colliderLayer: "enemyBullet",
    hitLayers: ["player", "wall"],
  },
  "enemy-hazard": {
    id: "enemy-hazard",
    name: "EnemyHazardBullet",
    visual: "texture",
    materialKey: "hazardBullet",
    radius: 0.075,
    visualSize: 0.22,
    speed: 1.8,
    lifeSec: 8,
    damage: 6,
    colliderLayer: "enemyHazardBullet",
    hitLayers: ["player"],
    fluid: {
      strength: 1100,
      dragStrength: 0.003,
      color: { r: 0.9, g: 0.04, b: 0.02, a: 0.9 },
      logicSplat: true,
      logicColor: { r: 1, g: 0, b: 0, a: 1 },
    },
  },
};

export const projectileDefinitionList: readonly ProjectileDefinition[] =
  Object.values(projectileDefinitions);

export function getProjectileDefinition(id: ProjectileTypeId): ProjectileDefinition {
  return projectileDefinitions[id];
}
