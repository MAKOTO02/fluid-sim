import type { FluidSim } from "../fluid/fluidSim";
import type { Program } from "../gl/program";
import type { GameInput } from "../input/inputController";
import {
  createObstacleObject,
  createStreamObject,
} from "../scene/fluidSceneObjects";
import type { GameObject } from "../scene/gameObject";
import type { IMaterial } from "../scene/material";
import { createDemoEnemy } from "../scene/enemyFactory";
import { SceneLayers } from "../scene/layers";
import { createPlayer } from "../scene/playerFactory";
import { PlayerShooting } from "../scene/playerShooting";
import { createQuad } from "../scene/primitives";
import type { Scene } from "../scene/scene";
import type { StreamSource } from "../fluid/streamSource";

export type GameStage = {
  player: GameObject;
  enemies: GameObject[];
  obstacles: GameObject[];
  streams: GameObject[];
};

export function createDemoStage(args: {
  scene: Scene;
  gl: WebGLRenderingContext | WebGL2RenderingContext;
  canvas: HTMLCanvasElement;
  material: IMaterial;
  playerVisualMaterial: IMaterial;
  obstacleMaterial: IMaterial;
  unlitTexProgram: Program;
  bulletStreamTexture: WebGLTexture;
  bulletStreamSource: StreamSource;
  fluidSim: FluidSim;
  input: GameInput;
  onObstacleChanged?: () => void;
}): GameStage {
  const {
    scene,
    gl,
    canvas,
    material,
    playerVisualMaterial,
    obstacleMaterial,
    unlitTexProgram,
    bulletStreamTexture,
    bulletStreamSource,
    fluidSim,
    input,
    onObstacleChanged,
  } = args;

  const obstacleMesh = createQuad(1);
  const obstacle = createObstacleObject({
    scene,
    gl,
    mesh: obstacleMesh,
    material: obstacleMaterial,
    layer: SceneLayers.obstacle,
    onObstacleChanged,
  });

  const stream = createStreamObject({
    scene,
    gl,
    program: unlitTexProgram,
    texture: bulletStreamTexture,
    source: bulletStreamSource,
    layer: SceneLayers.stream,
  });

  const { player, splatForce } = createPlayer({
    scene,
    gl,
    canvas,
    visualMaterial: playerVisualMaterial,
    fluidSim,
    input,
  });

  const enemy = createDemoEnemy({
    scene,
    gl,
    canvas,
    material,
    fluidSim,
    target: player.transform,
  });

  player.addComponent(new PlayerShooting({
    gl,
    scene,
    input,
    material,
    fluidSim,
    canvas,
    splatForce,
  }));

  return {
    player,
    enemies: [enemy],
    obstacles: [obstacle],
    streams: [stream],
  };
}
