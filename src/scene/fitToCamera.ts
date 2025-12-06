import type { Component } from "./component";
import type { GameObject } from "./gameObject";
import type { CameraComponent } from "./camera";
import { vec3 } from "gl-matrix";

export class FitToCamera implements Component{
    enabled = true;
    owner?: GameObject;

    private camera: CameraComponent;
    private dist: number;
    private follow: boolean;

    constructor(cam: CameraComponent, dist = 1.0, follow = false){
        this.camera = cam;
        this.dist = dist;
        this.follow = follow;
    }

    start(): void {
        if(!this.owner || !this.camera.owner) return;
        if(this.follow) this.owner.transform.setParent(this.camera.owner.transform);
        this.updateLocalTransform();
    }

    update(dt: number): void {

    }

    updateLocalTransform() {
        if (!this.owner || !this.camera.owner) return;

        const fov = this.camera.getFov();      // rad
        const aspect = this.camera.getAspect();
        const camPos = this.camera.owner.transform.getWorldPosition();

        if(this.follow){
            const H = 2 * this.dist * Math.tan(fov / 2);
            const W = H * aspect;

            // カメラローカルで前方 dist の位置
            this.owner.transform.setPosition(vec3.fromValues(0, 0, -this.dist));
            this.owner.transform.setScale(vec3.fromValues(W, H, 1));
        }else{
            const PlaneZ = camPos[2] - this.dist;

            const H = 2 * this.dist * Math.tan(fov / 2); // 高さ
            const W = H * aspect;                   // 幅

            // カメラローカル：前方 dist の位置に貼り付け
            this.owner.transform.setPosition(vec3.fromValues(camPos[0], camPos[1], PlaneZ));
            this.owner.transform.setScale(vec3.fromValues(W, H, 1));
        }
    }
}