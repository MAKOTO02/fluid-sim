import { GameController } from "./app/gameController";
import { handleCanvasResize, initializeObstacleTarget, updateFluidFrame } from "./app/frameUpdate";

import { getWebGLContext } from "./gl/glContext";
import { ShaderLibrary } from "./scene/shaderLibrary";

import { createBlit } from "./gl/frameBuffer";
import { createFluidShaderPrograms } from "./fluid/fluidShaders";
import { createFluidSim } from "./fluid/createFluidSim";
import { bakeBulletVectorField } from "./fluid/bulletStreamField";
import { DEFAULT_BULLET_STREAM_SOURCE } from "./fluid/streamSource";
import { createStreamFieldMap } from "./fluid/streamFieldMap";
import { InputController } from "./input/inputController";
import { DebugPanel } from "./debug/debugPanel";
import { DebugToggleButton } from "./debug/debugToggleButton";
import { formatWorldSnapshot } from "./debug/formatWorldSnapshot";
import { GameUi } from "./ui/gameUi";
import { setupEnemyConfigs } from "./scene/enemyConfig";
import { createRenderAssets } from "./scene/renderAssets";
import { createGameWorld } from "./app/createGameWorld";
import { createWorldSnapshot } from "./app/worldSnapshot";
import { SceneLayers } from "./scene/layers";
import { getStageStatus } from "./stage/stageProgress";

const canvas = document.querySelector("canvas")!;
const dpr = window.devicePixelRatio || 1;

const displayWidth  = canvas.clientWidth;
const displayHeight = canvas.clientHeight;

canvas.width  = displayWidth  * dpr;
canvas.height = displayHeight * dpr;

const { gl, ext } = getWebGLContext(canvas);
if(!gl) throw new Error("WebGL RenderingContext が見つかりません.");


const shaderLib = new ShaderLibrary(gl);
const inputController = new InputController({ pointerTarget: canvas });
const debugPanel = new DebugPanel();
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

new DebugToggleButton({
  label: "Stream",
  initialChecked: fluidSim.getStreamForceEnabled(),
  onChanged: (enabled) => {
    fluidSim.setStreamForceEnabled(enabled);
  },
});

const bulletStreamSource = DEFAULT_BULLET_STREAM_SOURCE;
const streamFieldMap = createStreamFieldMap(bulletStreamSource);
const bulletStreamTexture = bakeBulletVectorField(
  gl,
  shaderLib,
  blit,
  resolver,
  bulletStreamSource
);

// Reset GL state.
gl.bindFramebuffer(gl.FRAMEBUFFER, null); 
gl.viewport(0, 0, canvas.width, canvas.height);

let shelterTargetUpdateRequested = false;

function requestShelterTargetUpdate(): void {
  shelterTargetUpdateRequested = true;
}

function consumeShelterTargetUpdateRequest(): boolean {
  if (!shelterTargetUpdateRequested) return false;

  shelterTargetUpdateRequested = false;
  return true;
}

const world = createGameWorld({
  gl,
  canvas,
  fluidSim,
  renderAssets,
  bulletStreamTexture,
  bulletStreamSource,
  streamFieldMap,
  input: inputController,
  onShelterChanged: requestShelterTargetUpdate,
});

const {
  scene,
  renderer,
  debugTextureMap,
  dyeVisualMaterial,
  fitter,
} = world;

function initializeFrameTargets() {
  initializeObstacleTarget({
    gl,
    scene,
    renderer,
    fluidSim,
    obstacleLayer: SceneLayers.obstacle,
  });
  splatInitialShelterInk();
}

function splatInitialShelterInk(): void {
  const cam = scene.MainCamera;
  if (!cam) return;

  for (const shelter of world.stage.shelters) {
    if (!shelter.active || shelter.destroyed) continue;

    const center = shelter.transform.getWorldPosition();
    const spreadX = shelter.transform.scale[0] * 0.35;
    const spreadY = shelter.transform.scale[1] * 0.35;
    const points = [
      [0, 0],
      [-spreadX, 0],
      [spreadX, 0],
      [0, -spreadY],
      [0, spreadY],
    ] as const;

    for (const [dx, dy] of points) {
      const uv = cam.worldToScreenUV([center[0] + dx, center[1] + dy, center[2]]);
      fluidSim.splat(uv.u, uv.v, 0, 0, { r: 0.0, g: 0.85, b: 1.0, a: 0.75 }, canvas);
    }
  }
}

function updateFrame(dt: number) {
  handleCanvasResize({
    canvas,
    scene,
    fluidSim,
    fitter,
    onResized: initializeFrameTargets,
  });

  debugTextureMap.updateTextures();

  updateFluidFrame({
    gl,
    scene,
    renderer,
    fluidSim,
    dyeVisualMaterial,
    streamLayer: SceneLayers.stream,
    dt,
  });

  if (consumeShelterTargetUpdateRequest()) {
    initializeFrameTargets();
  }

  const snapshot = createWorldSnapshot(world);
  gameUi.setPlayerHealth(snapshot.stage.player.health);
  gameUi.setPlayerInk(snapshot.stage.player.ink);
  gameUi.setEnemyHealth(snapshot.stage.enemies);
  debugPanel.setText(formatWorldSnapshot(snapshot));

  if (gameController.getState() === "playing") {
    const stageStatus = getStageStatus(world.stage);
    if (stageStatus === "cleared") {
      gameController.clearStage();
    } else if (stageStatus === "failed") {
      gameController.gameOver();
    }
  }
}

const gameController = new GameController({
  onStart: initializeFrameTargets,
  onFrame: updateFrame,
});

const gameUi = new GameUi({
  onStart: () => {
    gameController.startGame();
  },
  onResume: () => {
    gameController.resumeGame();
  },
  onReturnToTitle: () => {
    gameController.returnToTitle();
  },
});

gameController.onStateChanged((state) => {
  inputController.setEnabled(state === "playing");
  gameUi.setGameState(state);
});

window.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;

  const state = gameController.getState();
  if (state === "playing") {
    gameController.pauseGame();
  } else if (state === "paused") {
    gameController.resumeGame();
  }
});

gameUi.setGameState(gameController.getState());
