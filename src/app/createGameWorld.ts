import type { FluidSim } from "../fluid/fluidSim";
import { createDebugTextureMap, type DebugTextureMap } from "../debug/debugTextureMap";
import type { GameInput } from "../input/inputController";
import { Renderer } from "../scene/renderer";
import type { RenderAssets } from "../scene/renderAssets";
import type { GameObject } from "../scene/gameObject";
import { createDemoStage, type GameStage } from "../stage/demoStage";
import { Scene } from "../scene/scene";
import { createMainCamera } from "../scene/cameraObject";
import { createFluidPlaneObject } from "../scene/fluidSceneObjects";
import { SceneLayers } from "../scene/layers";
import { createQuad } from "../scene/primitives";
import type { DyeVisualMaterial } from "../scene/materials/dyeVisualMaterial";
import type { FitToCamera } from "../scene/fitToCamera";
import { createTextureFromUrl } from "../gl/texture";
import { UnlitTextureMaterial } from "../scene/materials/unlitTexMaterial";
import type { StreamFieldMap } from "../fluid/streamFieldMap";
import type { StageDefinition } from "../stage/stageDefinition";

export type GameWorld = {
  scene: Scene;
  renderer: Renderer;
  stage: GameStage;
  player: GameObject;
  streamFieldMap: StreamFieldMap;
  debugTextureMap: DebugTextureMap;
  dyeVisualMaterial: DyeVisualMaterial;
  fitter: FitToCamera;
};

export function createGameWorld(args: {
  gl: WebGLRenderingContext | WebGL2RenderingContext;
  canvas: HTMLCanvasElement;
  fluidSim: FluidSim;
  renderAssets: RenderAssets;
  bulletStreamTexture: WebGLTexture;
  streamFieldMap: StreamFieldMap;
  stageDefinition: StageDefinition;
  input: GameInput;
  onShelterChanged?: () => void;
}): GameWorld {
  const {
    gl,
    canvas,
    fluidSim,
    renderAssets,
    bulletStreamTexture,
    streamFieldMap,
    stageDefinition,
    input,
    onShelterChanged,
  } = args;

  const scene = new Scene();
  const renderer = new Renderer(gl);

  const cameraComp = createMainCamera({
    scene,
    gl,
    aspect: canvas.width / canvas.height,
    layer: SceneLayers.default,
  });

  const quadMesh = createQuad(1);
  const { dyeVisualMaterial, fitter } = createFluidPlaneObject({
    scene,
    gl,
    camera: cameraComp,
    mesh: quadMesh,
    program: renderAssets.dyeVisualProgram,
    fluidSim,
    layer: SceneLayers.default,
  });

  const playerTexture = createTextureFromUrl(
    gl,
    `${import.meta.env.BASE_URL}assets/player-ring.png`
  );
  const playerVisualMaterial = new UnlitTextureMaterial(
    renderAssets.unlitTexProgram,
    playerTexture
  );

  const stage = createDemoStage({
    scene,
    gl,
    canvas,
    material: renderAssets.materials.player,
    playerVisualMaterial,
    inkZoneMaterial: renderAssets.inkZoneMaterial,
    shelterMaterial: renderAssets.shelterMaterial,
    unlitTexProgram: renderAssets.unlitTexProgram,
    bulletStreamTexture,
    streamFieldMap,
    fluidSim,
    input,
    definition: stageDefinition,
    onShelterChanged,
  });

  const debugTextureMap = createDebugTextureMap({
    scene,
    gl,
    program: renderAssets.unlitTexProgram,
    streamVisualProgram: renderAssets.streamVisualProgram,
    frameMaterial: renderAssets.debugFrameMaterial,
    fluidSim,
    layer: SceneLayers.default,
  });

  return {
    scene,
    renderer,
    stage,
    player: stage.player,
    streamFieldMap,
    debugTextureMap,
    dyeVisualMaterial,
    fitter,
  };
}
