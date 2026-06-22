import { vec4 } from "gl-matrix";
import type { Program } from "../gl/program";
import UnlitTexFrag from "../shaders/unlitTexShader.frag?raw";
import dyeVisualFrag from "../shaders/dyeVisual.frag?raw";
import streamVisualFrag from "../shaders/streamVisual.frag?raw";
import sceneVert from "../shaders/sceneVertexShader.vert?raw";
import type { IMaterial } from "./material";
import { UnlitColorMaterial } from "./materials/unlitColorMaterial";
import type { ShaderLibrary } from "./shaderLibrary";
import { createGameMaterials, createGamePrograms, type GameMaterials } from "./gameAssets";

export type RenderAssets = {
  materials: GameMaterials;
  obstacleMaterial: IMaterial;
  debugFrameMaterial: IMaterial;
  unlitTexProgram: Program;
  streamVisualProgram: Program;
  dyeVisualProgram: Program;
};

export function createRenderAssets(shaderLib: ShaderLibrary): RenderAssets {
  const programs = createGamePrograms(shaderLib);
  const materials = createGameMaterials(programs);

  const obstacleColor = vec4.fromValues(1, 0, 0, 0);
  const obstacleMaterial = new UnlitColorMaterial(programs.unlitColor, obstacleColor);
  const debugFrameColor = vec4.fromValues(1, 1, 1, 0.35);
  const debugFrameMaterial = new UnlitColorMaterial(programs.unlitColor, debugFrameColor);

  const unlitTexProgram = shaderLib.load("UnlitTex", sceneVert, UnlitTexFrag);
  const streamVisualProgram = shaderLib.load("StreamVisual", sceneVert, streamVisualFrag);
  const dyeVisualProgram = shaderLib.load("DyeVelVisual", sceneVert, dyeVisualFrag);

  return {
    materials,
    obstacleMaterial,
    debugFrameMaterial,
    unlitTexProgram,
    streamVisualProgram,
    dyeVisualProgram,
  };
}
