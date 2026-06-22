import { vec4 } from "gl-matrix";
import type { Program } from "../gl/program";
import UnlitTexFrag from "../shaders/unlitTexShader.frag?raw";
import dyeVisualFrag from "../shaders/dyeVisual.frag?raw";
import sceneVert from "../shaders/sceneVertexShader.vert?raw";
import type { IMaterial } from "./material";
import { UnlitColorMaterial } from "./materials/unlitColorMaterial";
import type { ShaderLibrary } from "./shaderLibrary";
import { createGameMaterials, createGamePrograms, type GameMaterials } from "./gameAssets";

export type RenderAssets = {
  materials: GameMaterials;
  obstacleMaterial: IMaterial;
  unlitTexProgram: Program;
  dyeVisualProgram: Program;
};

export function createRenderAssets(shaderLib: ShaderLibrary): RenderAssets {
  const programs = createGamePrograms(shaderLib);
  const materials = createGameMaterials(programs);

  const obstacleColor = vec4.fromValues(1, 0, 0, 0);
  const obstacleMaterial = new UnlitColorMaterial(programs.unlitColor, obstacleColor);

  const unlitTexProgram = shaderLib.load("UnlitTex", sceneVert, UnlitTexFrag);
  const dyeVisualProgram = shaderLib.load("DyeVelVisual", sceneVert, dyeVisualFrag);

  return {
    materials,
    obstacleMaterial,
    unlitTexProgram,
    dyeVisualProgram,
  };
}
