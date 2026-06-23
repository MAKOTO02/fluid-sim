// Projectile.ts
import type { Component } from "./component";
import type { GameObject } from "./gameObject";
import type { Scene } from "./scene";
import { SphereCollider, type Collider, type CollisionLayer } from "./collider";

export class Projectile implements Component {
  enabled = true;
  owner?: GameObject;

  private scene: Scene;

  /** Projectile lifetime in seconds. */
  private life: number;

  /** Target layers. An empty list means the projectile can hit everything. */
  private targetLayers: CollisionLayer[];

  /** Out-of-bounds margin for allowing a small area outside the screen. */
  private outOfBoundsMargin: number;

  /** Optional callback invoked when the projectile hits something. */
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

    // Connect trigger events from the collider.
    const col = this.owner.getComponent(SphereCollider);
    if (col) {
      col.onTriggerEnter = (other) => this.onTrigger(other);
    }
  }

  update(dt: number): void {
    if (!this.enabled || !this.owner) return;

    // Countdown lifetime.
    this.life -= dt;
    if (this.life <= 0) {
      this.destroySelf();
      return;
    }

    // Out-of-bounds check in camera UV space.
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

  // Called from the collider.
  private onTrigger(other: Collider) {
    if (!this.owner) return;

    // Keep target-layer filtering on the projectile side as well.
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

    // Prefer GameObject.destroy() when available.
    if (typeof (this.owner as any).destroy === "function") {
      (this.owner as any).destroy();
    } else {
      // Fallback for objects without destroy().
      this.owner.active = false;
      // Remove from Scene directly when possible.
      if ((this.scene as any).removeObject) {
        (this.scene as any).removeObject(this.owner);
      }
    }
  }

  onAttach?(): void {}
  onDetach?(): void {}
}
