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

  // Reusable temporary matrices and quaternions.
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

    this.fov = options?.fov ?? Math.PI / 4;
    this.aspect = options?.aspect ?? 1;
    this.near = options?.near ?? 0.1;
    this.far = options?.far ?? 1000;

    this.yaw = options?.yaw ?? -Math.PI / 2;
    this.pitch = options?.pitch ?? 0;

    this.viewMatrix = mat4.create();
    this.projectionMatrix = mat4.create();

    this._vp = mat4.create();
    this._invVP = mat4.create();
    this._qYaw = quat.create();
    this._qPitch = quat.create();
    this._q = quat.create();
  }

  start(): void {}

  update(_dt: number): void {
    // The Transform is controlled externally for now; just refresh matrices.
    this.updateMatrices();
  }

  onAttach?(): void {
    this.updateMatrices();
  }
  onDetach?(): void {}

  // ---------------- Camera controls ----------------
  rotate(deltaYaw: number, deltaPitch: number) {
    this.yaw += deltaYaw;
    this.pitch += deltaPitch;

    // Prevent looking too far up or down.
    const limit = Math.PI / 2 - 0.01;
    if (this.pitch > limit) this.pitch = limit;
    if (this.pitch < -limit) this.pitch = -limit;

    this.updateMatrices();
  }

  setAspect(aspect: number) {
    this.aspect = aspect;
    this.updateMatrices();
  }

  getFov() {
    return this.fov;
  }
  getAspect() {
    return this.aspect;
  }

  // ---------------- Matrix updates ----------------
  public updateMatrices() {
    if (!this.owner) return;

    // Convert yaw/pitch to a quaternion.
    quat.setAxisAngle(this._qYaw, [0, 1, 0], this.yaw);
    quat.setAxisAngle(this._qPitch, [1, 0, 0], this.pitch);

    quat.identity(this._q);
    quat.mul(this._q, this._qPitch, this._q);
    quat.mul(this._q, this._qYaw, this._q);

    // Apply camera rotation to the owner transform.
    this.owner.transform.setRotation(this._q);

    // The camera's world matrix comes from its Transform.
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

  // ---------------- Shader upload ----------------
  updateShaderUniforms(program: Program) {
    const locView = getRequiredUniform(program, "uViewMat");
    const locProj = getRequiredUniform(program, "uProjectionMat");

    this.gl.uniformMatrix4fv(locView, false, this.viewMatrix);
    this.gl.uniformMatrix4fv(locProj, false, this.projectionMatrix);
  }

  // ---------------- Coordinate conversion utilities ----------------

  /** Convert world coordinates to screen UV coordinates in the 0..1 range. */
  public worldToScreenUV(worldPos: vec3): { u: number; v: number } {
    const p = vec4.fromValues(worldPos[0], worldPos[1], worldPos[2], 1.0);

    mat4.mul(this._vp, this.projectionMatrix, this.viewMatrix);
    vec4.transformMat4(p, p, this._vp);

    // NDC (-1..1)
    const ndcX = p[0] / p[3];
    const ndcY = p[1] / p[3];

    // NDC to UV (0..1)
    const u = ndcX * 0.5 + 0.5;
    const v = ndcY * 0.5 + 0.5;

    return { u, v };
  }

  /**
   * Cast a ray from a screen UV point and return its intersection with z = planeZ.
   * Returns null when the ray does not intersect the plane.
   */
  public screenUVToWorldOnPlane(
    u: number,
    v: number,
    planeZ: number
  ): vec3 | null {
    // UV to NDC.
    const ndcX = u * 2.0 - 1.0;
    const ndcY = v * 2.0 - 1.0;

    mat4.mul(this._vp, this.projectionMatrix, this.viewMatrix);
    if (!mat4.invert(this._invVP, this._vp)) return null;

    const pNear = vec4.fromValues(ndcX, ndcY, -1.0, 1.0);
    const pFar = vec4.fromValues(ndcX, ndcY, 1.0, 1.0);

    vec4.transformMat4(pNear, pNear, this._invVP);
    vec4.transformMat4(pFar, pFar, this._invVP);

    // Normalize homogeneous coordinates.
    for (const p of [pNear, pFar]) {
      p[0] /= p[3];
      p[1] /= p[3];
      p[2] /= p[3];
      p[3] = 1.0;
    }

    const worldNear = vec3.fromValues(pNear[0], pNear[1], pNear[2]);
    const worldFar = vec3.fromValues(pFar[0], pFar[1], pFar[2]);

    const dir = vec3.create();
    vec3.sub(dir, worldFar, worldNear);
    vec3.normalize(dir, dir);

    const origin = worldNear;
    const dz = dir[2];
    if (Math.abs(dz) < 1e-6) return null;

    const t = (planeZ - origin[2]) / dz;
    if (t < 0.0) return null;

    const hit = vec3.create();
    vec3.scaleAndAdd(hit, origin, dir, t);
    return hit;
  }

  isInView(worldPos: vec3, margin = 0): boolean {
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
