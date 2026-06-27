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
import type { EnemyTypeId } from "./enemyConfig";
import type { ProjectileMaterialKey } from "./projectileDefinition";

export function createDemoEnemy(args: {
  scene: Scene;
  gl: WebGLRenderingContext | WebGL2RenderingContext;
  canvas: HTMLCanvasElement;
  material: IMaterial;
  projectileMaterials: Record<ProjectileMaterialKey, IMaterial>;
  fluidSim: FluidSim;
  target: Transform;
  inkZoneRegistry?: InkZoneRegistry;
  typeId?: EnemyTypeId;
  name?: string;
  centerPosition?: [number, number, number];
}): GameObject {
  const {
    scene,
    gl,
    canvas,
    material,
    projectileMaterials,
    fluidSim,
    target,
    inkZoneRegistry,
    typeId = "simple",
    name = "Enemy",
    centerPosition = [1, 1, 0],
  } = args;

  const enemyCenter = new GameObject();
  enemyCenter.transform.translate(vec3.fromValues(...centerPosition));
  scene.addObject(enemyCenter);

  const enemy = new GameObject(name);
  enemy.transform.setParent(enemyCenter.transform);
  enemy.addComponent(new LocalPathMover((t) => {
    return { x: Math.cos(t), y: Math.sin(t), z: 0 };
  }));

  const ctx = {
    gl,
    scene,
    canvas,
    material,
    projectileMaterials,
    fluid: fluidSim,
  };
  setupEnemyStrategyFactories(ctx);

  const enemyComp = new Enemy(typeId, ctx, name, inkZoneRegistry);
  enemyComp.setTarget(target);
  enemy.addComponent(new Health(enemyComp.config.hitPoint));
  enemy.addComponent(enemyComp);
  enemyComp.createVisual(gl, scene);
  scene.addObject(enemy);

  return enemy;
}
