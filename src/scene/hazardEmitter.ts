import type { FluidSim } from "../fluid/fluidSim";
import type { HazardEmitterConfig } from "../stage/hazardEmitterCatalog";
import type { Component } from "./component";
import type { GameObject } from "./gameObject";
import type { Scene } from "./scene";

export class HazardEmitter implements Component {
  enabled = true;
  owner?: GameObject;
  private elapsed = 0;
  private readonly scene: Scene;
  private readonly fluidSim: FluidSim;
  private readonly canvas: HTMLCanvasElement;
  private readonly config: HazardEmitterConfig;

  constructor(
    scene: Scene,
    fluidSim: FluidSim,
    canvas: HTMLCanvasElement,
    config: HazardEmitterConfig
  ) {
    this.scene = scene;
    this.fluidSim = fluidSim;
    this.canvas = canvas;
    this.config = config;
  }

  update(dt: number): void {
    if (!this.enabled || !this.owner) return;

    this.elapsed += dt;
    if (this.elapsed < this.config.intervalSec) return;
    this.elapsed = 0;

    const camera = this.scene.MainCamera;
    if (!camera) return;

    const uv = camera.worldToScreenUV(this.owner.transform.getWorldPosition());
    if (uv.u < 0 || uv.u > 1 || uv.v < 0 || uv.v > 1) return;

    this.fluidSim.splat(
      uv.u,
      uv.v,
      0,
      this.config.strength,
      this.config.visualColor,
      this.canvas
    );
    this.fluidSim.logicSplat(uv.u, uv.v, this.config.logicColor, this.canvas);
  }
}
