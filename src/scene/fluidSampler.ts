import type { Component } from "./component";
import type { GameObject } from "./gameObject";
import type { FluidSim } from "../fluid/fluidSim";
import { vec3 } from "gl-matrix";

export type LogicSample = { r: number; g: number; b: number; a: number };

// The handler decides how sampled color affects gameplay.
export type FluidEffectHandler = (
    sample: LogicSample,
    dt: number,
    owner: GameObject
) => void;

// Converts Transform.position to UV coordinates.
export type WorldToUVFunc = (pos: vec3) => { u: number; v: number };

export class FluidSampler implements Component {
    enabled = true;
    owner?: GameObject;

    private fluid: FluidSim;
    private worldToUV: WorldToUVFunc;
    private handler: FluidEffectHandler;
    private sampleIntervalSec: number;
    private elapsed = 0;
    private lastSample: LogicSample = { r: 0, g: 0, b: 0, a: 0 };

    constructor(
        fluid: FluidSim,
        worldToUV: WorldToUVFunc,
        handler: FluidEffectHandler,
        sampleIntervalSec = 0
    ) {
        this.fluid = fluid;
        this.worldToUV = worldToUV;
        this.handler = handler;
        this.sampleIntervalSec = Math.max(0, sampleIntervalSec);
    }

    start?(): void {
        // Nothing to initialize.
    }

    onAttach?(): void {

    }

    update?(dt: number): void {
        if (!this.enabled || !this.owner) return;
        const transform = this.owner.transform;
        if (!transform) return;

        this.elapsed += dt;
        if (this.sampleIntervalSec <= 0 || this.elapsed >= this.sampleIntervalSec) {
            this.elapsed = 0;
            const pos = transform.getWorldPosition();
            const { u, v } = this.worldToUV(pos);

            const c = this.fluid.sampleLogic(u, v);
            this.lastSample = { r: c.r, g: c.g, b: c.b, a: c.a };
        }

        // Apply the concrete effect here.
        this.handler(this.lastSample, dt, this.owner);
    }

    onDetach?(): void {
        // Nothing to release.
    }
}
