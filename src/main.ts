import { Scene } from "./scene/scene";
import { Renderer } from "./scene/renderer";
import { vec4 } from "gl-matrix"
import { GameLoop } from "./app/gameLoop";

import sceneVert from "./shaders/sceneVertexShader.vert?raw";
import UnlitColorFrag from "./shaders/sceneShader.frag?raw";
import UnlitTexFrag from "./shaders/unlitTexShader.frag?raw";
import dyeVisualFrag from "./shaders/dyeVisual.frag?raw";
import { getWebGLContext } from "./gl/glContext";
import { UnlitColorMaterial } from "./scene/materials/unlitColorMaterial";
import { ShaderLibrary } from "./scene/shaderLibrary";

import { createBlit } from "./gl/frameBuffer";
import { createFluidShaderPrograms } from "./fluid/fluidShaders";
import { createFluidSim } from "./fluid/createFluidSim";
import { bakeBulletVectorField } from "./fluid/bulletStreamField";
import { createQuad } from "./scene/primitives";
import { createFluidPlaneObject, createObstacleObject, createStreamObject } from "./scene/fluidSceneObjects";
import { createMainCamera } from "./scene/cameraObject";
import { createGameMaterials, createGamePrograms } from "./scene/gameAssets";
import { setupEnemyConfigs } from "./scene/enemyConfig";
import { createPlayer } from "./scene/playerFactory";
import { createDemoEnemy } from "./scene/enemyFactory";
import { setupPlayerShooting } from "./scene/playerShooting";

const canvas = document.querySelector("canvas")!;
const dpr = window.devicePixelRatio || 1;

const displayWidth  = canvas.clientWidth;
const displayHeight = canvas.clientHeight;

canvas.width  = displayWidth  * dpr;
canvas.height = displayHeight * dpr;

const { gl, ext } = getWebGLContext(canvas);
if(!gl) throw new Error("WebGL RenderingContext が見つかりません.");


// Prepare shader programs.
const shaderLib = new ShaderLibrary(gl);
const programs = createGamePrograms(shaderLib);
const materials = createGameMaterials(programs);
setupEnemyConfigs(materials);


const unlitColorProgram = shaderLib.load("UnlitColor", sceneVert, UnlitColorFrag);
const obstacleColor = vec4.fromValues(1, 0, 0, 0);
const obstacleMaterial = new UnlitColorMaterial(unlitColorProgram, obstacleColor);

const unlitTexProgram = shaderLib.load("UnlitTex", sceneVert, UnlitTexFrag);
const dyeVisualProgram = shaderLib.load("DyeVelVisual", sceneVert, dyeVisualFrag);

const blit = createBlit(gl);

const fluidShaderLib = new ShaderLibrary(gl);
const { fluidShaders, copyProgram } = createFluidShaderPrograms(fluidShaderLib);

const { fluidSim, resolver } = createFluidSim({
  gl,
  ext,
  blit,
  fluidShaders,
  copyProgram,
});

const bulletStreamTexture = bakeBulletVectorField(gl, shaderLib, blit, resolver);

// Reset GL state.
gl.bindFramebuffer(gl.FRAMEBUFFER, null); 
gl.viewport(0, 0, canvas.width, canvas.height);

// Scene and renderer.
const scene = new Scene();
const renderer = new Renderer(gl);
const layers = {
  default: 1 << 0, 
  obstacle: 1 << 1,
  stream: 1 << 2,
}

const cameraComp = createMainCamera({
  scene,
  gl,
  aspect: canvas.width / canvas.height,
  layer: layers.default,
});

const quadMesh = createQuad(1);
const { dyeVisualMaterial, fitter } = createFluidPlaneObject({
  scene,
  gl,
  camera: cameraComp,
  mesh: quadMesh,
  program: dyeVisualProgram,
  fluidSim,
  layer: layers.default,
});

createObstacleObject({
  scene,
  gl,
  mesh: quadMesh,
  material: obstacleMaterial,
  layer: layers.obstacle,
});

createStreamObject({
  scene,
  gl,
  program: unlitTexProgram,
  texture: bulletStreamTexture,
  layer: layers.stream,
});

const { player, splatForce } = createPlayer({
  scene,
  gl,
  canvas,
  material: materials.player,
  fluidSim,
});

createDemoEnemy({
  scene,
  gl,
  canvas,
  material: materials.player,
  fluidSim,
  target: player.transform,
});

setupPlayerShooting({
  canvas,
  gl,
  scene,
  player,
  material: materials.player,
  fluidSim,
  splatForce,
});

// Initialize render targets.
function init(){
  scene.update(0);
  const cam = scene.MainCamera;
  if(cam){
    const prevMask = cam.cullingMask;
    const obstacleTarget = fluidSim.getObstacleTarget();
    cam.cullingMask = layers.obstacle;

    const prevFbo = gl.getParameter(gl.FRAMEBUFFER_BINDING);
    const prevViewport = gl.getParameter(gl.VIEWPORT);

    renderer.render(scene, cam, obstacleTarget);

    gl.bindFramebuffer(gl.FRAMEBUFFER, prevFbo);
    gl.viewport(prevViewport[0], prevViewport[1], prevViewport[2], prevViewport[3]);
    cam.cullingMask = prevMask;
  }
}

init();

let fluidTimer = 0;
const fps = 30;
function updateFrame(dt: number) {
  const resized = resizeCanvas(canvas);
  if (resized) {
    const w = canvas.width;
    const h = canvas.height;

    const cam = scene.MainCamera;
    if (cam) {
      cam.setAspect(w / h);
    }

    // Notify FluidSim so it can resize its FBOs.
    fluidSim.resize(w, h);

    fitter.updateLocalTransform();
    init();
  }

  scene.update(dt);
  const cam = scene.MainCamera;
  if(cam){
    fluidTimer += dt;
    if(fluidTimer < 1 / fps){
      renderer.render(scene, cam);
    }
    const prevMask = cam.cullingMask;
    const prevFbo = gl.getParameter(gl.FRAMEBUFFER_BINDING);
    const prevViewport = gl.getParameter(gl.VIEWPORT);

    // Prepare stream target.
    const streamTraget = fluidSim.getStreamTarget();
    cam.cullingMask = layers.stream;
    renderer.render(scene, cam, streamTraget);

    gl.bindFramebuffer(gl.FRAMEBUFFER, prevFbo);
    gl.viewport(prevViewport[0], prevViewport[1], prevViewport[2], prevViewport[3]);
    cam.cullingMask = prevMask;

    // Update the fluid simulation.
    //fluidSim.setPaused(true);
    fluidSim.step(dt);
    dyeVisualMaterial.setTextures(fluidSim.getDyeTexture(), fluidSim.getVelTexture());

    renderer.render(scene, cam);
  }
}

const gameLoop = new GameLoop(updateFrame);
gameLoop.start();


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
