import { Scene } from "./scene/scene";
import { Renderer } from "./scene/renderer";
import { GameObject } from "./scene/gameObject";
import { MeshFilter } from "./scene/meshFilter";
import { MeshRenderer } from "./scene/meshRenderer";
import { CameraComponent } from "./scene/camera";
import { vec3, vec4 } from "gl-matrix"

import sceneVert from "./shaders/sceneVertexShader.vert?raw";
import UnlitColorFrag from "./shaders/sceneShader.frag?raw";
import UnlitTexFrag from "./shaders/unlitTexShader.frag?raw";
import streamBulletFieldFrag from "./shaders/streamBulletField.frag?raw";
import dyeVisualFrag from "./shaders/dyeVisual.frag?raw";
import { UnlitTextureMaterial } from "./scene/materials/unlitTexMaterial";
import { getWebGLContext } from "./gl/glContext";
import { UnlitColorMaterial } from "./scene/materials/unlitColorMaterial";
import { DyeVisualMaterial } from "./scene/materials/dyeVisualMaterial";
import { ShaderLibrary } from "./scene/shaderLibrary";

import baseVert from "./shaders/baseVertexShader.vert?raw";
import curl from "./shaders/curlShader.frag?raw";
import vorticity from "./shaders/vorticityShader.frag?raw";
import physics from "./shaders/physicsShader.frag?raw";
import divergence from "./shaders/divergenceShader.frag?raw";
import pressure from "./shaders/pressureShader.frag?raw";
import subtractGradient from "./shaders/subtractGradientShader.frag?raw";
import advection from "./shaders/advectionShader.frag?raw";
import clear from "./shaders/clearShader.frag?raw";
import splat from "./shaders/splatShader.frag?raw";
import copy from "./shaders/copyShader.frag?raw";

import { type FBO , createFBO} from "./gl/frameBuffer";
import { FluidSim } from "./fluid/fluidSim";
import { FluidFormatResolver } from "./fluid/fluidFormatResolver";
import { RigidBody } from "./scene/rigidBody";
import { FluidEmitter } from "./scene/fluidEmitter";
import { PlayerController } from "./scene/playerController";
import { FluidDrag } from "./scene/fluidDrag";
import { FitToCamera } from "./scene/fitToCamera";
import { createQuad } from "./scene/primitives";
import { createSphereActor } from "./scene/actor";
import { createProjectileSphereLocal } from "./scene/projectileActor";
import { LocalPathMover, makeStraightPath } from "./scene/projectileLocalPath";
import { ScreenBoundsLimiter } from "./scene/screenBoundsLimiter";
import { Enemy } from "./scene/enemy";
import { setupEnemyStrategyFactories } from "./scene/enemyStrategy";

const canvas = document.querySelector("canvas")!;
const dpr = window.devicePixelRatio || 1;

const displayWidth  = canvas.clientWidth;
const displayHeight = canvas.clientHeight;

canvas.width  = displayWidth  * dpr;
canvas.height = displayHeight * dpr;

const { gl, ext } = getWebGLContext(canvas);
if(!gl) throw new Error("WebGL RenderingContext が見つかりません.");


// プログラム準備
const shaderLib = new ShaderLibrary(gl);

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

// 初期化時だけ呼ぶ
// 例: FluidFormatResolver を外から渡す／ここで new する
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
    fmt.internalFormat,          // ★ ここは固定で OK
    fmt.format,
    fmt.type, // ★ byte テクスチャ
    fmt.param
  );

  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo.fbo);
  gl.viewport(0, 0, size, size);

  prog.bind();
  const locStrength = prog.uniforms.get("uStrength");
  if (locStrength) gl.uniform1f(locStrength, 0.0005);

  blit(fbo);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  return fbo.texture;
}

const fluidShaderLib = new ShaderLibrary(gl);
const curlProgram = fluidShaderLib.load("curl", baseVert, curl);
const vorticityProgram = fluidShaderLib.load("vorticity", baseVert, vorticity);
const physicsProgram = fluidShaderLib.load("physics", baseVert, physics);
const divergenceProgram = fluidShaderLib.load("divergence", baseVert, divergence);
const pressureProgram = fluidShaderLib.load("pressure", baseVert, pressure);
const subtractGradientProgram = fluidShaderLib.load("subtractGradient", baseVert, subtractGradient);
const advectionProgram = fluidShaderLib.load("advection", baseVert, advection);
const clearProgram = fluidShaderLib.load("clear", baseVert, clear);
const splatProgram  = fluidShaderLib.load("splat", baseVert, splat);

const fluidShaders = {
  curl: curlProgram,
  vorticity: vorticityProgram,
  physics: physicsProgram,
  divergence: divergenceProgram,
  pressure: pressureProgram,
  subtractGradient: subtractGradientProgram,
  advection: advectionProgram,
  clear: clearProgram,
  splat: splatProgram,
}

const fluidConfig = {
  CURL: 30,
  GRAVITY: 20,
  PRESSURE: 0.8,
  PRESSURE_ITERATIONS: 20,
  VELOCITY_DISSIPATION: 0.2,
  DENSITY_DISSIPATION: 2.2,
  SPLAT_RADIUS: 0.01,
  LOGIC_DISSIPATION: 2.2,
}
function getResolution (resolution: number) {
  let aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
  if (aspectRatio < 1)
    aspectRatio = 1.0 / aspectRatio;

  let min = Math.round(resolution);
  let max = Math.round(resolution * aspectRatio);

  if (gl.drawingBufferWidth > gl.drawingBufferHeight)
    return { width: max, height: min };
  else
    return { width: min, height: max };
}

const resolution = 512;
let simRes = getResolution(resolution);
const dyeResolution = 2048;
let dyeRes = getResolution(dyeResolution);

const resolver = new FluidFormatResolver(gl, ext);

const formats = {
  vel: resolver.velocityFormat(),
  dye: resolver.dyeFormat(),
  pressure: resolver.pressureFormat(),
  stream: resolver.streamFormat(),
  obstacle: resolver.obstacleFormat(),
};

const bulletStreamTexture = bakeBulletVectorField(gl, shaderLib, blit, resolver);
const copyProgram = fluidShaderLib.load("copy", baseVert, copy)

const fluidSim = new FluidSim(
  gl, 
  ext, 
  blit, 
  fluidShaders, 
  fluidConfig,
  simRes.width,
  simRes.height,
  dyeRes.width,
  dyeRes.height,
  formats,
  copyProgram
);


// gl の状態をリセット.
gl.bindFramebuffer(gl.FRAMEBUFFER, null); 
gl.viewport(0, 0, canvas.width, canvas.height);

// シーンとレンダラー
const scene = new Scene();
const renderer = new Renderer(gl);
const layers = {
  default: 1 << 0, 
  obstacle: 1 << 1,
  stream: 1 << 2,
}

// カメラ GameObject
const cameraObj = new GameObject("MainCamera");
cameraObj.transform.translate(vec3.fromValues(0, 0, 5));
const cameraComp = cameraObj.addComponent(
  new CameraComponent(gl, {
    fov: Math.PI / 4,
    aspect: canvas.width / canvas.height,
    near: 0.1,
    far: 1000,
    yaw: 0,
    pitch: 0,
  })
);
cameraComp.cullingMask = layers.default;
scene.addObject(cameraObj);
scene.setMainCamera(cameraComp);

const quadMesh = createQuad(1);
const fluidPlane = new GameObject("Quad");
fluidPlane.layer = layers.default;
let dyeVisualMaterial = new DyeVisualMaterial(dyeVisualProgram, fluidSim.getDyeTexture(), fluidSim.getVelTexture());
const fitter = new FitToCamera(cameraComp, 5, false);
fluidPlane.addComponent(new MeshFilter(quadMesh));
fluidPlane.addComponent(new MeshRenderer(gl, dyeVisualMaterial));
fluidPlane.addComponent(fitter);
scene.addObject(fluidPlane);

// obstacle
const obstacle = new GameObject("obstacle");
obstacle.layer = layers.obstacle;
obstacle.addComponent(new MeshFilter(quadMesh));
obstacle.addComponent(new MeshRenderer(gl, obstacleMaterial));
//obstacle.transform.rotate(Math.PI/4, vec3.fromValues(0, 1, 0));
obstacle.transform.setScale(vec3.fromValues(0.5, 0.5, 0.5));
obstacle.transform.translate(vec3.fromValues(-2, -1.5, 0));

scene.addObject(obstacle);

//stream
const streamMesh = createQuad(2);
const streamObj = new GameObject("stream");
const streamTexMaterial = new UnlitTextureMaterial(unlitTexProgram, bulletStreamTexture);
streamObj.addComponent(new MeshFilter(streamMesh));
streamObj.addComponent(new MeshRenderer(gl, streamTexMaterial));
streamObj.layer = layers.stream;
streamObj.transform.translate(vec3.fromValues(0, 0, 0));
scene.addObject(streamObj);

const playerColor = vec4.fromValues(1, 0.8, 0.8, 0);
const playerMaterial = new UnlitColorMaterial(unlitColorProgram, playerColor);
const player = createSphereActor(gl, scene, {
  radius: 0.05,
  material: playerMaterial,
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

//scene.addObject(player);  // これは
player.transform.translate(vec3.fromValues(-2, -1.5, 0));
scene.addObject(emitter);

// enemy
const center = new GameObject();
scene.addObject(center);
const enemyR = 0.07;
const enemy = createSphereActor(
  gl, scene,
  {
    radius: enemyR,
    material: playerMaterial,
    layer: "enemy",
    name: "Enemy"
  }
)
enemy.transform.setParent(center.transform);
enemy.addComponent(new LocalPathMover(t => {return {x: Math.cos(t), y: Math.sin(t), z: 0}}))
const ctx = {
  gl: gl,
  scene: scene,
  canvas: canvas,
  material: playerMaterial,
  fluid: fluidSim
};
setupEnemyStrategyFactories(ctx);
enemy.addComponent(new Enemy(0, ctx)).setTarget(player.transform);

// ループ
let last = performance.now();
function loop(now: number) {
  let dt = (now - last) / 1000;
  last = now;
  dt = Math.min(dt, 1 / 30);  // クランプしておく.

  const resized = resizeCanvas(canvas);
  if (resized) {
    const w = canvas.width;
    const h = canvas.height;

    const cam = scene.MainCamera;
    if (cam) {
      // もしカメラに aspect があるならここで更新
      cam.setAspect(w / h);
      // あるいは cam.setViewportSize(w, h) みたいなメソッドでもOK
    }

    // ★ FluidSim にも通知
    fluidSim.resize(w, h); // ← この中で FBO をリサイズする実装にする

    fitter.updateLocalTransform();
  }

  scene.update(dt);

  // obstacleの準備.
  const cam = scene.MainCamera;
  if(cam){
    const prevMask = cam.cullingMask;
    const obstacleTarget = fluidSim.getObstacleTarget();
    cam.cullingMask = layers.obstacle;

    const prevFbo = gl.getParameter(gl.FRAMEBUFFER_BINDING);
    const prevViewport = gl.getParameter(gl.VIEWPORT);

    renderer.render(scene, cam, obstacleTarget);

    const streamTraget = fluidSim.getStreamTarget();
    cam.cullingMask = layers.stream;
    renderer.render(scene, cam, streamTraget);

    gl.bindFramebuffer(gl.FRAMEBUFFER, prevFbo);
    gl.viewport(prevViewport[0], prevViewport[1], prevViewport[2], prevViewport[3]);
    cam.cullingMask = prevMask;

    // 流体の更新.
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

  // 画面座標 → UV
  const uClick = x / rect.width;
  const vClick = 1 - (y / rect.height);

  // クリック位置をワールド座標に変換（zPlane はプレイヤーと同じ平面）
  const playerPos = player.transform.getWorldPosition();
  const clickWorld = cam.screenUVToWorldOnPlane(uClick, vClick, playerPos[2]);
  if (!clickWorld) return;

  // dir = クリック位置 − プレイヤー位置（ワールド方向）
  const dir = vec3.create();
  vec3.sub(dir, clickWorld, playerPos);
  const len = vec3.length(dir);
  if (len === 0) return;

  // LocalPath 用の直線軌道を作成（root 弾なら local == world）
  const speed = 3.0; // ワールド空間での速度（調整用）
  const localPath = makeStraightPath(dir, speed);

  const bullet = createProjectileSphereLocal(gl, scene, {
    radius: 0.04,
    material: playerMaterial,
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

  // 発射位置をプレイヤーと同じ場所にスナップ
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

