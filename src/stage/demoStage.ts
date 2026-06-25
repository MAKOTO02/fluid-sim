import type { FluidSim } from "../fluid/fluidSim";
import type { Program } from "../gl/program";
import type { GameInput } from "../input/inputController";
import {
  createShelterObject,
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
import type { StreamFieldMap } from "../fluid/streamFieldMap";
import { InkZoneRegistry } from "../scene/inkZoneRegistry";

export type GameStage = {
  player: GameObject;
  enemies: GameObject[];
  shelters: GameObject[];
  streams: GameObject[];
  streamFieldMap: StreamFieldMap;
  inkZoneRegistry: InkZoneRegistry;
};

export function createDemoStage(args: {
  scene: Scene;
  gl: WebGLRenderingContext | WebGL2RenderingContext;
  canvas: HTMLCanvasElement;
  material: IMaterial;
  playerVisualMaterial: IMaterial;
  inkZoneMaterial: IMaterial;
  shelterMaterial: IMaterial;
  unlitTexProgram: Program;
  bulletStreamTexture: WebGLTexture;
  bulletStreamSource: StreamSource;
  streamFieldMap: StreamFieldMap;
  fluidSim: FluidSim;
  input: GameInput;
  onShelterChanged?: () => void;
}): GameStage {
  const {
    scene,
    gl,
    canvas,
    material,
    playerVisualMaterial,
    inkZoneMaterial,
    shelterMaterial,
    unlitTexProgram,
    bulletStreamTexture,
    bulletStreamSource,
    streamFieldMap,
    fluidSim,
    input,
    onShelterChanged,
  } = args;

  const inkZoneRegistry = new InkZoneRegistry();

  const shelterMesh = createQuad(1);
  const shelter = createShelterObject({
    scene,
    gl,
    mesh: shelterMesh,
    material: shelterMaterial,
    layer: SceneLayers.obstacle,
    onShelterChanged,
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
    inkZoneRegistry,
  });

  player.addComponent(new PlayerShooting({
    gl,
    scene,
    input,
    material,
    fluidSim,
    canvas,
    splatForce,
    inkZoneMaterial,
    streamFieldMap,
    inkZoneRegistry,
  }));

  return {
    player,
    enemies: [enemy],
    shelters: [shelter],
    streams: [stream],
    streamFieldMap,
    inkZoneRegistry,
  };
}
