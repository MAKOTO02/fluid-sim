import type { Component } from "./component";
import type { GameObject } from "./gameObject";
import type { Scene } from "./scene";
import { vec3 } from "gl-matrix";

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

    if (other instanceof BoxCollider) {
      return other.intersectsSphere(this);
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

type ObbData = {
  center: vec3;
  axes: [vec3, vec3, vec3];
  extents: [number, number, number];
};

export class BoxCollider implements Collider {
  enabled = true;
  owner?: GameObject;

  readonly halfExtents: vec3;
  layer: CollisionLayer;
  isTrigger: boolean;

  scene: Scene;

  onTriggerEnter?: (other: Collider) => void;

  constructor(scene: Scene, halfExtents: vec3, layer: CollisionLayer, isTrigger = true) {
    this.halfExtents = vec3.clone(halfExtents);
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

    if (other instanceof BoxCollider) {
      return this.intersectsBox(other);
    }

    return false;
  }

  intersectsSphere(sphere: SphereCollider): boolean {
    const sphereOwner = sphere.owner;
    const box = this.getObbData();
    if (!sphereOwner || !box) return false;

    const sphereCenter = sphereOwner.transform.getWorldPosition();
    const closest = vec3.clone(box.center);
    const centerToSphere = vec3.sub(vec3.create(), sphereCenter, box.center);

    for (let i = 0; i < 3; i++) {
      const axis = box.axes[i];
      const distance = vec3.dot(centerToSphere, axis);
      const clamped = Math.max(-box.extents[i], Math.min(distance, box.extents[i]));
      vec3.scaleAndAdd(closest, closest, axis, clamped);
    }

    return vec3.squaredDistance(sphereCenter, closest) <= sphere.radius * sphere.radius;
  }

  private intersectsBox(other: BoxCollider): boolean {
    const a = this.getObbData();
    const b = other.getObbData();
    if (!a || !b) return false;

    return testObbOverlap(a, b);
  }

  private getObbData(): ObbData | null {
    const owner = this.owner;
    if (!owner) return null;

    const m = owner.transform.getWorldMatrix();
    const center = owner.transform.getWorldPosition();
    const axes: [vec3, vec3, vec3] = [
      vec3.fromValues(m[0], m[1], m[2]),
      vec3.fromValues(m[4], m[5], m[6]),
      vec3.fromValues(m[8], m[9], m[10]),
    ];
    const extents: [number, number, number] = [0, 0, 0];

    for (let i = 0; i < 3; i++) {
      const scale = vec3.length(axes[i]);
      if (scale <= Number.EPSILON) return null;

      vec3.scale(axes[i], axes[i], 1 / scale);
      extents[i] = this.halfExtents[i] * scale;
    }

    return { center, axes, extents };
  }

  onAttach?(): void {
    this.scene.collisionSystem.add(this);
  }

  onDetach?(): void {
    this.scene.collisionSystem.remove(this);
  }
}

function testObbOverlap(a: ObbData, b: ObbData): boolean {
  const epsilon = 1e-6;
  const r: number[][] = [[], [], []];
  const absR: number[][] = [[], [], []];

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      r[i][j] = vec3.dot(a.axes[i], b.axes[j]);
      absR[i][j] = Math.abs(r[i][j]) + epsilon;
    }
  }

  const centerDelta = vec3.sub(vec3.create(), b.center, a.center);
  const t = [
    vec3.dot(centerDelta, a.axes[0]),
    vec3.dot(centerDelta, a.axes[1]),
    vec3.dot(centerDelta, a.axes[2]),
  ];

  for (let i = 0; i < 3; i++) {
    const ra = a.extents[i];
    const rb = b.extents[0] * absR[i][0] + b.extents[1] * absR[i][1] + b.extents[2] * absR[i][2];
    if (Math.abs(t[i]) > ra + rb) return false;
  }

  for (let j = 0; j < 3; j++) {
    const ra = a.extents[0] * absR[0][j] + a.extents[1] * absR[1][j] + a.extents[2] * absR[2][j];
    const rb = b.extents[j];
    const distance = Math.abs(t[0] * r[0][j] + t[1] * r[1][j] + t[2] * r[2][j]);
    if (distance > ra + rb) return false;
  }

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const ra =
        a.extents[(i + 1) % 3] * absR[(i + 2) % 3][j] +
        a.extents[(i + 2) % 3] * absR[(i + 1) % 3][j];
      const rb =
        b.extents[(j + 1) % 3] * absR[i][(j + 2) % 3] +
        b.extents[(j + 2) % 3] * absR[i][(j + 1) % 3];
      const distance = Math.abs(
        t[(i + 2) % 3] * r[(i + 1) % 3][j] -
        t[(i + 1) % 3] * r[(i + 2) % 3][j]
      );

      if (distance > ra + rb) return false;
    }
  }

  return true;
}

