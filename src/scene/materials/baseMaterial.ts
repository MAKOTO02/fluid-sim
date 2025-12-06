// BaseMaterial.ts
import type { Program } from "../../gl/program";
import type { CameraComponent } from "../camera";
import type { GameObject } from "../gameObject";
import type { IMaterial } from "../material";
import { getRequiredUniform } from "../../fluid/shaderUtils";

export abstract class BaseMaterial implements IMaterial {
  readonly program: Program;

  constructor(program: Program) {
    this.program = program;
  }

  /** 必要ならサブクラスで override してもよい */
  protected uploadCommonMatrices(
    gl: WebGLRenderingContext | WebGL2RenderingContext,
    owner: GameObject,
    camera: CameraComponent
  ) {
    const uModel = getRequiredUniform(this.program, "uModelMat");
    gl.uniformMatrix4fv(uModel, false, owner.transform.getWorldMatrix());
    camera.updateShaderUniforms(this.program);
  }

  /** 共通の bind。最後にサブクラス用 hook を呼ぶ */
  bind(
    gl: WebGLRenderingContext | WebGL2RenderingContext,
    owner: GameObject,
    camera: CameraComponent
  ): void {
    this.program.bind();

    this.uploadCommonMatrices(gl, owner, camera);
    this.uploadMaterialUniforms(gl);
  }

  /** 各マテリアル固有の uniform / texture 設定 */
  protected abstract uploadMaterialUniforms(
    gl: WebGLRenderingContext | WebGL2RenderingContext
  ): void;
}
