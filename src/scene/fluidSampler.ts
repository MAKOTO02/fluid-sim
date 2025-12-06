import type { Component } from "./component";
import type { GameObject } from "./gameObject";
import type { FluidSim } from "../fluid/fluidSim";
import { vec3 } from "gl-matrix";

export type LogicSample = { r: number; g: number; b: number; a: number };

// 色→どう影響するかはこのハンドラに任せる
export type FluidEffectHandler = (
    sample: LogicSample,
    dt: number,
    owner: GameObject
) => void;

// Transform.position -> UV に変換する関数
export type WorldToUVFunc = (pos: vec3) => { u: number; v: number };

export class FluidSampler implements Component {
    enabled = true;
    owner?: GameObject;

    private fluid: FluidSim;
    private worldToUV: WorldToUVFunc;
    private handler: FluidEffectHandler;

    constructor(
        fluid: FluidSim,
        worldToUV: WorldToUVFunc,
        handler: FluidEffectHandler
    ) {
        this.fluid = fluid;
        this.worldToUV = worldToUV;
        this.handler = handler;
    }

    start?(): void {
        // 特になし
    }

    onAttach?(): void {

    }

    update?(dt: number): void {
        if (!this.enabled || !this.owner) return;
        const transform = this.owner.transform;
        if (!transform) return;

        const pos = transform.getWorldPosition();
        const { u, v } = this.worldToUV(pos);

        const c = this.fluid.sampleLogic(u, v);
        const sample: LogicSample = { r: c.r, g: c.g, b: c.b, a: c.a };

        // ここで具体的な効果を適用する
        this.handler(sample, dt, this.owner);
    }

    onDetach?(): void {
        // 特になし
    }
}
