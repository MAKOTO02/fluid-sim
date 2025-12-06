import type { Component } from "./component";
import type { GameObject } from "./gameObject";
import { vec3 } from "gl-matrix";

export type LocalPathFunc = (t: number) => { x: number; y: number; z: number };

export class LocalPathMover implements Component {
  enabled = true;
  owner?: GameObject;

  private path: LocalPathFunc;
  private time = 0;
  private originLocal = vec3.create();
  private prevLocalOnPath = vec3.create();
  private _curr = vec3.create();
  private _delta = vec3.create();

  constructor(path: LocalPathFunc) {
    this.path = path;
  }

  start(): void {
    if (!this.owner) return;

    this.time = 0;
    // local position をそのまま起点に
    vec3.copy(this.originLocal, this.owner.transform.position);
    vec3.copy(this.prevLocalOnPath, this.originLocal);
  }

  update(dt: number): void {
    if (!this.enabled || !this.owner) return;

    this.time += dt;

    const o = this.path(this.time);
    vec3.set(this._curr,
      this.originLocal[0] + o.x,
      this.originLocal[1] + o.y,
      this.originLocal[2] + o.z
    );

    vec3.sub(this._delta, this._curr, this.prevLocalOnPath);

    // local Δ として適用
    this.owner.transform.translate(this._delta);

    vec3.copy(this.prevLocalOnPath, this._curr);
  }

  onAttach?(): void {}
  onDetach?(): void {}
}

export function makeStraightPath(dir: vec3, speed: number): LocalPathFunc {
  const d = vec3.normalize(vec3.create(), dir);
  return (t: number) => ({
    x: d[0] * speed * t,
    y: d[1] * speed * t,
    z: d[2] * speed * t,
  });
}

// projectileLocalPath.ts あたりに追加

export function rotateLocalPath2D(
  base: LocalPathFunc,
  angleRad: number | ((t: number) => number)
): LocalPathFunc {
  return (t: number) => {
    const p = base(t); // 元の (x, y, z)
    const theta = typeof angleRad === "function" ? angleRad(t) : angleRad;
    const c = Math.cos(theta);
    const s = Math.sin(theta);

    const x = p.x;
    const y = p.y;

    const rx = c * x - s * y;
    const ry = s * x + c * y;

    return { x: rx, y: ry, z: p.z };
  };
}


