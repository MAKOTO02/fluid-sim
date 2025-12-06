// scene/rigidBody.ts
import { vec3 } from "gl-matrix";
import type { Transform } from "./transform";
import type { Component } from "./component";
import type { GameObject } from "./gameObject";

export type ForceMode = "force" | "impulse";

export class RigidBody implements Component {
  enabled = true;
  owner?: GameObject;

  readonly transform: Transform;

  velocity: vec3 = vec3.create();
  acceleration: vec3 = vec3.create();
  private forceAccum: vec3 = vec3.create();

  mass: number;
  dragK: number;

  freezePosX = false;
  freezePosY = false;
  freezePosZ = false;

  // 使い回し用の一時ベクトル（GC削減）
  private _tmpV = vec3.create();
  private _tmpA = vec3.create();
  private _tmpPos = vec3.create();

  constructor(mass = 1.0, dragK = 2.0) {
    this.mass = mass;
    this.dragK = dragK;
    // transform は onAttach で owner から取る
    this.transform = undefined as any;
  }

  onAttach?(): void {
    if (!this.owner) {
      console.warn("RigidBody: owner がありません");
      return;
    }
    (this as any).transform = this.owner.transform;
  }

  start(): void {
    // 特になし
  }

  update(dt: number): void {
    this.integrate(dt);
  }

  onDetach?(): void {
    // 特にリソース解放は不要
  }

  addForce(f: vec3, mode: ForceMode = "force") {
    if (mode === "impulse") {
      // v += F/m
      vec3.scale(this._tmpV, f, 1 / this.mass);
      vec3.add(this.velocity, this.velocity, this._tmpV);
    } else {
      vec3.add(this.forceAccum, this.forceAccum, f);
    }
  }

  integrate(dt: number) {
    if (dt <= 0 || !this.transform) return;

    const pos = this.transform.position;
    vec3.copy(this._tmpPos, pos);
    this.applyFreezeToForce();

    const vOld = vec3.copy(this._tmpV, this.velocity);

    if (this.dragK > 0) {
      const lambda = this.dragK / this.mass;
      const c = Math.exp(-lambda * dt);

      // vTerm = v_n * e^{-λΔt}
      vec3.scale(this._tmpV, this.velocity, c);

      // fTerm = (F/k) * (1 - e^{-λΔt})
      const scaleF = (1 - c) / this.dragK;
      vec3.scale(this._tmpA, this.forceAccum, scaleF); // _tmpA を再利用

      const vNext = this.velocity; // そのまま上書き
      vec3.add(vNext, this._tmpV, this._tmpA);
      this.applyFreezeToVector(vNext);

      // x_{n+1}
      vec3.scale(this._tmpA, vNext, dt);
      if (this.freezePosX) this._tmpA[0] = 0;
      if (this.freezePosY) this._tmpA[1] = 0;
      if (this.freezePosZ) this._tmpA[2] = 0;
      vec3.add(pos, pos, this._tmpA);

      // a ≒ (vNext - vOld) / dt
      vec3.sub(this.acceleration, vNext, vOld);
      vec3.scale(this.acceleration, this.acceleration, 1 / dt);
    } else {
      // dragK = 0
      // a = F/m
      vec3.scale(this.acceleration, this.forceAccum, 1 / this.mass);
      this.applyFreezeToVector(this.acceleration);
      // v_{n+1}
      vec3.scaleAndAdd(this.velocity, this.velocity, this.acceleration, dt);
      this.applyFreezeToVector(this.velocity);
      // x_{n+1}
      vec3.scale(this._tmpA, this.velocity, dt);
      if (this.freezePosX) this._tmpA[0] = 0;
      if (this.freezePosY) this._tmpA[1] = 0;
      if (this.freezePosZ) this._tmpA[2] = 0;
      vec3.add(pos, pos, this._tmpA);
    }

    if (this.freezePosX) pos[0] = this._tmpPos[0];
    if (this.freezePosY) pos[1] = this._tmpPos[1];
    if (this.freezePosZ) pos[2] = this._tmpPos[2];

    // 力をリセット
    vec3.set(this.forceAccum, 0, 0, 0);

    // Transform を dirty にする（行列は lazy 更新）
    this.transform.markDirty();
  }

  setPosition(pos: vec3) {
    if (!this.transform) return;
    const p = this.transform.position;

    // freeze されていない軸だけ書き換える
    if (!this.freezePosX) p[0] = pos[0];
    if (!this.freezePosY) p[1] = pos[1];
    if (!this.freezePosZ) p[2] = pos[2];

    // 物理状態リセット
    this.applyFreezeToVector(this.velocity);
    this.applyFreezeToVector(this.acceleration);
    vec3.set(this.forceAccum, 0, 0, 0);

    this.transform.markDirty();
  }

    private applyFreezeToVector(v: vec3) {
    if (this.freezePosX) v[0] = 0;
    if (this.freezePosY) v[1] = 0;
    if (this.freezePosZ) v[2] = 0;
  }

  private applyFreezeToForce() {
    if (this.freezePosX) this.forceAccum[0] = 0;
    if (this.freezePosY) this.forceAccum[1] = 0;
    if (this.freezePosZ) this.forceAccum[2] = 0;
  }

}
