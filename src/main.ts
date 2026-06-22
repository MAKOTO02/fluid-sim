import { Scene } from "./scene/scene";
import { Renderer } from "./scene/renderer";
import { GameObject } from "./scene/gameObject";
import { vec3, vec4 } from "gl-matrix"

import sceneVert from "./shaders/sceneVertexShader.vert?raw";
import UnlitColorFrag from "./shaders/sceneShader.frag?raw";
import UnlitTexFrag from "./shaders/unlitTexShader.frag?raw";
import streamBulletFieldFrag from "./shaders/streamBulletField.frag?raw";
import dyeVisualFrag from "./shaders/dyeVisual.frag?raw";
import { getWebGLContext } from "./gl/glContext";
import { UnlitColorMaterial } from "./scene/materials/unlitColorMaterial";
import { ShaderLibrary } from "./scene/shaderLibrary";

import baseVert from "./shaders/baseVertexShader.vert?raw";

import { type FBO , createFBO} from "./gl/frameBuffer";
import type { FluidFormatResolver } from "./fluid/fluidFormatResolver";
import { createFluidShaderPrograms } from "./fluid/fluidShaders";
import { createFluidSim } from "./fluid/createFluidSim";
import { RigidBody } from "./scene/rigidBody";
import { FluidEmitter } from "./scene/fluidEmitter";
import { PlayerController } from "./scene/playerController";
import { FluidDrag } from "./scene/fluidDrag";
import { createQuad } from "./scene/primitives";
import { createFluidPlaneObject, createObstacleObject, createStreamObject } from "./scene/fluidSceneObjects";
import { createMainCamera } from "./scene/cameraObject";
import { createSphereActor } from "./scene/actor";
import { createProjectileSphereLocal } from "./scene/projectileActor";
import { LocalPathMover, makeStraightPath } from "./scene/projectileLocalPath";
import { ScreenBoundsLimiter } from "./scene/screenBoundsLimiter";
import { Enemy } from "./scene/enemy";
import { setupEnemyStrategyFactories } from "./scene/enemyStrategy";
import { createGameMaterials, createGamePrograms } from "./scene/gameAssets";
import { setupEnemyConfigs } from "./scene/enemyConfig";

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

const blit = (() => {
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);

    return (target: FBO | null, clear = false) => {
        if (target == null)
        {
            gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        }
        else
        {
            gl.viewport(0, 0, target.width, target.height);
            gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
        }
        if (clear)
        {
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT);
        }
        // CHECK_FRAMEBUFFER_STATUS();
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }
})();

// Called only during initialization.
// The format resolver can be passed in from outside or created here.
function bakeBulletVectorField(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  shaderLib: ShaderLibrary,
  blit: (target: FBO | null, clear?: boolean) => void,
  resolver: FluidFormatResolver
) {
  const prog = shaderLib.load("BulletStreamField", baseVert, streamBulletFieldFrag);

  const size = 64;
  const fmt = resolver.streamFormat();

  const fbo = createFBO(
    gl,
    size,
    size,
    fmt.internalFormat,
    fmt.format,
    fmt.type,
    fmt.param
  );

  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo.fbo);
  gl.viewport(0, 0, size, size);

  prog.bind();
  const locStrength = prog.uniforms.get("uStrength");
  if (locStrength) gl.uniform1f(locStrength, 0.0003);

  blit(fbo);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  return fbo.texture;
}

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

const player = createSphereActor(gl, scene, {
  radius: 0.05,
  material: materials.player,
  layer: "player",
  hitScale: 0.3,
  name: "Player",
});

const playerController = new PlayerController(50, 1, 20);
const rb = new RigidBody(10);
rb.freezePosZ = true;
const fluidDrag = new FluidDrag(scene, fluidSim, 0.05);
player.addComponent(playerController);
player.addComponent(rb);
player.addComponent(fluidDrag);

player.addComponent(new ScreenBoundsLimiter(scene, 0.01));

const emitter = new GameObject("emitter");
const SPLAT_FORCE = 2000;
const fluidEmitter = new FluidEmitter(scene, fluidSim, canvas, SPLAT_FORCE, { r: 0, g: 0, b: 0.5 });

emitter.addComponent(fluidEmitter);
emitter.transform.setParent(player.transform);

//scene.addObject(player);
player.transform.translate(vec3.fromValues(-2, -1.5, 0));
scene.addObject(emitter);

// enemy
const enemyCenter = new GameObject();
enemyCenter.transform.translate(vec3.fromValues(1, 1, 0));
scene.addObject(enemyCenter);
const enemy = new GameObject("Enemy");
enemy.transform.setParent(enemyCenter.transform);
enemy.addComponent(new LocalPathMover(t => {return {x: Math.cos(t), y: Math.sin(t), z: 0}}))
const ctx = {
  gl: gl,
  scene: scene,
  canvas: canvas,
  material: materials.player,
  fluid: fluidSim
};
setupEnemyStrategyFactories(ctx);
const enemyComp = new Enemy(0, ctx);
enemyComp.setTarget(player.transform);
enemy.addComponent(enemyComp);
enemyComp.createVisual(gl, scene);
scene.addObject(enemy);

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

// Main loop.
let last = performance.now();
let fluidTimer = 0;
const fps = 30;
function loop(now: number) {
  let dt = (now - last) / 1000;
  last = now;
  dt = Math.min(dt, 1 / 30);  // Clamp large frame deltas.

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

  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);


canvas.addEventListener("click", (e) => {
  const cam = scene.MainCamera;
  if (!cam) return;

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // Screen coordinates to UV.
  const uClick = x / rect.width;
  const vClick = 1 - (y / rect.height);

  // Convert the click position to world coordinates on the player's plane.
  const playerPos = player.transform.getWorldPosition();
  const clickWorld = cam.screenUVToWorldOnPlane(uClick, vClick, playerPos[2]);
  if (!clickWorld) return;

  // dir = click position - player position in world space.
  const dir = vec3.create();
  vec3.sub(dir, clickWorld, playerPos);
  const len = vec3.length(dir);
  if (len === 0) return;

  // Create a straight local path. For root bullets, local space matches world space.
  const speed = 3.0; // World-space speed.
  const localPath = makeStraightPath(dir, speed);

  const bullet = createProjectileSphereLocal(gl, scene, {
    radius: 0.04,
    material: materials.player,
    colliderLayer: "bullet",
    hitLayers: ["enemy"],
    lifeSec: 5.0,
    localPath,
    name: "PlayerBullet",
    fluid: {
      enabled: true,
      fluidSim: fluidSim,
      canvas: canvas,
      strength: SPLAT_FORCE,
      color: { r: 0, g: 1, b: 0 },
    },
  });

  // Spawn from the player's current position.
  bullet.transform.setPosition(playerPos);
});

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
