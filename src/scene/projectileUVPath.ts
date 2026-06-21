import type { GameObject } from "./gameObject";
import type { Component } from "./component";
import type { Scene } from "./scene";
import { vec3 } from "gl-matrix";

// Function from time to relative UV offset (du, dv).
export type UVPathFunc = (t: number) => { u: number; v: number };

export class ProjectileUVPath implements Component {
  enabled = true;
  owner?: GameObject;

  private scene: Scene;
  private originUV: { u: number; v: number };   // Base UV at spawn.
  private offsetUV: { u: number; v: number };   // Spawn-time offset.
  private path: UVPathFunc;                     // Relative path (du, dv).
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

    // Get the relative path offset.
    const rel = this.path(this.time);

    // Final UV = origin + offset + relative.
    const u = this.originUV.u + this.offsetUV.u + rel.u;
    const v = this.originUV.v + this.offsetUV.v + rel.v;

    const currWorld = cam.screenUVToWorldOnPlane(u, v, this.zPlane);
    if (!currWorld) return;

    if (this.prevWorld == null) {
      // First update snaps to the computed path position.
      this.owner.transform.setPosition(currWorld);
      this.prevWorld = vec3.clone(currWorld);
      return;
    }

    // Delta movement along the path since the previous frame.
    const delta = vec3.create();
    vec3.sub(delta, currWorld, this.prevWorld);

    // Apply as relative movement so it can coexist with FluidDrag.
    this.owner.transform.translate(delta);

    vec3.copy(this.prevWorld, currWorld);
  }

  onAttach?(): void {}
  onDetach?(): void {}
}

// Simple downward UV path helper.
export const straightUpPath: UVPathFunc = (t: number) => {
  const speed = -0.4;
  return { u: 0, v: speed * t };
};

// Rotate the (u, v) offset produced by basePath.
export function rotateUVPath(
  basePath: UVPathFunc,
  angleRad: number | ((t: number) => number)
): UVPathFunc {
  return (t: number) => {
    const p = basePath(t);
    const u = p.u;
    const v = p.v;

    const theta = typeof angleRad === "function" ? angleRad(t) : angleRad;
    const c = Math.cos(theta);
    const s = Math.sin(theta);

    // 2D rotation around the origin.
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
