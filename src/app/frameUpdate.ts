import type { FluidSim } from "../fluid/fluidSim";
import type { Renderer } from "../scene/renderer";
import type { Scene } from "../scene/scene";
import type { FitToCamera } from "../scene/fitToCamera";
import type { DyeVisualMaterial } from "../scene/materials/dyeVisualMaterial";

export function initializeObstacleTarget(args: {
  gl: WebGLRenderingContext | WebGL2RenderingContext;
  scene: Scene;
  renderer: Renderer;
  fluidSim: FluidSim;
  obstacleLayer: number;
}) {
  const { gl, scene, renderer, fluidSim, obstacleLayer } = args;

  scene.update(0);
  const cam = scene.MainCamera;
  if (!cam) return;

  const prevMask = cam.cullingMask;
  const obstacleTarget = fluidSim.getObstacleTarget();
  cam.cullingMask = obstacleLayer;

  const prevFbo = gl.getParameter(gl.FRAMEBUFFER_BINDING);
  const prevViewport = gl.getParameter(gl.VIEWPORT);

  renderer.render(scene, cam, obstacleTarget);

  gl.bindFramebuffer(gl.FRAMEBUFFER, prevFbo);
  gl.viewport(prevViewport[0], prevViewport[1], prevViewport[2], prevViewport[3]);
  cam.cullingMask = prevMask;
}

export function handleCanvasResize(args: {
  canvas: HTMLCanvasElement;
  scene: Scene;
  fluidSim: FluidSim;
  fitter: FitToCamera;
  onResized: () => void;
}) {
  const { canvas, scene, fluidSim, fitter, onResized } = args;

  const resized = resizeCanvas(canvas);
  if (!resized) return;

  const w = canvas.width;
  const h = canvas.height;

  const cam = scene.MainCamera;
  if (cam) {
    cam.setAspect(w / h);
  }

  fluidSim.resize(w, h);
  fitter.updateLocalTransform();
  onResized();
}

export function updateFluidFrame(args: {
  gl: WebGLRenderingContext | WebGL2RenderingContext;
  scene: Scene;
  renderer: Renderer;
  fluidSim: FluidSim;
  dyeVisualMaterial: DyeVisualMaterial;
  streamLayer: number;
  dt: number;
}) {
  const { gl, scene, renderer, fluidSim, dyeVisualMaterial, streamLayer, dt } = args;

  scene.update(dt);
  const cam = scene.MainCamera;
  if (!cam) return;

  const prevMask = cam.cullingMask;
  const prevFbo = gl.getParameter(gl.FRAMEBUFFER_BINDING);
  const prevViewport = gl.getParameter(gl.VIEWPORT);

  const streamTarget = fluidSim.getStreamTarget();
  cam.cullingMask = streamLayer;
  renderer.render(scene, cam, streamTarget);

  gl.bindFramebuffer(gl.FRAMEBUFFER, prevFbo);
  gl.viewport(prevViewport[0], prevViewport[1], prevViewport[2], prevViewport[3]);
  cam.cullingMask = prevMask;

  fluidSim.step(dt);
  dyeVisualMaterial.setTextures(fluidSim.getDyeTexture(), fluidSim.getVelTexture());

  renderer.render(scene, cam);
}

function scaleByPixelRatio(input: number): number {
  const pixelRatio = window.devicePixelRatio || 1;
  return Math.floor(input * pixelRatio);
}

function resizeCanvas(canvas: HTMLCanvasElement): boolean {
  const width = scaleByPixelRatio(canvas.clientWidth);
  const height = scaleByPixelRatio(canvas.clientHeight);
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    return true;
  }
  return false;
}
