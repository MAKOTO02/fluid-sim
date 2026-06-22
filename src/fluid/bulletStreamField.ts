import { createFBO, type BlitFunc } from "../gl/frameBuffer";
import { ShaderLibrary } from "../scene/shaderLibrary";
import type { FluidFormatResolver } from "./fluidFormatResolver";

import baseVert from "../shaders/baseVertexShader.vert?raw";
import streamBulletFieldFrag from "../shaders/streamBulletField.frag?raw";

const BULLET_STREAM_BAKE_STRENGTH = 0.0003;

export function bakeBulletVectorField(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  shaderLib: ShaderLibrary,
  blit: BlitFunc,
  resolver: FluidFormatResolver
): WebGLTexture {
  const prog = shaderLib.load("BulletStreamField", baseVert, streamBulletFieldFrag);

  const size = 64;
  const fmt = resolver.streamFormat();

  const fbo = createFBO(
    gl,
    size,
    size,
    fmt.internalFormat,
    fmt.format,
    fmt.type,
    fmt.param
  );

  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo.fbo);
  gl.viewport(0, 0, size, size);

  prog.bind();
  const locStrength = prog.uniforms.get("uStrength");
  if (locStrength) gl.uniform1f(locStrength, BULLET_STREAM_BAKE_STRENGTH);

  blit(fbo);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  return fbo.texture;
}
