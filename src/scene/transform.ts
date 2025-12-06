import { vec3, quat, mat4 } from "gl-matrix";

export class Transform {
  readonly position: vec3;   // local
  readonly rotation: quat;   // local
  readonly scale: vec3;      // local

  localMatrix: mat4;         // local → 親ローカル空間
  worldMatrix: mat4;         // ワールド空間
  private _dirty = true;     // このTransform（と子）の行列が古いかどうか

  parent: Transform | null = null;
  children: Transform[] = [];

  constructor() {
    this.position = vec3.create();
    this.rotation = quat.create();
    this.scale    = vec3.fromValues(1, 1, 1);

    this.localMatrix = mat4.create();
    this.worldMatrix = mat4.create();
  }

  // 親子関係の設定
  setParent(newParent: Transform | null) {
    if (this.parent === newParent) return;

    // 旧親から外す
    if (this.parent) {
      const i = this.parent.children.indexOf(this);
      if (i >= 0) {
        this.parent.children.splice(i, 1);
      }
    }

    this.parent = newParent;

    // 新しい親に登録
    if (newParent) {
      newParent.children.push(this);
    }

    this.markDirty();
  }

  // 親の world まで考慮して worldMatrix を計算する
  public updateMatrix(): mat4 {
    if (this.parent) {
      this.parent.updateMatrix();
    }

    if (this._dirty) {
      // 1. localMatrix 更新
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

   /** ワールド空間での forward ベクトル (-Z 方向) */
  getForward(out?: vec3): vec3 {
    this.updateMatrix();
    const m = this.worldMatrix;
    const f = out ?? vec3.create();
    // gl-matrix はカラムメジャー: 3列目が Z 軸
    vec3.set(f, -m[8], -m[9], -m[10]);
    return vec3.normalize(f, f);
  }

  /** ワールド空間での up ベクトル (Y 軸) */
  getUp(out?: vec3): vec3 {
    this.updateMatrix();
    const m = this.worldMatrix;
    const u = out ?? vec3.create();
    vec3.set(u, m[4], m[5], m[6]);
    return vec3.normalize(u, u);
  }

  /** ワールド空間での right ベクトル (X 軸) */
  getRight(out?: vec3): vec3 {
    this.updateMatrix();
    const m = this.worldMatrix;
    const r = out ?? vec3.create();
    vec3.set(r, m[0], m[1], m[2]);
    return vec3.normalize(r, r);
  }

  // ---- 変換系メソッド ----

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

  // ---- 行列取得 ----

  getWorldMatrix(): mat4 {
    return this.updateMatrix();
  }

  getLocalMatrix(): mat4 {
    // world 更新のついでに local も最新になるので、
    // 必要なら updateMatrix() を呼んでしまってもよい
    if (this._dirty) {
      this.updateMatrix();
    }
    return this.localMatrix;
  }

  // 親が動いたときに子も dirty にするのが重要
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

  // 親チェーンを列挙したいとき用（おまけ）
  *getParents(): Iterable<Transform> {
    let t = this.parent;
    while (t) {
      yield t;
      t = t.parent;
    }
  }
}
