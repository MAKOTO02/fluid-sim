import type { Component } from "./component";
import type { Mesh } from "./mesh";

export class MeshFilter implements Component{
    enabled = true;
    mesh: Mesh | null;

    constructor(mesh: Mesh | null){
        this.mesh = mesh;
    }

    start(): void {
    // とくに何もしない想定だが、後で差し替えてもOK
    }

    update(dt: number): void {
        // MeshFilter 自体は毎フレームすることはないので空でOK
    }

    onAttach?(): void {}
    onDetach?(): void {}

    setMesh(mesh: Mesh | null) {
        this.mesh = mesh;
    }
}