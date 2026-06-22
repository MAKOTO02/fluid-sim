import { vec3 } from "gl-matrix";
import { CameraComponent } from "./camera";
import { GameObject } from "./gameObject";
import type { Scene } from "./scene";

export function createMainCamera(args: {
  scene: Scene;
  gl: WebGLRenderingContext | WebGL2RenderingContext;
  aspect: number;
  layer: number;
}): CameraComponent {
  const { scene, gl, aspect, layer } = args;

  const cameraObj = new GameObject("MainCamera");
  cameraObj.transform.translate(vec3.fromValues(0, 0, 5));
  const cameraComp = cameraObj.addComponent(
    new CameraComponent(gl, {
      fov: Math.PI / 4,
      aspect,
      near: 0.1,
      far: 1000,
      yaw: 0,
      pitch: 0,
    })
  );
  cameraComp.cullingMask = layer;
  scene.addObject(cameraObj);
  scene.setMainCamera(cameraComp);

  return cameraComp;
}
