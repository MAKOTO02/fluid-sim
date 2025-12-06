// UnlitColorMaterial.ts
import { vec4 } from "gl-matrix";
import { BaseMaterial } from "./baseMaterial";
import type { Program } from "../../gl/program";

export class UnlitColorMaterial extends BaseMaterial {
  color: vec4 = vec4.fromValues(1, 1, 1, 1);

  constructor(program: Program, color?: vec4){
    super(program)
    if(color) this.color = color;
  }

  protected uploadMaterialUniforms(gl: WebGLRenderingContext | WebGL2RenderingContext): void {
    const uColor = this.program.uniforms.get("uColor");
    if (uColor) {
      gl.uniform4fv(uColor, this.color);
    }
  }
}
