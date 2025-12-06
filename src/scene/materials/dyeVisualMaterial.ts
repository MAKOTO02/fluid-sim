import { BaseMaterial } from "./baseMaterial";
import type { Program } from "../../gl/program";

export class DyeVisualMaterial extends BaseMaterial {
  private dyeTex: WebGLTexture;
  private velTex: WebGLTexture;
  public velScale = 5.0;
  public mix = 0.7;
  constructor(
    program: Program,
    dyeTex: WebGLTexture,
    velTex: WebGLTexture,
    velScale = 5.0,
    mix = 0.7
  ) {
    super(program);
    this.dyeTex = dyeTex;
    this.velTex = velTex;
    this.velScale = velScale;
    this.mix = mix;
  }

  setTextures(dye: WebGLTexture, vel: WebGLTexture) {
    this.dyeTex = dye;
    this.velTex = vel;
  }

  protected uploadMaterialUniforms(gl: WebGLRenderingContext | WebGL2RenderingContext): void {
    const locDye  = this.program.uniforms.get("uDye");
    const locVel  = this.program.uniforms.get("uVelocity");
    const locScale= this.program.uniforms.get("uVelScale");
    const locMix  = this.program.uniforms.get("uMix");

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.dyeTex);
    if (locDye) gl.uniform1i(locDye, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.velTex);
    if (locVel) gl.uniform1i(locVel, 1);
    if (locScale) gl.uniform1f(locScale, this.velScale);
    if (locMix)   gl.uniform1f(locMix, this.mix);
  }
}
