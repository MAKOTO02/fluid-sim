import type { EnemyConfig } from "./enemyConfig";
import type { GameObject } from "./gameObject";
import type { Scene } from "./scene";
import { createSphere } from "./primitives";
import { MeshFilter } from "./meshFilter";
import { MeshRenderer } from "./meshRenderer";
import { SphereCollider } from "./collider";
import { createQuadVisualObject } from "./actor";
import { vec3 } from "gl-matrix";

export type EnemyVisualFactory = (
    gl: WebGLRenderingContext | WebGL2RenderingContext,
    scene: Scene,
    go: GameObject,
    cfg: EnemyConfig
) => void;

export const sphereEnemyVisual: EnemyVisualFactory = (gl, scene, go, cfg) => {
  if(!cfg.material) return;
  const mesh = createSphere(cfg.colliderRadius);
  go.addComponent(new MeshFilter(mesh));
  go.addComponent(new MeshRenderer(gl, cfg.material));
  go.addComponent(new SphereCollider(scene, cfg.colliderRadius, "enemy", true));
};

export const texturedQuadEnemyVisual: EnemyVisualFactory = (gl, scene, go, cfg) => {
  if (!cfg.material) return;

  go.addComponent(new SphereCollider(scene, cfg.colliderRadius, "enemy", true));

  const visual = createQuadVisualObject(gl, scene, {
    material: cfg.material,
    size: cfg.visualSize,
    name: `${go.name}Visual`,
    layer: go.layer,
  });
  visual.transform.setParent(go.transform);
  visual.transform.setPosition(vec3.fromValues(0, 0, 0.02));
};
