import type { FluidSim } from "../fluid/fluidSim";
import type { GameInput } from "../input/inputController";
import { Renderer } from "../scene/renderer";
import type { RenderAssets } from "../scene/renderAssets";
import type { GameObject } from "../scene/gameObject";
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
import { PlayerShooting } from "../scene/playerShooting";
import type { DyeVisualMaterial } from "../scene/materials/dyeVisualMaterial";
import type { FitToCamera } from "../scene/fitToCamera";

export type GameWorld = {
  scene: Scene;
  renderer: Renderer;
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

  const { player, splatForce } = createPlayer({
    scene,
    gl,
    canvas,
    material: renderAssets.materials.player,
    fluidSim,
    input,
  });

  createDemoEnemy({
    scene,
    gl,
    canvas,
    material: renderAssets.materials.player,
    fluidSim,
    target: player.transform,
  });

  player.addComponent(new PlayerShooting({
    gl,
    scene,
    input,
    material: renderAssets.materials.player,
    fluidSim,
    canvas,
    splatForce,
  }));

  return {
    scene,
    renderer,
    player,
    dyeVisualMaterial,
    fitter,
  };
}
