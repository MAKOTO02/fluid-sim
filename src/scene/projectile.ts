// Projectile.ts
import type { Component } from "./component";
import type { GameObject } from "./gameObject";
import type { Scene } from "./scene";
import { SphereCollider, type CollisionLayer } from "./collider";

export class Projectile implements Component {
  enabled = true;
  owner?: GameObject;

  private scene: Scene;

  /** 弾の寿命（秒） */
  private life: number;

  /** ヒット対象とするレイヤー（空なら全部に当たる扱い） */
  private targetLayers: CollisionLayer[];

  /** 画面外判定のマージン（少し外まで許容したいときに使う） */
  private outOfBoundsMargin: number;

  /** ヒット時コールバック（必要なら外から差し込める） */
  onHitCallback?: (self: GameObject, other: GameObject) => void;

  constructor(
    scene: Scene,
    lifeSec = 5.0,
    targetLayers: CollisionLayer[] = [],
    outOfBoundsMargin = 0.1
  ) {
    this.scene = scene;
    this.life = lifeSec;
    this.targetLayers = targetLayers;
    this.outOfBoundsMargin = outOfBoundsMargin;
  }

  canHit(layer: CollisionLayer): boolean {
    if (this.targetLayers.length === 0) return true;
    return this.targetLayers.includes(layer);
  }

  start(): void {
    if (!this.owner) return;

    // コライダーを拾って onTriggerEnter を設定
    const col = this.owner.getComponent(SphereCollider);
    if (col) {
      col.onTriggerEnter = (other) => this.onTrigger(other);
    }
  }

  update(dt: number): void {
    if (!this.enabled || !this.owner) return;

    // 寿命カウントダウン
    this.life -= dt;
    if (this.life <= 0) {
      this.destroySelf();
      return;
    }

    // 画面外判定（カメラの UV で）
    const cam = this.scene.MainCamera;
    if (!cam) return;

    const pos = this.owner.transform.getWorldPosition();
    const uv = cam.worldToScreenUV(pos); // { u, v }

    const m = this.outOfBoundsMargin;
    if (uv.u < -m || uv.u > 1 + m || uv.v < -m || uv.v > 1 + m) {
      this.destroySelf();
      return;
    }
  }

  // コライダーから呼ばれる
  private onTrigger(other: SphereCollider) {
    if (!this.owner) return;

    // 弾側でも一応フィルタ（既存ロジック）
    if (!this.canHit(other.layer)) {
      return;
    }

    if (this.onHitCallback && other.owner) {
      this.onHitCallback(this.owner, other.owner);
    }

    this.destroySelf();
  }

  private destroySelf() {
    if (!this.owner) return;

    // GameObject.destroy() がある前提ならこれでOK
    if (typeof (this.owner as any).destroy === "function") {
      (this.owner as any).destroy();
    } else {
      // まだ destroy を実装していない場合の暫定措置
      this.owner.active = false;
      // Scene に removeObject があるならここで呼んでもよい
      if ((this.scene as any).removeObject) {
        (this.scene as any).removeObject(this.owner);
      }
    }
  }

  onAttach?(): void {}
  onDetach?(): void {}
}
