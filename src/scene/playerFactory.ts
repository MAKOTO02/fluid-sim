import { vec3 } from "gl-matrix";
import type { FluidSim } from "../fluid/fluidSim";
import type { MovementInput } from "../input/inputController";
import type { IMaterial } from "./material";
import { createQuadVisualObject } from "./actor";
import { SphereCollider } from "./collider";
import { FluidDrag } from "./fluidDrag";
import { FluidEmitter } from "./fluidEmitter";
import { FluidSampler, type LogicSample } from "./fluidSampler";
import { GameObject } from "./gameObject";
import { Health } from "./health";
import { PlayerInk } from "./playerInk";
import { PLAYER_FLUID_INK_COLOR } from "./playerInkColor";
import { PlayerController } from "./playerController";
import { RigidBody } from "./rigidBody";
import { ScreenBoundsLimiter } from "./screenBoundsLimiter";
import { SceneLayers } from "./layers";
import type { Scene } from "./scene";

const SPLAT_FORCE = 2000;
const PLAYER_HIT_RADIUS = 0.015;
const PLAYER_VISUAL_SIZE = 0.4;
const PLAYER_HEALTH_CONFIG = {
  max: 100,
} as const;
const PLAYER_INK_CONFIG = {
  max: 100,
} as const;
const HAZARD_LOGIC_SAMPLE_INTERVAL_SEC = 0.08;
const HAZARD_RED_THRESHOLD = 0.12;
const HAZARD_DAMAGE_PER_SECOND = 8;

export type PlayerSetup = {
  player: GameObject;
  splatForce: number;
};

export function createPlayer(args: {
  scene: Scene;
  gl: WebGLRenderingContext | WebGL2RenderingContext;
  canvas: HTMLCanvasElement;
  visualMaterial: IMaterial;
  fluidSim: FluidSim;
  input: MovementInput;
  position?: [number, number, number];
}): PlayerSetup {
  const { scene, gl, canvas, visualMaterial, fluidSim, input, position = [-2, -1.5, 0] } = args;

  const player = new GameObject("Player");
  player.addComponent(new SphereCollider(scene, PLAYER_HIT_RADIUS, "player", true));
  scene.addObject(player);

  const playerController = new PlayerController(input, 60, 1, 20);
  const rb = new RigidBody(10);
  rb.freezePosZ = true;
  const fluidDrag = new FluidDrag(scene, fluidSim, 0.05);
  player.addComponent(new Health(PLAYER_HEALTH_CONFIG.max));
  player.addComponent(new PlayerInk(PLAYER_INK_CONFIG.max));
  player.addComponent(playerController);
  player.addComponent(rb);
  player.addComponent(fluidDrag);
  player.addComponent(new FluidSampler(
    fluidSim,
    (pos) => {
      const camera = scene.MainCamera;
      if (!camera) return { u: -1, v: -1 };
      return camera.worldToScreenUV(pos);
    },
    applyHazardLogicDamage,
    HAZARD_LOGIC_SAMPLE_INTERVAL_SEC
  ));
  player.addComponent(new ScreenBoundsLimiter(scene, 0.01));

  const visual = createQuadVisualObject(gl, scene, {
    material: visualMaterial,
    size: PLAYER_VISUAL_SIZE,
    name: "PlayerVisual",
    layer: SceneLayers.default,
  });
  visual.transform.setParent(player.transform);
  visual.transform.setPosition(vec3.fromValues(0, 0, 0.02));

  const emitter = new GameObject("emitter");
  const fluidEmitter = new FluidEmitter(
    scene,
    fluidSim,
    canvas,
    SPLAT_FORCE,
    PLAYER_FLUID_INK_COLOR
  );

  emitter.addComponent(fluidEmitter);
  emitter.transform.setParent(player.transform);

  player.transform.translate(vec3.fromValues(...position));
  scene.addObject(emitter);

  return { player, splatForce: SPLAT_FORCE };
}

function applyHazardLogicDamage(sample: LogicSample, dt: number, player: GameObject): void {
  const redDominance = Math.max(0, sample.r - Math.max(sample.g, sample.b));
  const hazardAmount = Math.max(0, redDominance - HAZARD_RED_THRESHOLD);
  if (hazardAmount <= 0) return;

  player.getComponent(Health)?.applyDamage(hazardAmount * HAZARD_DAMAGE_PER_SECOND * dt);
}
