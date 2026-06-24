// This can live in a separate actors.ts-style file.
import { GameObject } from "./gameObject";
import { MeshRenderer } from "./meshRenderer";
import { SphereCollider } from "./collider";
import { createQuad, createSphere } from "./primitives";
import type { Scene } from "./scene";
import type { IMaterial } from "./material";
import type { CollisionLayer } from "./collider";
import { MeshFilter } from "./meshFilter";

export function createSphereActor(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  scene: Scene,
  opts: {
    radius: number;
    material: IMaterial;
    layer: CollisionLayer;
    hitScale?: number;
    name?: string;
    isTrigger?: boolean;
  }
): GameObject {
  const {
    radius,
    material,
    layer,
    hitScale = 1.0,
    name = "Sphere",
    isTrigger = true,
  } = opts;

  const mesh = createSphere(radius);

  const go = new GameObject(name);
  go.addComponent(new MeshFilter(mesh));
  go.addComponent(new MeshRenderer(gl, material));

  go.addComponent(new SphereCollider(
    scene,
    radius * hitScale,
    layer,
    isTrigger
  ));

  scene.addObject(go);
  return go;
}

export function createQuadVisualObject(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  scene: Scene,
  opts: {
    material: IMaterial;
    size?: number;
    name?: string;
    layer?: number;
  }
): GameObject {
  const {
    material,
    size = 1,
    name = "QuadVisual",
    layer = 1 << 0,
  } = opts;

  const go = new GameObject(name);
  go.layer = layer;
  go.addComponent(new MeshFilter(createQuad(size)));
  go.addComponent(new MeshRenderer(gl, material));

  scene.addObject(go);
  return go;
}
