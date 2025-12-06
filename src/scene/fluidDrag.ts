import type { Component } from "./component";
import type { GameObject } from "./gameObject";
import type { Scene } from "./scene";
import type { FluidSim } from "../fluid/fluidSim";
import { vec3 } from "gl-matrix";
import { RigidBody } from "./rigidBody";

export class FluidDrag implements Component{
    enabled: boolean = true;
    owner?: GameObject;

    private scene: Scene;
    private fluid: FluidSim;
    private dragStrength: number;
    private rb: RigidBody | null = null;
    private waveFactor = 1.0;
    private _triedGetRb = false;

    constructor(scene: Scene, fluid: FluidSim, dragStrength = 0.01){
        this.scene = scene;
        this.fluid = fluid;
        this.dragStrength = dragStrength;
    }

    // WaveFactor 用のアップロード口
    setWaveFactor(f: number) {
        // 好きに clamp
        this.waveFactor = Math.max(0, Math.min(1, f));
    }

    start() : void{
        this.tryCacheRb();
    }

    update(dt: number): void{
        if(!this.enabled || !this.owner) return;
        const cam = this.scene.MainCamera;
        if(!cam) return;

        const rb = this.rb;
        if(!rb) return;

        if(this.fluid.getPaused()) return;

        const worldPos = this.owner.transform.getWorldPosition();
        const uv = cam.worldToScreenUV(worldPos);
        let u = uv.u;
        let v = uv.v;

        if(u<0 || u>1 || v<0 || v>1) return;
        const vel = this.fluid.sampleVelocity(u, v);
        let relX = vel.x - rb.velocity[0];
        let relY = vel.y - rb.velocity[1];

        const margin = 0.05; // 5% くらいの余白
        // 左端付近かつ左向きの力 → 打ち消す
        if (u < margin && relX < 0) relX = 0;
        // 右端付近かつ右向きの力
        if (u > 1 - margin && relX > 0) relX = 0;
        // 下端付近かつ下向き
        if (v < margin && relY < 0) relY = 0;
        // 上端付近かつ上向き
        if (v > 1 - margin && relY > 0) relY = 0;

        rb.addForce(
            vec3.fromValues(
                this.dragStrength * this.waveFactor * relX, 
                this.dragStrength * this.waveFactor * relY, 
                0)
        );
        
    }

    onAttach?(): void {
        this.tryCacheRb();
    }
    onDetach?(): void {}

    private tryCacheRb() {
        if (!this.owner || this.rb) return;
        const rb = this.owner.getComponent(RigidBody);
        if (!rb && !this._triedGetRb) {
            console.warn("FluidDrag: RigidBody が見つかりません");
            this._triedGetRb = true;
            return;
        }
        if (rb) {
            this.rb = rb;
            this._triedGetRb = true;
        }
    }
}