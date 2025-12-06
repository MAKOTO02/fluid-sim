import { Program } from "../../gl/program";
import { vec2 } from "gl-matrix";
import { BaseMaterial } from "./baseMaterial";

export class UnlitTextureMaterial extends BaseMaterial {
  texture: WebGLTexture | null = null;
  textureUnit: number = 0;
  uvOffset = vec2.fromValues(0, 0);
  uvScale  = vec2.fromValues(1, 1);

  constructor(program: Program, texture: WebGLTexture | null = null, unit = 0) {
    super(program);
    this.texture = texture;
    this.textureUnit = unit;
  }

  setTexture(tex: WebGLTexture | null){
    this.texture = tex;
  }

  protected uploadMaterialUniforms(gl: WebGLRenderingContext | WebGL2RenderingContext): void {
    const uTex      = this.program.uniforms.get("uTexture");
    const uUVOffset = this.program.uniforms.get("uUVOffset");
    const uUVScale  = this.program.uniforms.get("uUVScale");

    gl.activeTexture(gl.TEXTURE0 + this.textureUnit);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    if (uTex)      gl.uniform1i(uTex, this.textureUnit);
    if (uUVOffset) gl.uniform2fv(uUVOffset, this.uvOffset);
    if (uUVScale)  gl.uniform2fv(uUVScale, this.uvScale);
  }
}
