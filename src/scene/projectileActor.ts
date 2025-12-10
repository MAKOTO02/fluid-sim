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

export function createProjectileSphereUV(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  scene: Scene,
  originUV: {u: number, v: number},
  zPlane: number,
  opts: {
    radius: number;
    material: IMaterial;
    colliderLayer: CollisionLayer;      // この弾自身のレイヤー（enemyBullet など）
    hitLayers: CollisionLayer[];        // 当たりたい相手のレイヤー（player など）
    lifeSec?: number;
    path: UVPathFunc;                // 軌道 p(t)
    hitScale?: number;                  // 判定半径のスケール
    name?: string;
    offsetUV?: {u: number, v: number};
    fluid?: {
      enabled: boolean;
      fluidSim: FluidSim;
      canvas: HTMLCanvasElement;
      strength?: number;
      color?: { r: number; g: number; b: number };
    }
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
    offsetUV = {u: 0, v: 0},
  } = opts;

  const mesh = createSphere(radius);
  const go = new GameObject(name);

  // 見た目
  go.addComponent(new MeshFilter(mesh));
  go.addComponent(new MeshRenderer(gl, material));

  // 当たり判定
  const collider = new SphereCollider(
    scene,
    radius * hitScale,
    colliderLayer,
    true  // isTrigger
  );
  go.addComponent(collider);

  // 軌道
  go.addComponent(new ProjectileUVPath(scene, originUV, path, zPlane, offsetUV));

  // Projectile ロジック（寿命・画面外・衝突処理）[未実装]
  go.addComponent(new Projectile(scene, lifeSec, hitLayers));

  if (opts.fluid?.enabled) {
    const { fluidSim, canvas, strength = 1.0,
            color = { r: 1, g: 1, b: 1 } } = opts.fluid;
    go.addComponent(
      new FluidEmitter(scene, fluidSim, canvas, strength, color)
    );
    go.addComponent(new RigidBody())
    go.addComponent(
        new FluidDrag(scene, fluidSim, 0.02)
    );
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
      color?: { r: number; g: number; b: number };
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

  // 見た目
  go.addComponent(new MeshFilter(mesh));
  go.addComponent(new MeshRenderer(gl, material));

  // コライダー
  const collider = new SphereCollider(
    scene,
    radius * hitScale,
    colliderLayer,
    true
  );
  go.addComponent(collider);

  // ★ 軌道は LocalPath を使う
  go.addComponent(new LocalPathMover(localPath));

  // Projectile ロジック
  go.addComponent(new Projectile(scene, lifeSec, hitLayers));

  if (opts.fluid?.enabled) {
    const {
      fluidSim,
      canvas,
      strength = 10.0,
      color = { r: 0.5, g: 0.1, b: 0.1 },
    } = opts.fluid;

    go.addComponent(new FluidEmitter(scene, fluidSim, canvas, strength, color));
    go.addComponent(new RigidBody());
    go.addComponent(new FluidDrag(scene, fluidSim, 0.015));
  }

  scene.addObject(go);
  return go;
}
