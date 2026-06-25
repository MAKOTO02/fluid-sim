import { vec3 } from "gl-matrix";
import type { FluidSim } from "../fluid/fluidSim";
import { Enemy } from "./enemy";
import { Health } from "./health";
import type { IMaterial } from "./material";
import { GameObject } from "./gameObject";
import { LocalPathMover } from "./projectileLocalPath";
import type { Scene } from "./scene";
import type { Transform } from "./transform";
import { setupEnemyStrategyFactories } from "./enemyStrategy";
import type { InkZoneRegistry } from "./inkZoneRegistry";

export function createDemoEnemy(args: {
  scene: Scene;
  gl: WebGLRenderingContext | WebGL2RenderingContext;
  canvas: HTMLCanvasElement;
  material: IMaterial;
  fluidSim: FluidSim;
  target: Transform;
  inkZoneRegistry?: InkZoneRegistry;
}): GameObject {
  const { scene, gl, canvas, material, fluidSim, target, inkZoneRegistry } = args;

  const enemyCenter = new GameObject();
  enemyCenter.transform.translate(vec3.fromValues(1, 1, 0));
  scene.addObject(enemyCenter);

  const enemy = new GameObject("Enemy");
  enemy.transform.setParent(enemyCenter.transform);
  enemy.addComponent(new LocalPathMover((t) => {
    return { x: Math.cos(t), y: Math.sin(t), z: 0 };
  }));

  const ctx = {
    gl,
    scene,
    canvas,
    material,
    fluid: fluidSim,
  };
  setupEnemyStrategyFactories(ctx);

  const enemyComp = new Enemy(0, ctx, undefined, inkZoneRegistry);
  enemyComp.setTarget(target);
  enemy.addComponent(new Health(enemyComp.config.hitPoint));
  enemy.addComponent(enemyComp);
  enemyComp.createVisual(gl, scene);
  scene.addObject(enemy);

  return enemy;
}
