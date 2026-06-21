import { vec3, quat, mat4 } from "gl-matrix";

export class Transform {
  readonly position: vec3;   // local
  readonly rotation: quat;   // local
  readonly scale: vec3;      // local

  localMatrix: mat4;         // local to parent-local space
  worldMatrix: mat4;         // world space
  private _dirty = true;     // Whether this transform or its children need matrix updates.

  parent: Transform | null = null;
  children: Transform[] = [];

  constructor() {
    this.position = vec3.create();
    this.rotation = quat.create();
    this.scale = vec3.fromValues(1, 1, 1);

    this.localMatrix = mat4.create();
    this.worldMatrix = mat4.create();
  }

  // Parent-child relationship.
  setParent(newParent: Transform | null) {
    if (this.parent === newParent) return;

    // Detach from the old parent.
    if (this.parent) {
      const i = this.parent.children.indexOf(this);
      if (i >= 0) {
        this.parent.children.splice(i, 1);
      }
    }

    this.parent = newParent;

    // Register with the new parent.
    if (newParent) {
      newParent.children.push(this);
    }

    this.markDirty();
  }

  // Compute worldMatrix while respecting the parent chain.
  public updateMatrix(): mat4 {
    if (this.parent) {
      this.parent.updateMatrix();
    }

    if (this._dirty) {
      // 1. Update localMatrix.
      mat4.fromRotationTranslationScale(
        this.localMatrix,
        this.rotation,
        this.position,
        this.scale
      );

      // world = parent.world * local
      if (this.parent) {
        mat4.mul(this.worldMatrix, this.parent.worldMatrix, this.localMatrix);
      } else {
        mat4.copy(this.worldMatrix, this.localMatrix);
      }

      this._dirty = false;
    }

    return this.worldMatrix;
  }

  public updateHierarchy(): void {
    this.updateMatrix();
    for (const c of this.children) {
      c.updateHierarchy();
    }
  }

  getWorldPosition(out?: vec3): vec3 {
    this.updateMatrix();
    const m = this.worldMatrix;
    const p = out ?? vec3.create();
    vec3.set(p, m[12], m[13], m[14]);
    return p;
  }

  /** World-space forward vector (-Z direction). */
  getForward(out?: vec3): vec3 {
    this.updateMatrix();
    const m = this.worldMatrix;
    const f = out ?? vec3.create();
    // gl-matrix uses column-major matrices; the third column is the Z axis.
    vec3.set(f, -m[8], -m[9], -m[10]);
    return vec3.normalize(f, f);
  }

  /** World-space up vector (Y axis). */
  getUp(out?: vec3): vec3 {
    this.updateMatrix();
    const m = this.worldMatrix;
    const u = out ?? vec3.create();
    vec3.set(u, m[4], m[5], m[6]);
    return vec3.normalize(u, u);
  }

  /** World-space right vector (X axis). */
  getRight(out?: vec3): vec3 {
    this.updateMatrix();
    const m = this.worldMatrix;
    const r = out ?? vec3.create();
    vec3.set(r, m[0], m[1], m[2]);
    return vec3.normalize(r, r);
  }

  // ---- Transform operations ----

  translate(offset: vec3) {
    vec3.add(this.position, this.position, offset);
    this.markDirty();
  }

  rotate(angleRad: number, axis: vec3) {
    const q = quat.create();
    quat.setAxisAngle(q, axis, angleRad);
    quat.multiply(this.rotation, q, this.rotation);
    this.markDirty();
  }

  setScale(scale: vec3) {
    vec3.copy(this.scale, scale);
    this.markDirty();
  }

  setPosition(pos: vec3) {
    vec3.copy(this.position, pos);
    this.markDirty();
  }

  setRotation(rot: quat) {
    quat.copy(this.rotation, rot);
    this.markDirty();
  }

  setRotationEuler(xRad: number, yRad: number, zRad: number) {
    const xDeg = (xRad * 180) / Math.PI;
    const yDeg = (yRad * 180) / Math.PI;
    const zDeg = (zRad * 180) / Math.PI;
    quat.fromEuler(this.rotation, xDeg, yDeg, zDeg);
    this.markDirty();
  }

  // ---- Matrix accessors ----

  getWorldMatrix(): mat4 {
    return this.updateMatrix();
  }

  getLocalMatrix(): mat4 {
    // updateMatrix() refreshes localMatrix as a side effect.
    if (this._dirty) {
      this.updateMatrix();
    }
    return this.localMatrix;
  }

  // When a parent changes, children must also be marked dirty.
  markDirty() {
    if (this._dirty) return;
    this._dirty = true;
    for (const c of this.children) {
      c.markDirty();
    }
  }

  getRoot(): Transform {
    let t: Transform = this;
    while (t.parent) {
      t = t.parent;
    }
    return t;
  }

  // Enumerate parent chain.
  *getParents(): Iterable<Transform> {
    let t = this.parent;
    while (t) {
      yield t;
      t = t.parent;
    }
  }
}
