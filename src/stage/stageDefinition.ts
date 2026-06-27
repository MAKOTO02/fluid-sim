import type { StreamSourceId } from "../fluid/streamCatalog";
import type { EnemyTypeId } from "../scene/enemyConfig";
import type { HazardEmitterTypeId } from "./hazardEmitterCatalog";
import type { ShelterTypeId } from "./shelterCatalog";
import type { StageEventDefinition } from "./stageEventProcessor";

export type Vec3Definition = [number, number, number];

export type ShelterDefinition = {
  id: string;
  type: ShelterTypeId;
  position: Vec3Definition;
};

export type EnemyDefinition = {
  id: string;
  typeId: EnemyTypeId;
  centerPosition: Vec3Definition;
};

export type StreamDefinition = {
  id: string;
  sourceId: StreamSourceId;
};

export type HazardEmitterDefinition = {
  id: string;
  typeId: HazardEmitterTypeId;
  position: Vec3Definition;
};

export type StageDefinition = {
  id: string;
  name: string;
  playerStart: Vec3Definition;
  shelters: ShelterDefinition[];
  enemies: EnemyDefinition[];
  streams: StreamDefinition[];
  hazardEmitters: HazardEmitterDefinition[];
  events: StageEventDefinition[];
};

export const demoStageDefinition: StageDefinition = {
  id: "demo",
  name: "Demo Stage",
  playerStart: [-2, -1.5, 0],
  shelters: [
    {
      id: "demo-shelter-1",
      type: "basic",
      position: [-2, -1.5, 0],
    },
  ],
  enemies: [
    {
      id: "demo-enemy-1",
      typeId: "simple",
      centerPosition: [1, 1, 0],
    },
  ],
  streams: [
    {
      id: "demo-stream-1",
      sourceId: "default-swirl",
    },
  ],
  hazardEmitters: [
    {
      id: "demo-red-vent-1",
      typeId: "red-vent",
      position: [0, 0, 0],
    },
  ],
  events: [
    {
      trigger: { type: "time", at: 5 },
      action: {
        type: "hazard:setEnabled",
        targetId: "demo-red-vent-1",
        enabled: false,
      },
    },
    {
      trigger: { type: "time", at: 8 },
      action: {
        type: "hazard:setEnabled",
        targetId: "demo-red-vent-1",
        enabled: true,
      },
    },
    {
      trigger: { type: "time", at: 12 },
      action: {
        type: "stream:setForceEnabled",
        enabled: false,
      },
    },
    {
      trigger: { type: "time", at: 16 },
      action: {
        type: "stream:setForceEnabled",
        enabled: true,
      },
    },
  ],
};

export const wideStageDefinition: StageDefinition = {
  id: "wide-demo",
  name: "Wide Demo",
  playerStart: [-3.2, -1.8, 0],
  shelters: [
    {
      id: "wide-shelter-1",
      type: "basic",
      position: [-2.6, -1.4, 0],
    },
    {
      id: "wide-shelter-2",
      type: "basic",
      position: [1.7, 1.0, 0],
    },
  ],
  enemies: [
    {
      id: "wide-enemy-1",
      typeId: "simple",
      centerPosition: [0.5, 0.8, 0],
    },
    {
      id: "wide-enemy-2",
      typeId: "simple",
      centerPosition: [2.4, -0.7, 0],
    },
  ],
  streams: [
    {
      id: "wide-stream-1",
      sourceId: "wide-swirl",
    },
  ],
  hazardEmitters: [
    {
      id: "wide-red-vent-1",
      typeId: "red-vent",
      position: [-0.9, 0.2, 0],
    },
  ],
  events: [
    {
      trigger: { type: "time", at: 7 },
      action: {
        type: "hazard:setEnabled",
        targetId: "wide-red-vent-1",
        enabled: false,
      },
    },
    {
      trigger: { type: "time", at: 11 },
      action: {
        type: "hazard:setEnabled",
        targetId: "wide-red-vent-1",
        enabled: true,
      },
    },
    {
      trigger: { type: "time", at: 2 },
      action: {
        type: "stream:setForceEnabled",
        enabled: false,
      },
    },
    {
      trigger: { type: "enemy:defeated", targetId: "wide-enemy-1" },
      action: {
        type: "stream:setForceEnabled",
        enabled: true,
      },
    },
  ],
};

export const stageDefinitions: readonly StageDefinition[] = [
  demoStageDefinition,
  wideStageDefinition,
];
