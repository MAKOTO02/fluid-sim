import { vec3 } from "gl-matrix";
import type { StreamFieldMap } from "../fluid/streamFieldMap";
import { GameObject } from "./gameObject";
import { InkZone, type InkZoneConfig } from "./inkZone";
import type { IMaterial } from "./material";
import { MeshFilter } from "./meshFilter";
import { MeshRenderer } from "./meshRenderer";
import { createSphere } from "./primitives";
import type { Scene } from "./scene";

const DEFAULT_INK_ZONE_CONFIG: InkZoneConfig = {
  initialRadius: 0.22,
  lifeSec: 2.0,
  decayRate: 0.8,
  minStrength: 0.15,
  streamInfluence: 3000,
};

export function createInkZone(args: {
  gl: WebGLRenderingContext | WebGL2RenderingContext;
  scene: Scene;
  material: IMaterial;
  streamFieldMap: StreamFieldMap;
  position: vec3;
  config?: Partial<InkZoneConfig>;
}): GameObject {
  const { gl, scene, material, streamFieldMap, position } = args;
  const config = { ...DEFAULT_INK_ZONE_CONFIG, ...args.config };
  const inkZone = new GameObject("InkZone");

  inkZone.addComponent(new MeshFilter(createSphere(1)));
  inkZone.addComponent(new MeshRenderer(gl, material));
  inkZone.addComponent(new InkZone(scene, streamFieldMap, config));
  inkZone.transform.setPosition(vec3.fromValues(position[0], position[1], position[2] + 0.03));
  inkZone.layer = 1 << 0;

  scene.addObject(inkZone);
  return inkZone;
}
