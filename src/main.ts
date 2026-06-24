import { GameController } from "./app/gameController";
import { handleCanvasResize, initializeObstacleTarget, updateFluidFrame } from "./app/frameUpdate";

import { getWebGLContext } from "./gl/glContext";
import { ShaderLibrary } from "./scene/shaderLibrary";

import { createBlit } from "./gl/frameBuffer";
import { createFluidShaderPrograms } from "./fluid/fluidShaders";
import { createFluidSim } from "./fluid/createFluidSim";
import { bakeBulletVectorField } from "./fluid/bulletStreamField";
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

const bulletStreamTexture = bakeBulletVectorField(gl, shaderLib, blit, resolver);

// Reset GL state.
gl.bindFramebuffer(gl.FRAMEBUFFER, null); 
gl.viewport(0, 0, canvas.width, canvas.height);

let obstacleTargetUpdateRequested = false;

function requestObstacleTargetUpdate(): void {
  obstacleTargetUpdateRequested = true;
}

function consumeObstacleTargetUpdateRequest(): boolean {
  if (!obstacleTargetUpdateRequested) return false;

  obstacleTargetUpdateRequested = false;
  return true;
}

const world = createGameWorld({
  gl,
  canvas,
  fluidSim,
  renderAssets,
  bulletStreamTexture,
  input: inputController,
  onObstacleChanged: requestObstacleTargetUpdate,
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

  if (consumeObstacleTargetUpdateRequest()) {
    initializeFrameTargets();
  }

  const snapshot = createWorldSnapshot(world);
  gameUi.setPlayerHealth(snapshot.stage.player.health);
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
