import type { GameStage } from "../stage/demoStage";
import type { GameWorld } from "./createGameWorld";
import type { GameObject } from "../scene/gameObject";
import { RigidBody } from "../scene/rigidBody";

export type Vec3Snapshot = [number, number, number];

export type GameObjectSnapshot = {
  id: number;
  name: string;
  active: boolean;
  destroyed: boolean;
  layer: number;
  position: Vec3Snapshot;
  localPosition: Vec3Snapshot;
  localScale: Vec3Snapshot;
  velocity?: Vec3Snapshot;
};

export type StageSnapshot = {
  player: GameObjectSnapshot;
  enemies: GameObjectSnapshot[];
  obstacles: GameObjectSnapshot[];
  streams: GameObjectSnapshot[];
};

export type WorldSnapshot = {
  stage: StageSnapshot;
};

export function createWorldSnapshot(world: GameWorld): WorldSnapshot {
  return {
    stage: createStageSnapshot(world.stage),
  };
}

export function createStageSnapshot(stage: GameStage): StageSnapshot {
  return {
    player: createGameObjectSnapshot(stage.player),
    enemies: stage.enemies.map(createGameObjectSnapshot),
    obstacles: stage.obstacles.map(createGameObjectSnapshot),
    streams: stage.streams.map(createGameObjectSnapshot),
  };
}

export function createGameObjectSnapshot(obj: GameObject): GameObjectSnapshot {
  const rb = obj.getComponent(RigidBody);

  return {
    id: obj.id,
    name: obj.name,
    active: obj.active,
    destroyed: obj.destroyed,
    layer: obj.layer,
    position: toVec3Snapshot(obj.transform.getWorldPosition()),
    localPosition: toVec3Snapshot(obj.transform.position),
    localScale: toVec3Snapshot(obj.transform.scale),
    velocity: rb ? toVec3Snapshot(rb.velocity) : undefined,
  };
}

function toVec3Snapshot(v: ArrayLike<number>): Vec3Snapshot {
  return [v[0], v[1], v[2]];
}
