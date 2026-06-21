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

  /** Subclasses may override this if needed. */
  protected uploadCommonMatrices(
    gl: WebGLRenderingContext | WebGL2RenderingContext,
    owner: GameObject,
    camera: CameraComponent
  ) {
    const uModel = getRequiredUniform(this.program, "uModelMat");
    gl.uniformMatrix4fv(uModel, false, owner.transform.getWorldMatrix());
    camera.updateShaderUniforms(this.program);
  }

  /** Common bind path. Calls the subclass hook at the end. */
  bind(
    gl: WebGLRenderingContext | WebGL2RenderingContext,
    owner: GameObject,
    camera: CameraComponent
  ): void {
    this.program.bind();

    this.uploadCommonMatrices(gl, owner, camera);
    this.uploadMaterialUniforms(gl);
  }

  /** Material-specific uniform / texture setup. */
  protected abstract uploadMaterialUniforms(
    gl: WebGLRenderingContext | WebGL2RenderingContext
  ): void;
}
