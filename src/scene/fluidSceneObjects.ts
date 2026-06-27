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
import { BoxCollider } from "./collider";
import { Health } from "./health";
import { Shelter } from "./shelter";
import type { StreamSource } from "../fluid/streamSource";
import { StreamSourceComponent } from "./streamSourceComponent";
import type { ShelterConfig } from "../stage/shelterCatalog";

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

export function createShelterObject(args: {
  scene: Scene;
  gl: WebGLRenderingContext | WebGL2RenderingContext;
  mesh: Mesh;
  material: IMaterial;
  config: ShelterConfig;
  position: [number, number, number];
  layer: number;
  onShelterChanged?: () => void;
}): GameObject {
  const { scene, gl, mesh, material, config, position, layer, onShelterChanged } = args;

  const shelter = new GameObject(config.name);
  shelter.layer = layer;
  shelter.addComponent(new MeshFilter(mesh));
  shelter.addComponent(new MeshRenderer(gl, material));
  shelter.addComponent(new BoxCollider(scene, vec3.fromValues(...config.colliderHalfExtents), "wall", true));
  shelter.addComponent(new Health(config.health));
  shelter.addComponent(new Shelter({
    onDestroyed: onShelterChanged,
    recoveryPerSecond: config.recoveryPerSecond,
    inkRecoveryPerSecond: config.inkRecoveryPerSecond,
  }));
  shelter.transform.setScale(vec3.fromValues(...config.visualScale));
  shelter.transform.translate(vec3.fromValues(...position));

  scene.addObject(shelter);
  return shelter;
}

export function createStreamObject(args: {
  scene: Scene;
  gl: WebGLRenderingContext | WebGL2RenderingContext;
  program: Program;
  texture: WebGLTexture;
  source: StreamSource;
  layer: number;
}): GameObject {
  const { scene, gl, program, texture, source, layer } = args;

  const streamMesh = createQuad(9);
  const streamObj = new GameObject("stream");
  const streamTexMaterial = new UnlitTextureMaterial(program, texture);
  streamObj.addComponent(new StreamSourceComponent(source));
  streamObj.addComponent(new MeshFilter(streamMesh));
  streamObj.addComponent(new MeshRenderer(gl, streamTexMaterial));
  streamObj.layer = layer;
  streamObj.transform.translate(vec3.fromValues(0, 0, 0));

  scene.addObject(streamObj);
  return streamObj;
}
