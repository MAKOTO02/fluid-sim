import type { GameObject } from "./gameObject";
import type { Component } from "./component";
import type { Scene } from "./scene";
import { vec3 } from "gl-matrix";

// t -> 相対UV(du, dv) を返す関数
export type UVPathFunc = (t: number) => { u: number; v: number };

export class ProjectileUVPath implements Component {
  enabled = true;
  owner?: GameObject;

  private scene: Scene;
  private originUV: { u: number; v: number };   // 基準UV（発射位置）
  private offsetUV: { u: number; v: number };   // 発射時オフセット
  private path: UVPathFunc;                     // 相対軌道（du,dv）
  private time = 0;
  private zPlane: number;

  private prevWorld: vec3 | null = null;

  constructor(
    scene: Scene,
    originUV: { u: number; v: number },
    path: UVPathFunc,
    zPlane = 0,
    offsetUV: { u: number; v: number } = { u: 0, v: 0 },
  ) {
    this.scene = scene;
    this.originUV = originUV;
    this.offsetUV = offsetUV;
    this.path = path;
    this.zPlane = zPlane;
  }

  start(): void {
    this.time = 0;
    this.prevWorld = null;
    const cam = this.scene.MainCamera;
    if (!cam) return;
    const startWorld = cam.screenUVToWorldOnPlane(
        this.originUV.u + this.offsetUV.u, 
        this.originUV.v + this.offsetUV.v, 
        this.zPlane
    );
    if(!this.owner || !startWorld) return;
    this.owner.transform.setPosition(startWorld);
  }

  update(dt: number): void {
    if (!this.enabled || !this.owner) return;

    const cam = this.scene.MainCamera;
    if (!cam) return;

    this.time += dt;

    // 相対軌道 (du, dv) を取得
    const rel = this.path(this.time); // { u: du, v: dv }

    // 最終的なUV = origin + offset + relative
    const u = this.originUV.u + this.offsetUV.u + rel.u;
    const v = this.originUV.v + this.offsetUV.v + rel.v;

    const currWorld = cam.screenUVToWorldOnPlane(u, v, this.zPlane);
    if (!currWorld) return;

    if (this.prevWorld == null) {
      // 初回：スナップしたいならここで合わせる
      this.owner.transform.setPosition(currWorld);
      this.prevWorld = vec3.clone(currWorld);
      return;
    }

    // パス上での「前フレームからの移動量」
    const delta = vec3.create();
    vec3.sub(delta, currWorld, this.prevWorld);

    // 相対移動として適用 → FluidDrag などとも足し算で共存できる
    this.owner.transform.translate(delta);

    vec3.copy(this.prevWorld, currWorld);
  }

  onAttach?(): void {}
  onDetach?(): void {}
}

// projectileUVPath.ts 側か、別ファイルでもOK
export const straightUpPath: UVPathFunc = (t: number) => {
  const speed = -0.4; // vの符号は実際のUVの向きに合わせて調整
  return { u: 0, v: speed * t }; // uはそのまま、vだけ時間で変化
};

// basePath が作る (u, v) を angleRad だけ回転させる
export function rotateUVPath(
  basePath: UVPathFunc,
  angleRad: number | ((t: number) => number)
): UVPathFunc {
  return (t: number) => {
    const p = basePath(t); // 元の相対UV
    const u = p.u;
    const v = p.v;

    const theta = typeof angleRad === "function" ? angleRad(t) : angleRad;
    const c = Math.cos(theta);
    const s = Math.sin(theta);

    // 原点(0,0)まわりの2D回転
    const ru = c * u - s * v;
    const rv = s * u + c * v;

    return { u: ru, v: rv };
  };
}

export function makeStraightPath(dirU: number, dirV: number, speed: number): UVPathFunc {
  return (t: number) => ({
    u: dirU * speed * t,
    v: dirV * speed * t,
  });
}
