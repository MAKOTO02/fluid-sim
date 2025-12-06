import { vec3, vec4, mat4, quat } from "gl-matrix";
import type { Component } from "./component";
import type { Program } from "../gl/program";
import type { GameObject } from "./gameObject";
import { getRequiredUniform } from "../fluid/shaderUtils";

export class CameraComponent implements Component {
  enabled = true;
  cullingMask: number = ~0;
   owner?: GameObject;

  private gl: WebGLRenderingContext | WebGL2RenderingContext;

  private fov: number;
  private aspect: number;
  private near: number;
  private far: number;
  private yaw: number;
  private pitch: number;

  private viewMatrix: mat4;
  private projectionMatrix: mat4;

  // 一時行列の再利用用
  private _vp: mat4;
  private _invVP: mat4;
  private _qYaw: quat;
  private _qPitch: quat;
  private _q: quat;

  constructor(
    gl: WebGLRenderingContext | WebGL2RenderingContext,
    options?: {
      fov?: number;
      aspect?: number;
      near?: number;
      far?: number;
      yaw?: number;
      pitch?: number;
    }
  ) {
    this.gl = gl;

    this.fov    = options?.fov    ?? Math.PI / 4;
    this.aspect = options?.aspect ?? 1;
    this.near   = options?.near   ?? 0.1;
    this.far    = options?.far    ?? 1000;


    this.yaw    = options?.yaw   ?? -Math.PI / 2;
    this.pitch  = options?.pitch ?? 0;

    this.viewMatrix       = mat4.create();
    this.projectionMatrix = mat4.create();

    this._vp    = mat4.create();
    this._invVP = mat4.create();
    this._qYaw   = quat.create();
    this._qPitch = quat.create();
    this._q      = quat.create();
  }

  // Component インターフェイス
  start(): void {
    // 今のところ特に何もしなくてもOK
  }

  update(_dt: number): void {
    // ここで自動移動などしたければ dt を使う
    // 今は Transform を外からいじる前提なので、とりあえず行列だけ更新
    this.updateMatrices();
  }

  onAttach?(): void {
    this.updateMatrices();
  }
  onDetach?(): void {}

  // ---------------- カメラ操作系 ----------------
  rotate(deltaYaw: number, deltaPitch: number) {
    this.yaw   += deltaYaw;
    this.pitch += deltaPitch;

    // 上下向きすぎ防止
    const limit = Math.PI / 2 - 0.01;
    if (this.pitch >  limit) this.pitch =  limit;
    if (this.pitch < -limit) this.pitch = -limit;

    this.updateMatrices();
  }

  setAspect(aspect: number) {
    this.aspect = aspect;
    this.updateMatrices();
  }

  getFov()    { return this.fov; }
  getAspect() { return this.aspect; }

  // ---------------- 行列更新 ----------------

  public updateMatrices() {
    if(!this.owner) return;

    // yaw/pitch → quaternion
    quat.setAxisAngle(this._qYaw,   [0, 1, 0], this.yaw);
    quat.setAxisAngle(this._qPitch, [1, 0, 0], this.pitch);

    quat.identity(this._q);
    quat.mul(this._q, this._qPitch, this._q);  // → pitch
    quat.mul(this._q, this._qYaw, this._q);    // yaw

    // Transform の rotation に適用
    this.owner.transform.setRotation(this._q);

    // Transform の modelMatrix を更新（カメラの「ワールド行列」）
    const model = this.owner.transform.getWorldMatrix();

    // view = inverse(model)
    mat4.invert(this.viewMatrix, model);

    // projection
    mat4.perspective(
        this.projectionMatrix,
        this.fov, 
        this.aspect, 
        this.near, 
        this.far
    );
  }

  // ---------------- シェーダへの upload ----------------

  updateShaderUniforms(program: Program) {
    const locView = getRequiredUniform(program, "uViewMat");
    const locProj = getRequiredUniform(program, "uProjectionMat");

    this.gl.uniformMatrix4fv(locView, false, this.viewMatrix);
    this.gl.uniformMatrix4fv(locProj, false, this.projectionMatrix);
  }

  // ---------------- 座標変換ユーティリティ ----------------

  /** ワールド座標 → スクリーンUV(0..1, 0..1) */
  public worldToScreenUV(worldPos: vec3): { u: number; v: number } {
    const p = vec4.fromValues(worldPos[0], worldPos[1], worldPos[2], 1.0);

    mat4.mul(this._vp, this.projectionMatrix, this.viewMatrix);
    vec4.transformMat4(p, p, this._vp);

    // NDC (-1〜1)
    const ndcX = p[0] / p[3];
    const ndcY = p[1] / p[3];

    // NDC → UV(0〜1)
    const u = ndcX * 0.5 + 0.5;
    const v = ndcY * 0.5 + 0.5; // v は「下が1・上が0」になる

    return { u, v };
  }

  /**
   * スクリーンUV上の点から、「z = planeZ」の平面とレイの交点を求める
   * （戻り値が null のときは交差しない）
   */
  public screenUVToWorldOnPlane(
    u: number,   // 0..1 (左→右)
    v: number,   // 0..1 (下→上 or 上→下は好みで)
    planeZ: number
  ): vec3 | null {
    // UV → NDC
    const ndcX = u * 2.0 - 1.0;
    const ndcY = v * 2.0 - 1.0; // 必要なら 1.0 - v にして上下反転

    mat4.mul(this._vp, this.projectionMatrix, this.viewMatrix);
    if (!mat4.invert(this._invVP, this._vp)) return null;

    const pNear = vec4.fromValues(ndcX, ndcY, -1.0, 1.0);
    const pFar  = vec4.fromValues(ndcX, ndcY,  1.0, 1.0);

    vec4.transformMat4(pNear, pNear, this._invVP);
    vec4.transformMat4(pFar,  pFar,  this._invVP);

    // 同次座標を正規化
    for (const p of [pNear, pFar]) {
      p[0] /= p[3];
      p[1] /= p[3];
      p[2] /= p[3];
      p[3] = 1.0;
    }

    const worldNear = vec3.fromValues(pNear[0], pNear[1], pNear[2]);
    const worldFar  = vec3.fromValues(pFar[0],  pFar[1],  pFar[2]);

    const dir = vec3.create();
    vec3.sub(dir, worldFar, worldNear);
    vec3.normalize(dir, dir);

    const origin = worldNear;
    const dz = dir[2];
    if (Math.abs(dz) < 1e-6) return null; // 平面とほぼ平行

    const t = (planeZ - origin[2]) / dz;
    if (t < 0.0) return null; // カメラの後ろ側

    const hit = vec3.create();
    vec3.scaleAndAdd(hit, origin, dir, t);
    return hit;
  }

  isInView(worldPos: vec3, margin = 0): boolean{
    const uv = this.worldToScreenUV(worldPos);
    const u = uv.u;
    const v = uv.v;

    return (
      u >= -margin &&
      u <= 1 + margin &&
      v >= -margin &&
      v <= 1 + margin
    );
  }
  getViewInfo(worldPos: vec3, margin = 0) {
    const uv = this.worldToScreenUV(worldPos);
    const visible =
      uv.u >= -margin &&
      uv.u <= 1 + margin &&
      uv.v >= -margin &&
      uv.v <= 1 + margin;

    return { visible, uv };
  }
}
