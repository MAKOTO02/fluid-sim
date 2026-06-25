import type { Program } from "../gl/program";
import { ShaderLibrary } from "../scene/shaderLibrary";

import baseVert from "../shaders/baseVertexShader.vert?raw";
import curl from "../shaders/curlShader.frag?raw";
import vorticity from "../shaders/vorticityShader.frag?raw";
import physics from "../shaders/physicsShader.frag?raw";
import divergence from "../shaders/divergenceShader.frag?raw";
import pressure from "../shaders/pressureShader.frag?raw";
import subtractGradient from "../shaders/subtractGradientShader.frag?raw";
import advection from "../shaders/advectionShader.frag?raw";
import clear from "../shaders/clearShader.frag?raw";
import splat from "../shaders/splatShader.frag?raw";
import dyeFromMask from "../shaders/dyeFromMaskShader.frag?raw";
import copy from "../shaders/copyShader.frag?raw";

export type FluidShaderPrograms = {
  curl: Program;
  vorticity: Program;
  physics: Program;
  divergence: Program;
  pressure: Program;
  subtractGradient: Program;
  advection: Program;
  clear: Program;
  splat: Program;
  dyeFromMask: Program;
};

export type FluidProgramBundle = {
  fluidShaders: FluidShaderPrograms;
  copyProgram: Program;
};

export function createFluidShaderPrograms(
  shaderLib: ShaderLibrary
): FluidProgramBundle {
  return {
    fluidShaders: {
      curl: shaderLib.load("curl", baseVert, curl),
      vorticity: shaderLib.load("vorticity", baseVert, vorticity),
      physics: shaderLib.load("physics", baseVert, physics),
      divergence: shaderLib.load("divergence", baseVert, divergence),
      pressure: shaderLib.load("pressure", baseVert, pressure),
      subtractGradient: shaderLib.load("subtractGradient", baseVert, subtractGradient),
      advection: shaderLib.load("advection", baseVert, advection),
      clear: shaderLib.load("clear", baseVert, clear),
      splat: shaderLib.load("splat", baseVert, splat),
      dyeFromMask: shaderLib.load("dyeFromMask", baseVert, dyeFromMask),
    },
    copyProgram: shaderLib.load("copy", baseVert, copy),
  };
}
