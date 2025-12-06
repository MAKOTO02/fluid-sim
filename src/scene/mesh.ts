export type Vertex3D = {
    pos: [number, number, number];
    uv?: [number, number];
    //normal?: [number, number, number];
    //tangent?: [number, number, number];
}

export class Mesh{
    readonly vertices: Vertex3D[];
    readonly indices?: number[];
    constructor(vertices: Vertex3D[], indices?: number[]){
        this.vertices = vertices;
        this.indices = indices;
    }
}