// gameAssets.ts
import sceneVert from "../shaders/sceneVertexShader.vert?raw";
import UnlitColorFrag from "../shaders/sceneShader.frag?raw";
import { ShaderLibrary } from "./shaderLibrary";
import { UnlitColorMaterial } from "./materials/unlitColorMaterial";
import type { IMaterial } from "./material";
import { vec4 } from "gl-matrix";
import { Program } from "../gl/program";

export type GamePrograms = {
  unlitColor: Program;
  // 将来増やせる：sprite, phong, etc...
};

export type GameMaterials = {
  player: IMaterial;
  enemySmall: IMaterial;
  // boss: IMaterial; など…
};

export function createGamePrograms(
  shaderLib: ShaderLibrary
): GamePrograms {
  const unlitColor = shaderLib.load("UnlitColor", sceneVert, UnlitColorFrag);
  return { unlitColor };
}

export function createGameMaterials(
  programs: GamePrograms
): GameMaterials {
  const playerColor = vec4.fromValues(1, 0.8, 0.8, 0);
  const enemyColor  = vec4.fromValues(1, 0.3, 0.3, 0);

  const playerMat = new UnlitColorMaterial(programs.unlitColor, playerColor);
  const enemyMat  = new UnlitColorMaterial(programs.unlitColor, enemyColor);

  return {
    player: playerMat,
    enemySmall: enemyMat,
  };
}
