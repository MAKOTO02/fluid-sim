import type { Component } from "./component";
import { MeshFilter } from "./meshFilter";
import type { Mesh } from "./mesh";
import type { GameObject } from "./gameObject";
import type { CameraComponent } from "./camera";
import type { IMaterial } from "./material";



export class MeshRenderer implements Component{
    enabled = true;
    owner?: GameObject;
    private gl: WebGLRenderingContext | WebGL2RenderingContext;
    private material: IMaterial;

    private vao: WebGLVertexArrayObject | null = null;
    private vbo: WebGLBuffer | null = null;
    private ibo: WebGLBuffer | null = null;

    private vertexCount = 0;
    private indexCount = 0;

    constructor(
        gl: WebGLRenderingContext | WebGL2RenderingContext,
        material: IMaterial,
    ){
        this.gl = gl;
        this.material = material;
    }

    start(): void{
        if (!this.owner) {
            console.warn("MeshRenderer: owner が設定されていません");
            return;
        }
        const meshFilter = this.owner.getComponent(MeshFilter);
        if (!meshFilter || !meshFilter.mesh) {
            console.warn("MeshRenderer: MeshFilter または mesh が設定されていません.");
            return;
        }

        this.initBuffers(meshFilter.mesh);
    }

    update(dt: number): void{
        // 何かする?
    }

    onAttach?(): void {}
    onDetach?(): void {
    // VAO / VBO / IBO の解放もここでできる
        const gl = this.gl as WebGL2RenderingContext;
        if (this.vao) {
            gl.deleteVertexArray(this.vao);
            this.vao = null;
        }
        if (this.vbo) {
            gl.deleteBuffer(this.vbo);
            this.vbo = null;
        }
        if (this.ibo) {
            gl.deleteBuffer(this.ibo);
            this.ibo = null;
        }
    }


    // --- helper ---
    private initBuffers(mesh: Mesh){
        const gl = this.gl as WebGL2RenderingContext;
        const verticesRaw = mesh.vertices;
        if (!verticesRaw || verticesRaw.length === 0) {
            console.warn("MeshRenderer: vertices が空です");
            return;
        }

        const hasUV = verticesRaw[0].uv !== undefined;

        const ATTR_POS = 3; // x,y,z
        const ATTR_UV = hasUV ? 2 : 0;
        const FLOAT_SIZE = 4;
        const TOTAL_ATTRS = ATTR_POS + ATTR_UV;
        const stride = TOTAL_ATTRS * FLOAT_SIZE;

        const flat = verticesRaw.flatMap(v =>
            hasUV ? [...v.pos, ...(v.uv as [number, number])] : [...v.pos]
        );
        const vertices = new Float32Array(flat);
        this.vertexCount = vertices.length / TOTAL_ATTRS;

        //console.log("initBuffers: vertexCount =", this.vertexCount);
        //console.log("initBuffers: verticesRaw.length =", verticesRaw.length);
        //console.log("initBuffers: hasUV =", hasUV, "stride =", stride);

        this.vao = gl.createVertexArray();
        this.vbo = gl.createBuffer();
        this.ibo = null;

        //console.log("initBuffers: vao =", this.vao, "vbo =", this.vbo);

        gl.bindVertexArray(this.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        // aPosition (vec3)
        let offset = 0;
        const locPos = gl.getAttribLocation(this.material.program.program, "aPosition");
        //console.log("initBuffers: locPos =", locPos);
        if (locPos >= 0) {
            gl.enableVertexAttribArray(locPos);
            gl.vertexAttribPointer(
                locPos,
                ATTR_POS,
                gl.FLOAT,
                false,
                stride,
                offset
            );
        }
        offset += ATTR_POS * FLOAT_SIZE;

        // aTexCoord (vec2, あれば)
        if (hasUV) {
            const locUV = gl.getAttribLocation(this.material.program.program, "aTexCoord");
            //console.log("initBuffers: locUV =", locUV);
            if (locUV >= 0) {
                gl.enableVertexAttribArray(locUV);
                gl.vertexAttribPointer(
                    locUV,
                    ATTR_UV,
                    gl.FLOAT,
                    false,
                    stride,
                    offset
                );
            }
            offset += ATTR_UV * FLOAT_SIZE;
        }

        // Index Buffer
        if (mesh.indices && mesh.indices.length > 0) {
            this.ibo = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
            gl.bufferData(
                gl.ELEMENT_ARRAY_BUFFER,
                new Uint16Array(mesh.indices),
                gl.STATIC_DRAW
            );
            this.indexCount = mesh.indices.length;
        }
        //console.log("initBuffers: indexCount =", this.indexCount);

        //console.log("initBuffers: gl.getError() =", gl.getError());

        gl.bindVertexArray(null);
    }

    public render(camera: CameraComponent): void{
        const gl = this.gl as WebGL2RenderingContext;
        if(!this.vao || !this.owner) return;

       this.material.bind(gl, this.owner, camera);
        gl.bindVertexArray(this.vao);

        if(this.ibo && this.indexCount > 0){
            gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);
        }else if(this.vertexCount > 0){
            gl.drawArrays(gl.TRIANGLES, 0, this.vertexCount);   
        }

        gl.bindVertexArray(null);
    }
}