import type { Component } from "./component";
import type { GameObject } from "./gameObject";
import type { Scene } from "./scene";

export type CollisionLayer = "player" | "enemy" | "bullet" | "wall";

export interface Collider extends Component {
  radius: number;
  layer: CollisionLayer;
  isTrigger: boolean;
  scene: Scene;
  onTriggerEnter?: (other: Collider) => void;

  start(): void;
  update(dt: number): void;
  onAttacch?(): void;
  onDettach?(): void;
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
  onAttach?(): void {
    this.scene.collisionSystem.add(this);
  }
  onDetach?(): void {
    this.scene.collisionSystem.remove(this);
  }
}

