import type { Program } from "../gl/program";
import type { CameraComponent } from "./camera";
import type { GameObject } from "./gameObject";

export interface IMaterial{
    readonly program: Program;

    bind(
        gl: WebGLRenderingContext | WebGL2RenderingContext,
        owner: GameObject,
        camera: CameraComponent,
    ): void;
}