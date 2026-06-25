import { vec3 } from "gl-matrix";
import type { StreamFieldMap } from "../fluid/streamFieldMap";
import type { Component } from "./component";
import type { GameObject } from "./gameObject";
import { createInkZone } from "./inkZoneFactory";
import type { InkZoneConfig } from "./inkZone";
import type { InkZoneRegistry } from "./inkZoneRegistry";
import type { IMaterial } from "./material";
import type { PlayerInk } from "./playerInk";
import type { Scene } from "./scene";

export type ProjectileInkTrailConfig = {
  intervalSec: number;
  inkCost: number;
  maxZones: number;
  zoneConfig: Partial<InkZoneConfig>;
};

export class ProjectileInkTrail implements Component {
  enabled = true;
  owner?: GameObject;

  private readonly gl: WebGLRenderingContext | WebGL2RenderingContext;
  private readonly scene: Scene;
  private readonly material: IMaterial;
  private readonly streamFieldMap: StreamFieldMap;
  private readonly registry: InkZoneRegistry;
  private readonly playerInk: PlayerInk;
  private readonly config: ProjectileInkTrailConfig;
  private elapsed = 0;
  private spawnedZones = 0;

  constructor(args: {
    gl: WebGLRenderingContext | WebGL2RenderingContext;
    scene: Scene;
    material: IMaterial;
    streamFieldMap: StreamFieldMap;
    registry: InkZoneRegistry;
    playerInk: PlayerInk;
    config: ProjectileInkTrailConfig;
  }) {
    this.gl = args.gl;
    this.scene = args.scene;
    this.material = args.material;
    this.streamFieldMap = args.streamFieldMap;
    this.registry = args.registry;
    this.playerInk = args.playerInk;
    this.config = args.config;
  }

  update(dt: number): void {
    if (!this.owner) return;
    if (this.spawnedZones >= this.config.maxZones) return;

    this.elapsed += dt;
    while (this.elapsed >= this.config.intervalSec && this.spawnedZones < this.config.maxZones) {
      this.elapsed -= this.config.intervalSec;
      this.spawnInkZone();
    }
  }

  private spawnInkZone(): void {
    if (!this.owner) return;
    if (!this.playerInk.has(this.config.inkCost)) return;

    this.playerInk.consume(this.config.inkCost);
    this.spawnedZones += 1;

    createInkZone({
      gl: this.gl,
      scene: this.scene,
      material: this.material,
      streamFieldMap: this.streamFieldMap,
      registry: this.registry,
      position: vec3.clone(this.owner.transform.getWorldPosition()),
      config: this.config.zoneConfig,
    });
  }
}
