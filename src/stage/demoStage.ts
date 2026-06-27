import { vec3 } from "gl-matrix";
import type { FluidSim } from "../fluid/fluidSim";
import type { Program } from "../gl/program";
import type { GameInput } from "../input/inputController";
import {
  createShelterObject,
  createStreamObject,
} from "../scene/fluidSceneObjects";
import { GameObject } from "../scene/gameObject";
import type { IMaterial } from "../scene/material";
import { createDemoEnemy } from "../scene/enemyFactory";
import { SceneLayers } from "../scene/layers";
import { createPlayer } from "../scene/playerFactory";
import { PlayerShooting } from "../scene/playerShooting";
import { createQuad } from "../scene/primitives";
import type { Scene } from "../scene/scene";
import type { StreamFieldMap } from "../fluid/streamFieldMap";
import { getStreamSource } from "../fluid/streamCatalog";
import { HazardEmitter } from "../scene/hazardEmitter";
import { InkZoneRegistry } from "../scene/inkZoneRegistry";
import { getHazardEmitterConfig } from "./hazardEmitterCatalog";
import { getShelterConfig } from "./shelterCatalog";
import { demoStageDefinition, type StageDefinition } from "./stageDefinition";
import { StageEventProcessor } from "./stageEventProcessor";

export type GameStage = {
  player: GameObject;
  enemies: GameObject[];
  shelters: GameObject[];
  streams: GameObject[];
  hazardEmitters: GameObject[];
  objectsById: ReadonlyMap<string, GameObject>;
  eventProcessor: StageEventProcessor;
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
  streamFieldMap: StreamFieldMap;
  fluidSim: FluidSim;
  input: GameInput;
  definition?: StageDefinition;
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
    streamFieldMap,
    fluidSim,
    input,
    definition = demoStageDefinition,
    onShelterChanged,
  } = args;

  const inkZoneRegistry = new InkZoneRegistry();
  const objectsById = new Map<string, GameObject>();

  const shelterMesh = createQuad(1);
  const shelters = definition.shelters.map((shelterDefinition) => {
    const shelter = createShelterObject({
      scene,
      gl,
      mesh: shelterMesh,
      material: shelterMaterial,
      config: getShelterConfig(shelterDefinition.type),
      position: shelterDefinition.position,
      layer: SceneLayers.obstacle,
      onShelterChanged,
    });
    registerStageObject(objectsById, shelterDefinition.id, shelter);
    return shelter;
  });

  const streams = definition.streams.map((streamDefinition) => {
    const stream = createStreamObject({
      scene,
      gl,
      program: unlitTexProgram,
      texture: bulletStreamTexture,
      source: getStreamSource(streamDefinition.sourceId),
      layer: SceneLayers.stream,
    });
    registerStageObject(objectsById, streamDefinition.id, stream);
    return stream;
  });

  const hazardEmitters = definition.hazardEmitters.map((hazardDefinition) => {
    const config = getHazardEmitterConfig(hazardDefinition.typeId);
    const hazard = new GameObject(hazardDefinition.id);
    hazard.transform.translate(vec3.fromValues(...hazardDefinition.position));
    hazard.addComponent(new HazardEmitter(scene, fluidSim, canvas, config));
    scene.addObject(hazard);
    registerStageObject(objectsById, hazardDefinition.id, hazard);
    return hazard;
  });

  const { player, splatForce } = createPlayer({
    scene,
    gl,
    canvas,
    visualMaterial: playerVisualMaterial,
    fluidSim,
    input,
    position: definition.playerStart,
  });
  registerStageObject(objectsById, "player", player);

  const enemies = definition.enemies.map((enemyDefinition) => {
    const enemy = createDemoEnemy({
      scene,
      gl,
      canvas,
      material,
      fluidSim,
      target: player.transform,
      inkZoneRegistry,
      typeId: enemyDefinition.typeId,
      name: enemyDefinition.id,
      centerPosition: enemyDefinition.centerPosition,
    });
    registerStageObject(objectsById, enemyDefinition.id, enemy);
    return enemy;
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

  const eventProcessor = new StageEventProcessor(definition.events, objectsById, fluidSim);

  return {
    player,
    enemies,
    shelters,
    streams,
    hazardEmitters,
    objectsById,
    eventProcessor,
    streamFieldMap,
    inkZoneRegistry,
  };
}

function registerStageObject(
  objectsById: Map<string, GameObject>,
  id: string,
  object: GameObject
): void {
  if (objectsById.has(id)) {
    throw new Error(`Duplicate stage object id: ${id}`);
  }
  objectsById.set(id, object);
}
