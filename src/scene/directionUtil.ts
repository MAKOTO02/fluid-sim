// src/math/directionUtil.ts
import { vec3 } from "gl-matrix";
import type { Transform } from "./transform";

export const DirectionUtil = {

  getDirectionToTarget(muzzle: Transform, target: Transform): vec3 {
    const from = muzzle.getWorldPosition();
    const to   = target.getWorldPosition();
    const dir  = vec3.sub(vec3.create(), to, from);
    return vec3.normalize(dir, dir);
  },

  getDistance(muzzle: Transform, target: Transform): number {
    const p1 = muzzle.getWorldPosition();
    const p2 = target.getWorldPosition();
    return vec3.distance(p1, p2);
  },

  getClampedDirection(
    muzzle: Transform,
    target: Transform,
    maxAngleDeg: number
  ): vec3 {
    const forward = muzzle.getForward();
    const dir = this.getDirectionToTarget(muzzle, target);

    const angle = Math.acos(vec3.dot(forward, dir));
    const limit = maxAngleDeg * Math.PI / 180;

    if (angle <= limit) return dir;

    const t = limit / angle;
    const clamped = vec3.lerp(vec3.create(), forward, dir, t);
    return vec3.normalize(clamped, clamped);
  },

  getLookAtAngleZ(from: Transform, to: Transform): number {
    const p = from.getWorldPosition();
    const t = to.getWorldPosition();
    const dx = t[0] - p[0];
    const dy = t[1] - p[1];
    // XY 平面での向き → 角度
    return Math.atan2(dy, dx); // ラジアン
  }
};
