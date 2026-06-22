import { GameController } from "./app/gameController";
import { handleCanvasResize, initializeObstacleTarget, updateFluidFrame } from "./app/frameUpdate";

import { getWebGLContext } from "./gl/glContext";
import { ShaderLibrary } from "./scene/shaderLibrary";

import { createBlit } from "./gl/frameBuffer";
import { createFluidShaderPrograms } from "./fluid/fluidShaders";
import { createFluidSim } from "./fluid/createFluidSim";
import { bakeBulletVectorField } from "./fluid/bulletStreamField";
import { setupEnemyConfigs } from "./scene/enemyConfig";
import { createRenderAssets } from "./scene/renderAssets";
import { createGameWorld } from "./app/createGameWorld";
import { SceneLayers } from "./scene/layers";

const canvas = document.querySelector("canvas")!;
const dpr = window.devicePixelRatio || 1;

const displayWidth  = canvas.clientWidth;
const displayHeight = canvas.clientHeight;

canvas.width  = displayWidth  * dpr;
canvas.height = displayHeight * dpr;

const { gl, ext } = getWebGLContext(canvas);
if(!gl) throw new Error("WebGL RenderingContext が見つかりません.");


const shaderLib = new ShaderLibrary(gl);
const renderAssets = createRenderAssets(shaderLib);
setupEnemyConfigs(renderAssets.materials);

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

const {
  scene,
  renderer,
  dyeVisualMaterial,
  fitter,
} = createGameWorld({
  gl,
  canvas,
  fluidSim,
  renderAssets,
  bulletStreamTexture,
});

function initializeFrameTargets() {
  initializeObstacleTarget({
    gl,
    scene,
    renderer,
    fluidSim,
    obstacleLayer: SceneLayers.obstacle,
  });
}

function updateFrame(dt: number) {
  handleCanvasResize({
    canvas,
    scene,
    fluidSim,
    fitter,
    onResized: initializeFrameTargets,
  });

  updateFluidFrame({
    gl,
    scene,
    renderer,
    fluidSim,
    dyeVisualMaterial,
    streamLayer: SceneLayers.stream,
    dt,
  });
}

const gameController = new GameController({
  onStart: initializeFrameTargets,
  onFrame: updateFrame,
});

gameController.start();
