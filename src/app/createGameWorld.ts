import type { FluidSim } from "../fluid/fluidSim";
import type { GameInput } from "../input/inputController";
import { Renderer } from "../scene/renderer";
import type { RenderAssets } from "../scene/renderAssets";
import type { GameObject } from "../scene/gameObject";
import { createDemoStage, type GameStage } from "../stage/demoStage";
import { Scene } from "../scene/scene";
import { createMainCamera } from "../scene/cameraObject";
import {
  createFluidPlaneObject,
  createObstacleObject,
  createStreamObject,
} from "../scene/fluidSceneObjects";
import { SceneLayers } from "../scene/layers";
import { createQuad } from "../scene/primitives";
import type { DyeVisualMaterial } from "../scene/materials/dyeVisualMaterial";
import type { FitToCamera } from "../scene/fitToCamera";

export type GameWorld = {
  scene: Scene;
  renderer: Renderer;
  stage: GameStage;
  player: GameObject;
  dyeVisualMaterial: DyeVisualMaterial;
  fitter: FitToCamera;
};

export function createGameWorld(args: {
  gl: WebGLRenderingContext | WebGL2RenderingContext;
  canvas: HTMLCanvasElement;
  fluidSim: FluidSim;
  renderAssets: RenderAssets;
  bulletStreamTexture: WebGLTexture;
  input: GameInput;
}): GameWorld {
  const { gl, canvas, fluidSim, renderAssets, bulletStreamTexture, input } = args;

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

  createObstacleObject({
    scene,
    gl,
    mesh: quadMesh,
    material: renderAssets.obstacleMaterial,
    layer: SceneLayers.obstacle,
  });

  createStreamObject({
    scene,
    gl,
    program: renderAssets.unlitTexProgram,
    texture: bulletStreamTexture,
    layer: SceneLayers.stream,
  });

  const stage = createDemoStage({
    scene,
    gl,
    canvas,
    material: renderAssets.materials.player,
    fluidSim,
    input,
  });

  return {
    scene,
    renderer,
    stage,
    player: stage.player,
    dyeVisualMaterial,
    fitter,
  };
}
