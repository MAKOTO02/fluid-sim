// enemyConfig.ts
import { Scene } from "./scene";
import { Transform } from "./transform";
import type { Enemy } from "./enemy";
import { makeStraightPath } from "./projectileLocalPath";
import { vec3 } from "gl-matrix";
import { createProjectileFromDefinitionLocal } from "./projectileActor";
import { Health } from "./health";
import type { IMaterial } from "./material";
import { Shelter } from "./shelter";
import { Projectile } from "./projectile";
import { FluidSim } from "../fluid/fluidSim";
import {
  defaultEnemyStrategy,
  EnemyStrategies,
  enemyStrategyFactories,
  type IEnemyStrategy,
} from "./enemyStrategy";
import { DirectionUtil } from "./directionUtil";
import { texturedQuadEnemyVisual, type EnemyVisualFactory } from "./enemyVisual";
import type { RenderAssets } from "./renderAssets";
import {
  getProjectileDefinition,
  type ProjectileMaterialKey,
  type ProjectileDefinition,
} from "./projectileDefinition";

export type FireContext = {
  gl: WebGLRenderingContext | WebGL2RenderingContext;
  scene: Scene;
  canvas: HTMLCanvasElement;
  material: IMaterial;
  projectileMaterials: Record<ProjectileMaterialKey, IMaterial>;
  fluid: FluidSim;
};

export type EnemyTypeId = "simple";

export type EnemyAttackConfig = {
  intervalSec: number;
  fire: (ctx: FireContext, enemy: Enemy) => void;
};

export type EnemyConfig = {
  id: EnemyTypeId,
  hitPoint: number;
  contactDamagePerSecond: number;
  inkDamagePerSecond: number;
  material?: IMaterial;
  visualSize: number;
  colliderRadius: number;
  visual: EnemyVisualFactory;
  getBulletSource: (enemy: Enemy) => Transform;
  attacks: EnemyAttackConfig[];
  createStrategy?: (ctx: FireContext) => IEnemyStrategy;
};

export const enemyCatalog = new Map<EnemyTypeId, EnemyConfig>();

const simpleEnemyConfig: EnemyConfig = {
  id: "simple",
  hitPoint: 10,
  contactDamagePerSecond: 12,
  inkDamagePerSecond: 2,
  visual: texturedQuadEnemyVisual,
  visualSize: 0.28,
  colliderRadius: 0.07,

  getBulletSource(enemy) {
    const owner = enemy.owner;
    if (!owner) throw new Error("Enemy has no owner");
    return owner.transform;
  },

  attacks: [
    {
      intervalSec: 0.5,
      fire: fireFiveWayShot,
    },
    {
      intervalSec: 3.2,
      fire: fireHazardShot,
    },
  ],

  createStrategy(ctx) {
    const factory = enemyStrategyFactories.get(EnemyStrategies.FixedInterval);

    if (factory) {
      return factory(ctx);
    } else {
      return defaultEnemyStrategy;
    }
  },
};

function fireFiveWayShot(ctx: FireContext, enemy: Enemy): void {
  const projectileDefinition = getProjectileDefinition("enemy-small");
  const count = 5;
  const spreadDeg = 60;
  const spreadRad = spreadDeg * Math.PI / 180;
  const cfg = enemy.config ?? simpleEnemyConfig;
  const muzzle = cfg.getBulletSource(enemy);
  const baseDir = getEnemyAimDirection(enemy, muzzle);

  for (let i = 0; i < count; i += 1) {
    const t = count > 1 ? i / (count - 1) : 0.5;
    const offset = t - 0.5;

    const angle = offset * spreadRad;
    const dir = rotate2D(baseDir, angle);
    const path = makeStraightPath(dir, projectileDefinition.speed);

    const bullet = createProjectileFromDefinition(ctx, projectileDefinition, path);
    setupEnemyBulletHit(bullet, projectileDefinition.damage);
    setProjectileWorldSpawnPosition(bullet, muzzle);
  }
}

function fireHazardShot(ctx: FireContext, enemy: Enemy): void {
  const projectileDefinition = getProjectileDefinition("enemy-hazard");
  const cfg = enemy.config ?? simpleEnemyConfig;
  const muzzle = cfg.getBulletSource(enemy);
  const dir = getEnemyAimDirection(enemy, muzzle);
  const path = makeStraightPath(dir, projectileDefinition.speed);

  const bullet = createProjectileFromDefinition(ctx, projectileDefinition, path);
  setupEnemyBulletHit(bullet, projectileDefinition.damage);
  setProjectileWorldSpawnPosition(bullet, muzzle);
}

function createProjectileFromDefinition(
  ctx: FireContext,
  definition: ProjectileDefinition,
  localPath: ReturnType<typeof makeStraightPath>
) {
  return createProjectileFromDefinitionLocal(ctx.gl, ctx.scene, {
      definition,
      material: ctx.projectileMaterials[definition.materialKey],
      localPath,
      fluidSim: ctx.fluid,
      canvas: ctx.canvas,
    });
}

function getEnemyAimDirection(enemy: Enemy, muzzle: Transform): vec3 {
  return enemy.target
    ? DirectionUtil.getDirectionToTarget(muzzle, enemy.target)
    : vec3.fromValues(0, -1, 0);
}

function rotate2D(dir: vec3, angle: number): vec3 {
  const result = vec3.clone(dir);
  const x = result[0];
  const y = result[1];
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  result[0] = x * c - y * s;
  result[1] = x * s + y * c;
  return result;
}

function setProjectileWorldSpawnPosition(
  bullet: ReturnType<typeof createProjectileFromDefinitionLocal>,
  muzzle: Transform
): void {
  bullet.transform.setParent(null);
  bullet.transform.setPosition(muzzle.getWorldPosition());
}

function setupEnemyBulletHit(
  bullet: ReturnType<typeof createProjectileFromDefinitionLocal>,
  damage: number
): void {
  const projectile = bullet.getComponent(Projectile);
  if (!projectile) return;

  projectile.onHitCallback = (_self, other) => {
    const shelter = other.getComponent(Shelter);
    if (shelter && !shelter.isPlayerInside()) return;

    const health = other.getComponent(Health);
    health?.applyDamage(damage);

    if (shelter && health?.isDead()) {
      shelter.destroy();
    }
  };
}

export function getEnemyConfig(typeId: EnemyTypeId): EnemyConfig {
  const config = enemyCatalog.get(typeId);
  if (!config) {
    throw new Error(`EnemyConfig not found for typeId=${typeId}`);
  }
  return config;
}

export function setupEnemyCatalog(renderAssets: RenderAssets) {
  const cfg = { ...simpleEnemyConfig, material: renderAssets.enemyVisualMaterial };
  enemyCatalog.set(cfg.id, cfg);
}

