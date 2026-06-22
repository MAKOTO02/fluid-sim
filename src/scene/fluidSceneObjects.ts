import { vec3 } from "gl-matrix";
import type { Program } from "../gl/program";
import type { FluidSim } from "../fluid/fluidSim";
import type { CameraComponent } from "./camera";
import { FitToCamera } from "./fitToCamera";
import { GameObject } from "./gameObject";
import type { IMaterial } from "./material";
import type { Mesh } from "./mesh";
import { MeshFilter } from "./meshFilter";
import { MeshRenderer } from "./meshRenderer";
import { createQuad } from "./primitives";
import type { Scene } from "./scene";
import { DyeVisualMaterial } from "./materials/dyeVisualMaterial";
import { UnlitTextureMaterial } from "./materials/unlitTexMaterial";

export type FluidPlaneObject = {
  fluidPlane: GameObject;
  dyeVisualMaterial: DyeVisualMaterial;
  fitter: FitToCamera;
};

export function createFluidPlaneObject(args: {
  scene: Scene;
  gl: WebGLRenderingContext | WebGL2RenderingContext;
  camera: CameraComponent;
  mesh: Mesh;
  program: Program;
  fluidSim: FluidSim;
  layer: number;
}): FluidPlaneObject {
  const { scene, gl, camera, mesh, program, fluidSim, layer } = args;

  const fluidPlane = new GameObject("Quad");
  fluidPlane.layer = layer;
  const dyeVisualMaterial = new DyeVisualMaterial(
    program,
    fluidSim.getDyeTexture(),
    fluidSim.getVelTexture()
  );
  const fitter = new FitToCamera(camera, 5, false);
  fluidPlane.addComponent(new MeshFilter(mesh));
  fluidPlane.addComponent(new MeshRenderer(gl, dyeVisualMaterial));
  fluidPlane.addComponent(fitter);
  scene.addObject(fluidPlane);

  return { fluidPlane, dyeVisualMaterial, fitter };
}

export function createObstacleObject(args: {
  scene: Scene;
  gl: WebGLRenderingContext | WebGL2RenderingContext;
  mesh: Mesh;
  material: IMaterial;
  layer: number;
}): GameObject {
  const { scene, gl, mesh, material, layer } = args;

  const obstacle = new GameObject("obstacle");
  obstacle.layer = layer;
  obstacle.addComponent(new MeshFilter(mesh));
  obstacle.addComponent(new MeshRenderer(gl, material));
  obstacle.transform.setScale(vec3.fromValues(0.5, 0.5, 0.5));
  obstacle.transform.translate(vec3.fromValues(-2, -1.5, 0));

  scene.addObject(obstacle);
  return obstacle;
}

export function createStreamObject(args: {
  scene: Scene;
  gl: WebGLRenderingContext | WebGL2RenderingContext;
  program: Program;
  texture: WebGLTexture;
  layer: number;
}): GameObject {
  const { scene, gl, program, texture, layer } = args;

  const streamMesh = createQuad(9);
  const streamObj = new GameObject("stream");
  const streamTexMaterial = new UnlitTextureMaterial(program, texture);
  streamObj.addComponent(new MeshFilter(streamMesh));
  streamObj.addComponent(new MeshRenderer(gl, streamTexMaterial));
  streamObj.layer = layer;
  streamObj.transform.translate(vec3.fromValues(0, 0, 0));

  scene.addObject(streamObj);
  return streamObj;
}
