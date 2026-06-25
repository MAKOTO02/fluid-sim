import { vec3 } from "gl-matrix";
import type { StreamFieldMap } from "../fluid/streamFieldMap";
import type { Component } from "./component";
import type { GameObject } from "./gameObject";
import type { Scene } from "./scene";

export type InkZoneConfig = {
  initialRadius: number;
  lifeSec: number;
  decayRate: number;
  minStrength: number;
  streamInfluence: number;
};

export class InkZone implements Component {
  enabled = true;
  owner?: GameObject;

  private readonly scene: Scene;
  private readonly streamFieldMap: StreamFieldMap;
  private readonly config: InkZoneConfig;
  private readonly baseScale = vec3.create();
  private life: number;
  private strength = 1;

  constructor(scene: Scene, streamFieldMap: StreamFieldMap, config: InkZoneConfig) {
    this.scene = scene;
    this.streamFieldMap = streamFieldMap;
    this.config = config;
    this.life = config.lifeSec;
  }

  onAttach(): void {
    if (!this.owner) return;

    vec3.set(this.baseScale, this.config.initialRadius, this.config.initialRadius, this.config.initialRadius);
    this.owner.transform.setScale(this.baseScale);
  }

  update(dt: number): void {
    if (!this.owner) return;

    this.life -= dt;
    this.strength *= Math.exp(-this.config.decayRate * dt);

    if (this.life <= 0 || this.strength <= this.config.minStrength) {
      this.owner.destroy();
      return;
    }

    this.applyStreamMotion(dt);
    this.updateVisualScale();
  }

  private applyStreamMotion(dt: number): void {
    if (!this.owner) return;

    const cam = this.scene.MainCamera;
    if (!cam) return;

    const position = this.owner.transform.getWorldPosition();
    const uv = cam.worldToScreenUV(position);
    const flow = this.streamFieldMap.sample(uv.u, uv.v);
    const offset = vec3.fromValues(
      flow.x * this.config.streamInfluence * dt,
      flow.y * this.config.streamInfluence * dt,
      0
    );

    this.owner.transform.translate(offset);
  }

  private updateVisualScale(): void {
    if (!this.owner) return;

    const scale = vec3.fromValues(
      this.baseScale[0] * this.strength,
      this.baseScale[1] * this.strength,
      this.baseScale[2] * this.strength
    );
    this.owner.transform.setScale(scale);
  }
}
