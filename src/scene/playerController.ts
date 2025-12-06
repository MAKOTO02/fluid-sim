import type { Component } from "./component";
import type { GameObject } from "./gameObject";
import { vec3 } from "gl-matrix";
import { RigidBody } from "./rigidBody";

export class PlayerController implements Component {
  enabled = true;
  owner?: GameObject;

  private input = { left: false, right: false, up: false, down: false };

  private thrustForce: number;
  private maxSpeed: number;
  private dragK: number;

  private moveHeldTime = 0;
  private hadInputLastFrame = false;

  constructor(thrustForce = 20.0, maxSpeed = 4.0, dragK = 10.0) {
    this.thrustForce = thrustForce;
    this.maxSpeed = maxSpeed;
    this.dragK = dragK;

    window.addEventListener("keydown", (e) => this.onKey(e, true));
    window.addEventListener("keyup",   (e) => this.onKey(e, false));
  }

  private onKey(e: KeyboardEvent, state: boolean) {
    switch (e.key) {
      case "a":
      case "ArrowLeft":  this.input.left  = state; break;
      case "d":
      case "ArrowRight": this.input.right = state; break;
      case "w":
      case "ArrowUp":    this.input.up    = state; break;
      case "s":
      case "ArrowDown":  this.input.down  = state; break;
    }
  }

  start(): void {}

  update(dt: number) {
    if (!this.owner || !this.enabled) return;

    const rb = this.owner.getComponent(RigidBody);
    if (!rb) return;

    // 方向ベクトル
    const dir = vec3.create();
    if (this.input.left)  dir[0] -= 1;
    if (this.input.right) dir[0] += 1;
    if (this.input.down)  dir[1] -= 1;
    if (this.input.up)    dir[1] += 1;

    const len = Math.hypot(dir[0], dir[1]);

    if (len > 0) {
      if (this.hadInputLastFrame) {
        this.moveHeldTime += dt;
      } else {
        this.moveHeldTime = 0;
      }
      this.hadInputLastFrame = true;

      // 正規化
      dir[0] /= len;
      dir[1] /= len;

      // いまのスピード
      const vAlong = rb.velocity[0] * dir[0] + rb.velocity[1] * dir[1];

      // 既に上限以上なら、これ以上は押しても加速しない
      if (vAlong < this.maxSpeed) {
        const force = vec3.create();
        const k = this.thrustCurve(this.moveHeldTime);
        vec3.scale(force, dir, this.thrustForce * k); // 大きさ一定の力

        rb.addForce(force); // あとは RigidBody & FluidDrag に任せる
      }
    } else {
      this.hadInputLastFrame = false;
      this.moveHeldTime = 0;
      const force = vec3.create();
      vec3.scale(force, rb.velocity, -this.dragK);
      rb.addForce(force);
    }
  }

  onAttach?(): void {}
  onDetach?(): void {}

  private thrustCurve(t: number): number {
    const rise = 0.08;   // 立ち上がり時間
    const fall = 0.25;   // 落ち着くまでの時間

    if (t <= 0) return 0;

    if (t < rise) {
        // 0 → 1 へ線形に増える
        return t / rise;
    }

    const s = (t - rise) / fall; // 0 〜
    // 1.3 → 1.0 → 0.7 くらいまでゆるやかに減衰
    const k = 1.3 - 0.6 * Math.min(s, 1.0);
    return Math.max(0.6, k); // 下限 0.6（完全にはゼロにしない）
  }
}
