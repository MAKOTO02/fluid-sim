import { vec3 } from "gl-matrix";
import type { FluidSim } from "../fluid/fluidSim";
import type { ShootingInput } from "../input/inputController";
import type { Component } from "./component";
import type { IMaterial } from "./material";
import type { GameObject } from "./gameObject";
import { createProjectileSphereLocal } from "./projectileActor";
import { makeStraightPath } from "./projectileLocalPath";
import { Projectile } from "./projectile";
import type { Scene } from "./scene";

const MAX_ACTIVE_PLAYER_BULLETS = 6;

export class PlayerShooting implements Component {
  enabled = true;
  owner?: GameObject;

  private readonly gl: WebGLRenderingContext | WebGL2RenderingContext;
  private readonly scene: Scene;
  private readonly input: ShootingInput;
  private readonly material: IMaterial;
  private readonly fluidSim: FluidSim;
  private readonly canvas: HTMLCanvasElement;
  private readonly splatForce: number;
  private readonly activeBullets = new Set<GameObject>();

  constructor(args: {
    gl: WebGLRenderingContext | WebGL2RenderingContext;
    scene: Scene;
    input: ShootingInput;
    material: IMaterial;
    fluidSim: FluidSim;
    canvas: HTMLCanvasElement;
    splatForce: number;
  }) {
    this.gl = args.gl;
    this.scene = args.scene;
    this.input = args.input;
    this.material = args.material;
    this.fluidSim = args.fluidSim;
    this.canvas = args.canvas;
    this.splatForce = args.splatForce;
  }

  update() {
    if (!this.owner || !this.enabled) return;

    const commands = this.input.consumeShootCommands();
    for (const command of commands) {
      this.shootAt(command.u, command.v);
    }
  }

  private shootAt(u: number, v: number) {
    if (!this.owner) return;
    if (this.activeBullets.size >= MAX_ACTIVE_PLAYER_BULLETS) return;

    const cam = this.scene.MainCamera;
    if (!cam) return;

    const playerPos = this.owner.transform.getWorldPosition();
    const clickWorld = cam.screenUVToWorldOnPlane(u, v, playerPos[2]);
    if (!clickWorld) return;

    const dir = vec3.create();
    vec3.sub(dir, clickWorld, playerPos);
    const len = vec3.length(dir);
    if (len === 0) return;

    const speed = 3.0;
    const localPath = makeStraightPath(dir, speed);

    const bullet = createProjectileSphereLocal(this.gl, this.scene, {
      radius: 0.04,
      material: this.material,
      colliderLayer: "playerBullet",
      hitLayers: ["enemy", "wall"],
      lifeSec: 5.0,
      localPath,
      name: "PlayerBullet",
      fluid: {
        enabled: true,
        fluidSim: this.fluidSim,
        canvas: this.canvas,
        strength: this.splatForce,
        color: { r: 0, g: 1, b: 0 },
      },
    });

    this.activeBullets.add(bullet);
    const projectile = bullet.getComponent(Projectile);
    if (projectile) {
      projectile.onDestroyed = () => {
        this.activeBullets.delete(bullet);
      };
    }

    bullet.transform.setPosition(playerPos);
  }
}
