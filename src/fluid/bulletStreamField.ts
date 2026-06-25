import { createFBO, type BlitFunc } from "../gl/frameBuffer";
import { ShaderLibrary } from "../scene/shaderLibrary";
import type { FluidFormatResolver } from "./fluidFormatResolver";

import baseVert from "../shaders/baseVertexShader.vert?raw";
import streamBulletFieldFrag from "../shaders/streamBulletField.frag?raw";
import type { StreamSource } from "./streamSource";

export function bakeBulletVectorField(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  shaderLib: ShaderLibrary,
  blit: BlitFunc,
  resolver: FluidFormatResolver,
  source: StreamSource
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
  const locCenter = prog.uniforms.get("uCenter");
  const locStrength = prog.uniforms.get("uStrength");
  const locFalloff = prog.uniforms.get("uFalloff");
  if (locCenter) gl.uniform2f(locCenter, source.center[0], source.center[1]);
  if (locStrength) gl.uniform1f(locStrength, source.strength);
  if (locFalloff) gl.uniform1f(locFalloff, source.falloff);

  blit(fbo);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  return fbo.texture;
}
