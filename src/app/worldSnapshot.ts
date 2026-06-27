import type { GameStage } from "../stage/gameStageFactory";
import type { GameWorld } from "./createGameWorld";
import type { GameObject } from "../scene/gameObject";
import { Health, type HealthSnapshot } from "../scene/health";
import { PlayerInk, type PlayerInkSnapshot } from "../scene/playerInk";
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
  health?: HealthSnapshot;
  ink?: PlayerInkSnapshot;
};

export type StageSnapshot = {
  elapsed: number;
  nextEventAt?: number;
  player: GameObjectSnapshot;
  enemies: GameObjectSnapshot[];
  shelters: GameObjectSnapshot[];
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
  const nextEvent = stage.eventProcessor.getNextTimeEvent();

  return {
    elapsed: stage.eventProcessor.getElapsed(),
    nextEventAt: nextEvent?.trigger.type === "time" ? nextEvent.trigger.at : undefined,
    player: createGameObjectSnapshot(stage.player),
    enemies: stage.enemies.map(createGameObjectSnapshot),
    shelters: stage.shelters.map(createGameObjectSnapshot),
    streams: stage.streams.map(createGameObjectSnapshot),
  };
}

export function createGameObjectSnapshot(obj: GameObject): GameObjectSnapshot {
  const rb = obj.getComponent(RigidBody);
  const health = obj.getComponent(Health);
  const ink = obj.getComponent(PlayerInk);

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
    health: health?.getSnapshot(),
    ink: ink?.getSnapshot(),
  };
}

function toVec3Snapshot(v: ArrayLike<number>): Vec3Snapshot {
  return [v[0], v[1], v[2]];
}
