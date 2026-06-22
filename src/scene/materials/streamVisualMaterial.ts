import { BaseMaterial } from "./baseMaterial";
import type { Program } from "../../gl/program";

export class StreamVisualMaterial extends BaseMaterial {
  texture: WebGLTexture | null = null;
  scale: number;
  textureUnit: number;

  constructor(program: Program, texture: WebGLTexture | null = null, scale = 5000, unit = 0) {
    super(program);
    this.texture = texture;
    this.scale = scale;
    this.textureUnit = unit;
  }

  setTexture(texture: WebGLTexture | null) {
    this.texture = texture;
  }

  protected uploadMaterialUniforms(gl: WebGLRenderingContext | WebGL2RenderingContext): void {
    const uTex = this.program.uniforms.get("uTexture");
    const uScale = this.program.uniforms.get("uScale");

    gl.activeTexture(gl.TEXTURE0 + this.textureUnit);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    if (uTex) gl.uniform1i(uTex, this.textureUnit);
    if (uScale) gl.uniform1f(uScale, this.scale);
  }
}
