import { vec4 } from "gl-matrix";
import type { Program } from "../gl/program";
import { createTextureFromUrl } from "../gl/texture";
import UnlitTexFrag from "../shaders/unlitTexShader.frag?raw";
import dyeVisualFrag from "../shaders/dyeVisual.frag?raw";
import streamVisualFrag from "../shaders/streamVisual.frag?raw";
import sceneVert from "../shaders/sceneVertexShader.vert?raw";
import type { IMaterial } from "./material";
import { UnlitColorMaterial } from "./materials/unlitColorMaterial";
import { UnlitTextureMaterial } from "./materials/unlitTexMaterial";
import type { ShaderLibrary } from "./shaderLibrary";
import { createGameMaterials, createGamePrograms, type GameMaterials } from "./gameAssets";
import type { ProjectileMaterialKey } from "./projectileDefinition";

export type RenderAssets = {
  materials: GameMaterials;
  shelterMaterial: IMaterial;
  inkZoneMaterial: IMaterial;
  debugFrameMaterial: IMaterial;
  enemyVisualMaterial: IMaterial;
  projectileMaterials: Record<ProjectileMaterialKey, IMaterial>;
  unlitTexProgram: Program;
  streamVisualProgram: Program;
  dyeVisualProgram: Program;
};

export function createRenderAssets(
  shaderLib: ShaderLibrary,
  gl: WebGLRenderingContext | WebGL2RenderingContext
): RenderAssets {
  const programs = createGamePrograms(shaderLib);
  const materials = createGameMaterials(programs);

  const shelterColor = vec4.fromValues(1, 0, 0, 1);
  const shelterMaterial = new UnlitColorMaterial(programs.unlitColor, shelterColor);
  const inkZoneColor = vec4.fromValues(0.1, 1, 0.45, 0.35);
  const inkZoneMaterial = new UnlitColorMaterial(programs.unlitColor, inkZoneColor);
  const debugFrameColor = vec4.fromValues(1, 1, 1, 0.35);
  const debugFrameMaterial = new UnlitColorMaterial(programs.unlitColor, debugFrameColor);

  const unlitTexProgram = shaderLib.load("UnlitTex", sceneVert, UnlitTexFrag);
  const streamVisualProgram = shaderLib.load("StreamVisual", sceneVert, streamVisualFrag);
  const dyeVisualProgram = shaderLib.load("DyeVelVisual", sceneVert, dyeVisualFrag);
  const enemyTexture = createTextureFromUrl(
    gl,
    `${import.meta.env.BASE_URL}assets/enemy-ring.png`
  );
  const enemyVisualMaterial = new UnlitTextureMaterial(unlitTexProgram, enemyTexture);
  const hazardBulletTexture = createTextureFromUrl(
    gl,
    `${import.meta.env.BASE_URL}assets/hazard-bullet.png`
  );
  const hazardBulletMaterial = new UnlitTextureMaterial(unlitTexProgram, hazardBulletTexture);

  return {
    materials,
    shelterMaterial,
    inkZoneMaterial,
    debugFrameMaterial,
    enemyVisualMaterial,
    projectileMaterials: {
      enemyBullet: materials.enemySmall,
      hazardBullet: hazardBulletMaterial,
    },
    unlitTexProgram,
    streamVisualProgram,
    dyeVisualProgram,
  };
}
