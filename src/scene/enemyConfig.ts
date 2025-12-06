// enemyConfig.ts
import { Scene } from "./scene";
import { Transform } from "./transform";
import type { Enemy } from "./enemy";
import { makeStraightPath } from "./projectileLocalPath";
import { vec3 } from "gl-matrix";
import { createProjectileSphereLocal } from "./projectileActor";
import type { IMaterial } from "./material";
import { FluidSim } from "../fluid/fluidSim";
import {
  defaultEnemyStrategy,
  EnemyStrategies,
  enemyStrategyFactories,
  type IEnemyStrategy,
} from "./enemyStrategy";
import { DirectionUtil } from "./directionUtil";

export type FireContext = {
  gl: WebGLRenderingContext | WebGL2RenderingContext;
  scene: Scene;
  canvas: HTMLCanvasElement;
  material: IMaterial;
  fluid: FluidSim;
};

export type EnemyConfig = {
  hitPoint: number;
  getBulletSource: (enemy: Enemy) => Transform;
  fire: (ctx: FireContext, enemy: Enemy) => void;
  createStrategy?: (ctx: FireContext) => IEnemyStrategy;
};

export const enemyConfigs = new Map<number, EnemyConfig>();

const simpleEnemyConfig: EnemyConfig = {
  hitPoint: 10,

  getBulletSource(enemy) {
    const owner = enemy.owner;
    if (!owner) throw new Error("Enemy has no owner");
    return owner.transform;
  },

  fire(ctx, enemy) {
    
    const speed = 3.0;
    const count = 5;
    const spreadDeg = 60;
    const spreadRad = spreadDeg * Math.PI / 180;
    const cfg = enemy.config ?? simpleEnemyConfig;
    const muzzle = cfg.getBulletSource(enemy);
    const baseDir = enemy.target? 
        DirectionUtil.getDirectionToTarget(muzzle, enemy.target):
        vec3.fromValues(0, -1, 0);

    for(let i = 0; i< count; i++){
        const t = count > 1 ? i / (count - 1) : 0.5;
        const offset = t - 0.5;

        // 左端が -spread/2, 右端が +spread/2 になるように
        const angle = offset * spreadRad;
        const dir = vec3.clone(baseDir);
        const x = dir[0];
        const y = dir[1];
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        dir[0] = x * c - y * s;
        dir[1] = x * s + y * c;
        const path = makeStraightPath(dir, speed);

        const bullet = createProjectileSphereLocal(ctx.gl, ctx.scene, {
            radius: 0.05,
            material: ctx.material,
            colliderLayer: "bullet",
            hitLayers: ["player", "wall"],
            localPath: path,
            lifeSec: 10,
            fluid: {
                enabled: true,
                fluidSim: ctx.fluid,
                canvas: ctx.canvas,
            },
        });

        // ★ なるべく enemy.config 経由で参照しておくと汎用性が高い
        

        bullet.transform.setParent(muzzle);
        bullet.transform.setPosition(vec3.fromValues(0, 0, 0));
    }
    
  },

  createStrategy(ctx) {
    const factory = enemyStrategyFactories.get(EnemyStrategies.FixedInterval);

    if (factory) {
      return factory(ctx); // ctx を渡して Strategy 生成
    } else {
      return defaultEnemyStrategy;
    }
  },
};

enemyConfigs.set(0, simpleEnemyConfig);
