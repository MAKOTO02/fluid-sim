import type { FluidSim } from "../fluid/fluidSim";
import { Renderer } from "../scene/renderer";
import type { RenderAssets } from "../scene/renderAssets";
import { Scene } from "../scene/scene";
import { createMainCamera } from "../scene/cameraObject";
import {
  createFluidPlaneObject,
  createObstacleObject,
  createStreamObject,
} from "../scene/fluidSceneObjects";
import { SceneLayers } from "../scene/layers";
import { createQuad } from "../scene/primitives";
import { createPlayer } from "../scene/playerFactory";
import { createDemoEnemy } from "../scene/enemyFactory";
import { setupPlayerShooting } from "../scene/playerShooting";
import type { DyeVisualMaterial } from "../scene/materials/dyeVisualMaterial";
import type { FitToCamera } from "../scene/fitToCamera";

export type GameWorld = {
  scene: Scene;
  renderer: Renderer;
  dyeVisualMaterial: DyeVisualMaterial;
  fitter: FitToCamera;
};

export function createGameWorld(args: {
  gl: WebGLRenderingContext | WebGL2RenderingContext;
  canvas: HTMLCanvasElement;
  fluidSim: FluidSim;
  renderAssets: RenderAssets;
  bulletStreamTexture: WebGLTexture;
}): GameWorld {
  const { gl, canvas, fluidSim, renderAssets, bulletStreamTexture } = args;

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

  const { player, splatForce } = createPlayer({
    scene,
    gl,
    canvas,
    material: renderAssets.materials.player,
    fluidSim,
  });

  createDemoEnemy({
    scene,
    gl,
    canvas,
    material: renderAssets.materials.player,
    fluidSim,
    target: player.transform,
  });

  setupPlayerShooting({
    canvas,
    gl,
    scene,
    player,
    material: renderAssets.materials.player,
    fluidSim,
    splatForce,
  });

  return {
    scene,
    renderer,
    dyeVisualMaterial,
    fitter,
  };
}
