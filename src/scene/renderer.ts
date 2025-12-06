import type { Scene } from "./scene";
import type { CameraComponent } from "./camera";
import { MeshRenderer } from "./meshRenderer";
import type { FBO } from "../gl/frameBuffer";

export class Renderer{
    private gl: WebGLRenderingContext | WebGL2RenderingContext;
    constructor(gl: WebGLRenderingContext | WebGL2RenderingContext){
        this.gl = gl;
    }

    render(scene: Scene, camera: CameraComponent, targetFBO: FBO | null = null){
        const gl = this.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, targetFBO? targetFBO.fbo : null);
        const width = targetFBO? targetFBO.width : gl.drawingBufferWidth;
        const height = targetFBO? targetFBO.height: gl.drawingBufferHeight;
        gl.viewport(0, 0, width, height);
        gl.enable(gl.DEPTH_TEST);
        gl.depthMask(true);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const objects = scene.getObjects();
        for(const obj of objects){
            if(!obj.active) continue;
            const mr = obj.getComponent(MeshRenderer);
            if(!mr || !mr.enabled) continue;
            if((obj.layer & camera.cullingMask) == 0) continue;
            mr.render(camera);
        }
    }
}