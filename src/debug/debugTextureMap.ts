import { vec3 } from "gl-matrix";
import type { FluidSim } from "../fluid/fluidSim";
import type { Program } from "../gl/program";
import { GameObject } from "../scene/gameObject";
import type { IMaterial } from "../scene/material";
import { MeshFilter } from "../scene/meshFilter";
import { MeshRenderer } from "../scene/meshRenderer";
import { UnlitTextureMaterial } from "../scene/materials/unlitTexMaterial";
import { createQuad } from "../scene/primitives";
import type { Scene } from "../scene/scene";

export type DebugTextureMap = {
  obstaclePreview: GameObject;
  streamPreview: GameObject;
  updateTextures(): void;
};

export function createDebugTextureMap(args: {
  scene: Scene;
  gl: WebGLRenderingContext | WebGL2RenderingContext;
  program: Program;
  frameMaterial: IMaterial;
  fluidSim: FluidSim;
  layer: number;
}): DebugTextureMap {
  const { scene, gl, program, frameMaterial, fluidSim, layer } = args;
  const aspect = fluidSim.getObstacleTarget().width / fluidSim.getObstacleTarget().height;
  const previewHeight = 0.45;
  const previewScale = vec3.fromValues(previewHeight * aspect, previewHeight, 1);

  const obstacleMaterial = new UnlitTextureMaterial(
    program,
    fluidSim.getObstacleTarget().texture
  );
  const streamMaterial = new UnlitTextureMaterial(
    program,
    fluidSim.getStreamTarget().texture
  );

  const obstaclePreview = createPreviewQuad({
    scene,
    gl,
    material: obstacleMaterial,
    frameMaterial,
    name: "ObstaclePreview",
    layer,
    position: vec3.fromValues(1.45, 1.15, 1.0),
    scale: previewScale,
  });

  const streamPreview = createPreviewQuad({
    scene,
    gl,
    material: streamMaterial,
    frameMaterial,
    name: "StreamPreview",
    layer,
    position: vec3.fromValues(1.45, 0.35, 1.0),
    scale: previewScale,
  });

  return {
    obstaclePreview,
    streamPreview,
    updateTextures() {
      obstacleMaterial.setTexture(fluidSim.getObstacleTarget().texture);
      streamMaterial.setTexture(fluidSim.getStreamTarget().texture);
    },
  };
}

function createPreviewQuad(args: {
  scene: Scene;
  gl: WebGLRenderingContext | WebGL2RenderingContext;
  material: UnlitTextureMaterial;
  frameMaterial: IMaterial;
  name: string;
  layer: number;
  position: vec3;
  scale: vec3;
}) {
  const { scene, gl, material, frameMaterial, name, layer, position, scale } = args;

  const frame = new GameObject(`${name}Frame`);
  frame.layer = layer;
  frame.transform.setPosition(vec3.fromValues(position[0], position[1], position[2] - 0.01));
  frame.transform.setScale(vec3.fromValues(scale[0] + 0.06, scale[1] + 0.06, 1));
  frame.addComponent(new MeshFilter(createQuad(1)));
  frame.addComponent(new MeshRenderer(gl, frameMaterial));
  scene.addObject(frame);

  const preview = new GameObject(name);
  preview.layer = layer;
  preview.transform.setPosition(position);
  preview.transform.setScale(scale);
  preview.addComponent(new MeshFilter(createQuad(1)));
  preview.addComponent(new MeshRenderer(gl, material));
  scene.addObject(preview);

  return preview;
}
