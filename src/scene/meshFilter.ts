import type { Component } from "./component";
import type { Mesh } from "./mesh";

export class MeshFilter implements Component{
    enabled = true;
    mesh: Mesh | null;

    constructor(mesh: Mesh | null){
        this.mesh = mesh;
    }

    start(): void {
    // No initialization needed for now.
    }

    update(_dt: number): void {
        // MeshFilter has no per-frame work.
    }

    onAttach?(): void {}
    onDetach?(): void {}

    setMesh(mesh: Mesh | null) {
        this.mesh = mesh;
    }
}
