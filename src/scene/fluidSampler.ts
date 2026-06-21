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
        // Nothing to initialize.
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

        // Apply the concrete effect here.
        this.handler(sample, dt, this.owner);
    }

    onDetach?(): void {
        // Nothing to release.
    }
}
