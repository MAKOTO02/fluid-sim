import type { Component } from "./component";
import type { GameObject } from "./gameObject";
import { vec3 } from "gl-matrix";
import { RigidBody } from "./rigidBody";
import type { MovementInput } from "../input/inputController";
import { clamp01, lerp } from "../math/easing";

export class PlayerController implements Component {
  enabled = true;
  owner?: GameObject;

  private input: MovementInput;
  private thrustForce: number;
  private maxSpeed: number;
  private dragK: number;

  private moveHeldTime = 0;
  private hadInputLastFrame = false;

  constructor(input: MovementInput, thrustForce = 20.0, maxSpeed = 4.0, dragK = 10.0) {
    this.input = input;
    this.thrustForce = thrustForce;
    this.maxSpeed = maxSpeed;
    this.dragK = dragK;
  }

  start(): void {}

  update(dt: number) {
    if (!this.owner || !this.enabled) return;

    const rb = this.owner.getComponent(RigidBody);
    if (!rb) return;

    // Movement direction.
    const dir = vec3.create();
    const moveAxis = this.input.getMoveAxis();
    dir[0] = moveAxis.x;
    dir[1] = moveAxis.y;

    const len = Math.hypot(dir[0], dir[1]);

    if (len > 0) {
      if (this.hadInputLastFrame) {
        this.moveHeldTime += dt;
      } else {
        this.moveHeldTime = 0;
      }
      this.hadInputLastFrame = true;

      // Normalize direction.
      dir[0] /= len;
      dir[1] /= len;

      // Current speed along the input direction.
      const vAlong = rb.velocity[0] * dir[0] + rb.velocity[1] * dir[1];

      // Do not accelerate further if speed is already above the cap.
      if (vAlong < this.maxSpeed) {
        const force = vec3.create();
        const k = this.thrustCurve(this.moveHeldTime);
        vec3.scale(force, dir, this.thrustForce * k);

        rb.addForce(force);
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
    const rise = 0.08;
    const fall = 0.25;

    if (t <= 0) return 0;

    if (t < rise) {
      // Ramp linearly from 0 to 1.
      return t / rise;
    }

    const s = (t - rise) / fall;
    const k = lerp(1.3, 0.7, clamp01(s));
    return Math.max(0.6, k);
  }
}
