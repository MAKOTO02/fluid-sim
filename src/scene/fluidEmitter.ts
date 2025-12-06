import type { Component } from "./component";
import type { GameObject } from "./gameObject";
import type { FluidSim } from "../fluid/fluidSim";
import { vec2 } from "gl-matrix";
import type { Scene } from "./scene";
import { RigidBody } from "./rigidBody";

type SplatColor = { r: number; g: number; b: number; a?: number };

export class FluidEmitter implements Component {
  strength: number;
  color : SplatColor
  logicColor?: SplatColor
  private scene : Scene;
  private fluidSim: FluidSim;
  private canvas: HTMLCanvasElement;
  private prevUV: vec2 = vec2.create();
  private initialized = false;
  private logicSplat: boolean;
  private rb: RigidBody | null = null;

  enabled: boolean = true;
  owner?: GameObject;
  
  
  constructor(scene: Scene, fluidSim: FluidSim, canvas: HTMLCanvasElement, 
    strength = 1.0, 
    color: { r: number, g: number, b: number , a?: number} = { r: 1, g: 0, b: 0 , a: 1}, 
    logicSplat = false,
    logicColor: SplatColor | null = null
){
    this.scene = scene;
    this.fluidSim = fluidSim;
    this.canvas = canvas;
    this.logicSplat = logicSplat;
    this.strength = strength;
    this.color = color;
    this.logicColor = logicColor ?? undefined;
  }

  start(): void {
    // ここで一度だけ位置から prevUV を初期化しておくと安全
    if (!this.owner) return;
    const cam = this.scene.MainCamera;
    if (!cam) return;

    const uv = cam.worldToScreenUV(this.owner.transform.getWorldPosition());
    vec2.set(this.prevUV, uv.u, uv.v);
    this.initialized = true;

    this.rb = this.owner.getComponent(RigidBody);
  }

  update(dt: number) {
    if(!this.owner || !this.enabled) return;
    const camera = this.scene.MainCamera;
    if(!camera) return;
    const uv = camera.worldToScreenUV(this.owner.transform.getWorldPosition());
    const curUV = vec2.fromValues(uv.u, uv.v);

    if (!this.initialized) {
      vec2.copy(this.prevUV, curUV);
      this.initialized = true;
      return;
    }

    let dx: number;
    let dy: number;

    const rb = this.rb;
    if(rb){
        const scale = this.strength * dt;
        dx = rb.velocity[0] * scale;
        dy = rb.velocity[1] * scale;
    }else{
        dx = (curUV[0] - this.prevUV[0]) * this.strength;
        dy = (curUV[1] - this.prevUV[1]) * this.strength;
    }

    if (
        curUV[0] >= 0 && curUV[0] <= 1 &&
        curUV[1] >= 0 && curUV[1] <= 1
    ) {
        this.fluidSim.splat(curUV[0], curUV[1], dx, dy, this.color, this.canvas);
        if(this.logicSplat){
            const color = this.logicColor? this.logicColor : this.color;
            this.fluidSim.logicSplat(curUV[0], curUV[1], color, this.canvas)
        }
    }

    vec2.copy(this.prevUV, curUV);;
  }

  onAttach?(): void {}
  onDetach?(): void {}
}
