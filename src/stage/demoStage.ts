import type { FluidSim } from "../fluid/fluidSim";
import type { GameInput } from "../input/inputController";
import type { GameObject } from "../scene/gameObject";
import type { IMaterial } from "../scene/material";
import { createDemoEnemy } from "../scene/enemyFactory";
import { createPlayer } from "../scene/playerFactory";
import { PlayerShooting } from "../scene/playerShooting";
import type { Scene } from "../scene/scene";

export type GameStage = {
  player: GameObject;
  enemies: GameObject[];
};

export function createDemoStage(args: {
  scene: Scene;
  gl: WebGLRenderingContext | WebGL2RenderingContext;
  canvas: HTMLCanvasElement;
  material: IMaterial;
  fluidSim: FluidSim;
  input: GameInput;
}): GameStage {
  const { scene, gl, canvas, material, fluidSim, input } = args;

  const { player, splatForce } = createPlayer({
    scene,
    gl,
    canvas,
    material,
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
  };
}
