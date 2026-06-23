import { vec3 } from "gl-matrix";
import type { FluidSim } from "../fluid/fluidSim";
import type { MovementInput } from "../input/inputController";
import type { IMaterial } from "./material";
import { createSphereActor } from "./actor";
import { FluidDrag } from "./fluidDrag";
import { FluidEmitter } from "./fluidEmitter";
import { GameObject } from "./gameObject";
import { Health } from "./health";
import { PlayerController } from "./playerController";
import { RigidBody } from "./rigidBody";
import { ScreenBoundsLimiter } from "./screenBoundsLimiter";
import type { Scene } from "./scene";

const SPLAT_FORCE = 2000;
const PLAYER_HEALTH_CONFIG = {
  max: 100,
} as const;

export type PlayerSetup = {
  player: GameObject;
  splatForce: number;
};

export function createPlayer(args: {
  scene: Scene;
  gl: WebGLRenderingContext | WebGL2RenderingContext;
  canvas: HTMLCanvasElement;
  material: IMaterial;
  fluidSim: FluidSim;
  input: MovementInput;
}): PlayerSetup {
  const { scene, gl, canvas, material, fluidSim, input } = args;

  const player = createSphereActor(gl, scene, {
    radius: 0.05,
    material,
    layer: "player",
    hitScale: 0.3,
    name: "Player",
  });

  const playerController = new PlayerController(input, 50, 1, 20);
  const rb = new RigidBody(10);
  rb.freezePosZ = true;
  const fluidDrag = new FluidDrag(scene, fluidSim, 0.05);
  player.addComponent(new Health(PLAYER_HEALTH_CONFIG.max));
  player.addComponent(playerController);
  player.addComponent(rb);
  player.addComponent(fluidDrag);
  player.addComponent(new ScreenBoundsLimiter(scene, 0.01));

  const emitter = new GameObject("emitter");
  const fluidEmitter = new FluidEmitter(
    scene,
    fluidSim,
    canvas,
    SPLAT_FORCE,
    { r: 0, g: 0, b: 0.5 }
  );

  emitter.addComponent(fluidEmitter);
  emitter.transform.setParent(player.transform);

  player.transform.translate(vec3.fromValues(-2, -1.5, 0));
  scene.addObject(emitter);

  return { player, splatForce: SPLAT_FORCE };
}
