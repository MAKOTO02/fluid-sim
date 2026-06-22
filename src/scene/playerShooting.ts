import { vec3 } from "gl-matrix";
import type { FluidSim } from "../fluid/fluidSim";
import type { IMaterial } from "./material";
import type { GameObject } from "./gameObject";
import { createProjectileSphereLocal } from "./projectileActor";
import { makeStraightPath } from "./projectileLocalPath";
import type { Scene } from "./scene";

export type PlayerShootingHandle = {
  dispose(): void;
};

export function setupPlayerShooting(args: {
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext | WebGL2RenderingContext;
  scene: Scene;
  player: GameObject;
  material: IMaterial;
  fluidSim: FluidSim;
  splatForce: number;
}): PlayerShootingHandle {
  const { canvas, gl, scene, player, material, fluidSim, splatForce } = args;

  const onClick = (e: MouseEvent) => {
    const cam = scene.MainCamera;
    if (!cam) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const uClick = x / rect.width;
    const vClick = 1 - (y / rect.height);

    const playerPos = player.transform.getWorldPosition();
    const clickWorld = cam.screenUVToWorldOnPlane(uClick, vClick, playerPos[2]);
    if (!clickWorld) return;

    const dir = vec3.create();
    vec3.sub(dir, clickWorld, playerPos);
    const len = vec3.length(dir);
    if (len === 0) return;

    const speed = 3.0;
    const localPath = makeStraightPath(dir, speed);

    const bullet = createProjectileSphereLocal(gl, scene, {
      radius: 0.04,
      material,
      colliderLayer: "bullet",
      hitLayers: ["enemy"],
      lifeSec: 5.0,
      localPath,
      name: "PlayerBullet",
      fluid: {
        enabled: true,
        fluidSim,
        canvas,
        strength: splatForce,
        color: { r: 0, g: 1, b: 0 },
      },
    });

    bullet.transform.setPosition(playerPos);
  };

  canvas.addEventListener("click", onClick);

  return {
    dispose() {
      canvas.removeEventListener("click", onClick);
    },
  };
}
