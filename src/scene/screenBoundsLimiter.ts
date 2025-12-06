// ScreenBoundsLimiter.ts
import type { Component } from "./component";
import type { GameObject } from "./gameObject";
import type { Scene } from "./scene";
import { RigidBody } from "./rigidBody";
import { vec3 } from "gl-matrix";

export class ScreenBoundsLimiter implements Component {
  enabled = true;
  owner?: GameObject;

  private scene: Scene;
  private padding: number

  constructor(
    scene: Scene,
    padding = 0.05  // 画面端から何割内側まで許すか
  ) {
    this.scene = scene;
    this.padding = padding;
  }

  start(): void {}

  update(dt: number): void {
    if (!this.enabled || !this.owner) return;
    const cam = this.scene.MainCamera;
    if (!cam) return;

    const pos = this.owner.transform.getWorldPosition();
    const uv = cam.worldToScreenUV(pos);
    let { u, v } = uv;

    let clamped = false;

    if (u < this.padding) { u = this.padding; clamped = true; }
    if (u > 1 - this.padding) { u = 1 - this.padding; clamped = true; }
    if (v < this.padding) { v = this.padding; clamped = true; }
    if (v > 1 - this.padding) { v = 1 - this.padding; clamped = true; }

    if (!clamped) return;

    // UV を clamp した位置にワープさせる
    const newWorld = cam.screenUVToWorldOnPlane(u, v, pos[2]);
    if (!newWorld) return;

    this.owner.transform.setPosition(newWorld);

    // 外向きの速度も 0 にしておくと端に張り付かない
    const rb = this.owner.getComponent(RigidBody);
    if (rb) {
      if (u === this.padding && rb.velocity[0] < 0) rb.velocity[0] = 0;
      if (u === 1 - this.padding && rb.velocity[0] > 0) rb.velocity[0] = 0;
      if (v === this.padding && rb.velocity[1] < 0) rb.velocity[1] = 0;
      if (v === 1 - this.padding && rb.velocity[1] > 0) rb.velocity[1] = 0;
    }
  }

  onAttach?(): void {}
  onDetach?(): void {}
}
