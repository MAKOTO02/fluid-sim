// projectileActor.ts
import { GameObject } from "./gameObject";
import { MeshFilter } from "./meshFilter";
import { MeshRenderer } from "./meshRenderer";
import type { IMaterial } from "./material";
import type { Scene } from "./scene";
import { createSphere } from "./primitives";
import { SphereCollider, type CollisionLayer } from "./collider";
import { ProjectileUVPath, type UVPathFunc } from "./projectileUVPath";
import { FluidEmitter } from "./fluidEmitter";
import type { FluidSim } from "../fluid/fluidSim";
import { Projectile } from "./projectile";
import { FluidDrag } from "./fluidDrag";
import { RigidBody } from "./rigidBody";
import { type LocalPathFunc, LocalPathMover } from "./projectileLocalPath";
import type { ProjectileDefinition } from "./projectileDefinition";
import { createQuadVisualObject } from "./actor";
import { vec3 } from "gl-matrix";

export function createProjectileSphereUV(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  scene: Scene,
  originUV: { u: number; v: number },
  zPlane: number,
  opts: {
    radius: number;
    material: IMaterial;
    colliderLayer: CollisionLayer;      // Projectile's own layer.
    hitLayers: CollisionLayer[];        // Layers this projectile should hit.
    lifeSec?: number;
    path: UVPathFunc;                   // Path p(t).
    hitScale?: number;                  // Collider radius scale.
    name?: string;
    offsetUV?: { u: number; v: number };
    fluid?: {
      enabled: boolean;
      fluidSim: FluidSim;
      canvas: HTMLCanvasElement;
      strength?: number;
      color?: { r: number; g: number; b: number; a?: number };
      logicSplat?: boolean;
      logicColor?: { r: number; g: number; b: number; a?: number };
    };
  }
): GameObject {
  const {
    radius,
    material,
    colliderLayer,
    hitLayers,
    lifeSec = 5.0,
    path,
    hitScale = 1.0,
    name = "ProjectileSphere",
    offsetUV = { u: 0, v: 0 },
  } = opts;

  const mesh = createSphere(radius);
  const go = new GameObject(name);

  // Visuals.
  go.addComponent(new MeshFilter(mesh));
  go.addComponent(new MeshRenderer(gl, material));

  // Collision.
  const collider = new SphereCollider(
    scene,
    radius * hitScale,
    colliderLayer,
    true
  );
  go.addComponent(collider);

  // Movement path.
  go.addComponent(new ProjectileUVPath(scene, originUV, path, zPlane, offsetUV));

  // Projectile logic: lifetime, bounds, and collision handling.
  go.addComponent(new Projectile(scene, lifeSec, hitLayers));

  if (opts.fluid?.enabled) {
    const {
      fluidSim,
      canvas,
      strength = 1.0,
      color = { r: 1, g: 1, b: 1 },
      logicSplat = false,
      logicColor,
    } = opts.fluid;

    go.addComponent(new FluidEmitter(scene, fluidSim, canvas, strength, color, logicSplat, logicColor ?? null));
    go.addComponent(new RigidBody());
    go.addComponent(new FluidDrag(scene, fluidSim, 0.02));
  }

  scene.addObject(go);
  return go;
}

export function createProjectileSphereLocal(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  scene: Scene,
  opts: {
    radius: number;
    material: IMaterial;
    colliderLayer: CollisionLayer;
    hitLayers: CollisionLayer[];
    lifeSec?: number;
    localPath: LocalPathFunc;
    hitScale?: number;
    name?: string;
    fluid?: {
      enabled: boolean;
      fluidSim: FluidSim;
      canvas: HTMLCanvasElement;
      strength?: number;
      color?: { r: number; g: number; b: number; a?: number };
      logicSplat?: boolean;
      logicColor?: { r: number; g: number; b: number; a?: number };
    };
  }
): GameObject {
  const {
    radius,
    material,
    colliderLayer,
    hitLayers,
    lifeSec = 5.0,
    localPath,
    hitScale = 1.0,
    name = "ProjectileSphere",
  } = opts;

  const mesh = createSphere(radius);
  const go = new GameObject(name);

  // Visuals.
  go.addComponent(new MeshFilter(mesh));
  go.addComponent(new MeshRenderer(gl, material));

  // Collider.
  const collider = new SphereCollider(
    scene,
    radius * hitScale,
    colliderLayer,
    true
  );
  go.addComponent(collider);

  // Movement path.
  go.addComponent(new LocalPathMover(localPath));

  // Projectile logic.
  go.addComponent(new Projectile(scene, lifeSec, hitLayers));

  if (opts.fluid?.enabled) {
    const {
      fluidSim,
      canvas,
      strength = 10.0,
      color = { r: 0.5, g: 0.1, b: 0.1 },
      logicSplat = false,
      logicColor,
    } = opts.fluid;

    go.addComponent(new FluidEmitter(scene, fluidSim, canvas, strength, color, logicSplat, logicColor ?? null));
    go.addComponent(new RigidBody());
    go.addComponent(new FluidDrag(scene, fluidSim, 0.015));
  }

  scene.addObject(go);
  return go;
}

export function createProjectileFromDefinitionLocal(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  scene: Scene,
  opts: {
    definition: ProjectileDefinition;
    material: IMaterial;
    localPath: LocalPathFunc;
    fluidSim?: FluidSim;
    canvas?: HTMLCanvasElement;
  }
): GameObject {
  const { definition, material, localPath, fluidSim, canvas } = opts;

  const go = new GameObject(definition.name);
  let visualObject: GameObject | null = null;

  if (definition.visual === "sphere") {
    go.addComponent(new MeshFilter(createSphere(definition.radius)));
    go.addComponent(new MeshRenderer(gl, material));
  } else {
    visualObject = createQuadVisualObject(gl, scene, {
      material,
      size: definition.visualSize ?? definition.radius * 2,
      name: `${definition.name}Visual`,
    });
    visualObject.transform.setParent(go.transform);
    visualObject.transform.setPosition(vec3.fromValues(0, 0, 0.02));
  }

  go.addComponent(new SphereCollider(
    scene,
    definition.radius,
    definition.colliderLayer,
    true
  ));
  go.addComponent(new LocalPathMover(localPath));
  const projectile = go.addComponent(new Projectile(scene, definition.lifeSec, definition.hitLayers));
  projectile.onDestroyed = () => {
    visualObject?.destroy();
  };

  if (definition.fluid && fluidSim && canvas) {
    go.addComponent(new FluidEmitter(
      scene,
      fluidSim,
      canvas,
      definition.fluid.strength,
      definition.fluid.color,
      definition.fluid.logicSplat ?? false,
      definition.fluid.logicColor ?? null
    ));
    go.addComponent(new RigidBody());
    go.addComponent(new FluidDrag(scene, fluidSim, definition.fluid.dragStrength ?? 0.015));
  }

  scene.addObject(go);
  return go;
}
