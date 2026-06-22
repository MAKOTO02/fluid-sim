import type { Program } from "../gl/program";
import type { BlitFunc } from "../gl/frameBuffer";
import type { GLFormat } from "../gl/glContext";
import { FluidFormatResolver } from "./fluidFormatResolver";
import { FluidSim } from "./fluidSim";
import type { FluidShaderPrograms } from "./fluidShaders";

type FluidExtensions = {
  formatRGBA: GLFormat | null;
  formatRG: GLFormat | null;
  formatR: GLFormat | null;
  halfFloatTexType: number;
  supportLinearFiltering: boolean;
};

const fluidConfig = {
  CURL: 30,
  GRAVITY: 0,
  PRESSURE: 0.8,
  PRESSURE_ITERATIONS: 15,
  VELOCITY_DISSIPATION: 0.2,
  DENSITY_DISSIPATION: 2.2,
  SPLAT_RADIUS: 0.01,
  LOGIC_DISSIPATION: 2.2,
};

const SIM_RESOLUTION = 256;
const DYE_RESOLUTION = 1024;

export type CreateFluidSimOptions = {
  gl: WebGLRenderingContext | WebGL2RenderingContext;
  ext: FluidExtensions;
  blit: BlitFunc;
  fluidShaders: FluidShaderPrograms;
  copyProgram: Program;
};

export type CreateFluidSimResult = {
  fluidSim: FluidSim;
  resolver: FluidFormatResolver;
};

export function createFluidSim({
  gl,
  ext,
  blit,
  fluidShaders,
  copyProgram,
}: CreateFluidSimOptions): CreateFluidSimResult {
  const simRes = getResolution(gl, SIM_RESOLUTION);
  const dyeRes = getResolution(gl, DYE_RESOLUTION);

  const resolver = new FluidFormatResolver(gl, ext);
  const formats = {
    vel: resolver.velocityFormat(),
    dye: resolver.dyeFormat(),
    pressure: resolver.pressureFormat(),
    stream: resolver.streamFormat(),
    obstacle: resolver.obstacleFormat(),
  };

  const fluidSim = new FluidSim(
    gl,
    ext,
    blit,
    fluidShaders,
    fluidConfig,
    simRes.width,
    simRes.height,
    dyeRes.width,
    dyeRes.height,
    formats,
    copyProgram
  );

  return { fluidSim, resolver };
}

function getResolution(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  resolution: number
) {
  let aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
  if (aspectRatio < 1) aspectRatio = 1.0 / aspectRatio;

  const min = Math.round(resolution);
  const max = Math.round(resolution * aspectRatio);

  if (gl.drawingBufferWidth > gl.drawingBufferHeight) {
    return { width: max, height: min };
  }
  return { width: min, height: max };
}
