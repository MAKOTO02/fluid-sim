import type { EnemyConfig } from "./enemyConfig";
import type { GameObject } from "./gameObject";
import type { Scene } from "./scene";
import { createSphere } from "./primitives";
import { MeshFilter } from "./meshFilter";
import { MeshRenderer } from "./meshRenderer";
import { SphereCollider } from "./collider";

export type EnemyVisualFactory = (
    gl: WebGLRenderingContext | WebGL2RenderingContext,
    scene: Scene,
    go: GameObject,
    cfg: EnemyConfig
) => void;

export const sphereEnemyVisual: EnemyVisualFactory = (gl, scene, go, cfg) => {
  if(!cfg.material) return;
  const mesh = createSphere(0.07);
  go.addComponent(new MeshFilter(mesh));
  go.addComponent(new MeshRenderer(gl, cfg.material)); // ★ Config の material を使う
  go.addComponent(new SphereCollider(scene, 0.07, "enemy", true));
};
