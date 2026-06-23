import type { Component } from "./component";
import type { GameObject } from "./gameObject";
import type { Scene } from "./scene";

export type CollisionLayer = "player" | "enemy" | "playerBullet" | "enemyBullet" | "wall";

export interface Collider extends Component {
  layer: CollisionLayer;
  isTrigger: boolean;
  scene: Scene;
  onTriggerEnter?: (other: Collider) => void;
  intersects(other: Collider): boolean;

  start(): void;
  update(dt: number): void;
  onAttach?(): void;
  onDetach?(): void;
}

export class SphereCollider implements Collider {
  enabled = true;
  owner?: GameObject;

  radius: number;
  layer: CollisionLayer;
  isTrigger: boolean;

  scene: Scene;

  onTriggerEnter?: (other: Collider) => void;

  constructor(scene: Scene, radius: number, layer: CollisionLayer, isTrigger = true) {
    this.radius = radius;
    this.layer = layer;
    this.isTrigger = isTrigger;
    this.scene = scene;
  }

  start(): void {}
  update(_dt: number): void {}

  intersects(other: Collider): boolean {
    if (other instanceof SphereCollider) {
      return this.intersectsSphere(other);
    }

    return false;
  }

  private intersectsSphere(other: SphereCollider): boolean {
    const owner = this.owner;
    const otherOwner = other.owner;
    if (!owner || !otherOwner) return false;

    const p = owner.transform.getWorldPosition();
    const op = otherOwner.transform.getWorldPosition();
    const dx = p[0] - op[0];
    const dy = p[1] - op[1];
    const dz = p[2] - op[2];
    const r = this.radius + other.radius;

    return dx * dx + dy * dy + dz * dz <= r * r;
  }

  onAttach?(): void {
    this.scene.collisionSystem.add(this);
  }
  onDetach?(): void {
    this.scene.collisionSystem.remove(this);
  }
}

