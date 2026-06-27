import { DebugPanel } from "../debug/debugPanel";
import { DebugToggleButton } from "../debug/debugToggleButton";
import { formatWorldSnapshot } from "../debug/formatWorldSnapshot";
import { bakeBulletVectorField } from "../fluid/bulletStreamField";
import { createFluidSim } from "../fluid/createFluidSim";
import { createFluidShaderPrograms } from "../fluid/fluidShaders";
import { createStreamFieldMap } from "../fluid/streamFieldMap";
import { getStreamSource } from "../fluid/streamCatalog";
import { createBlit } from "../gl/frameBuffer";
import { getWebGLContext } from "../gl/glContext";
import { InputController } from "../input/inputController";
import { setupEnemyCatalog } from "../scene/enemyConfig";
import { SceneLayers } from "../scene/layers";
import { SHELTER_STORED_INK_COLOR } from "../scene/playerInkColor";
import { createRenderAssets } from "../scene/renderAssets";
import { ShaderLibrary } from "../scene/shaderLibrary";
import { demoStageDefinition, stageDefinitions, type StageDefinition } from "../stage/stageDefinition";
import { getStageStatus } from "../stage/stageProgress";
import { GameUi } from "../ui/gameUi";
import { applyFixedAspectCanvasLayout } from "./canvasLayout";
import { createGameWorld } from "./createGameWorld";
import { handleCanvasResize, initializeObstacleTarget, updateFluidFrame } from "./frameUpdate";
import { GameController } from "./gameController";
import { createWorldSnapshot } from "./worldSnapshot";

export function startGameApp(): void {
  const canvas = document.querySelector("canvas")!;
  const initialLayout = applyFixedAspectCanvasLayout(canvas);

  canvas.width = initialLayout.pixelWidth;
  canvas.height = initialLayout.pixelHeight;

  const { gl, ext } = getWebGLContext(canvas);
  if (!gl) throw new Error("WebGL RenderingContext not found.");

  const shaderLib = new ShaderLibrary(gl);
  const inputController = new InputController({ pointerTarget: canvas });
  const debugPanel = new DebugPanel();
  const renderAssets = createRenderAssets(shaderLib, gl);
  setupEnemyCatalog(renderAssets);

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

  // Reset GL state.
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, canvas.width, canvas.height);

  let shelterTargetUpdateRequested = false;
  let selectedStageDefinition: StageDefinition = demoStageDefinition;

  function requestShelterTargetUpdate(): void {
    shelterTargetUpdateRequested = true;
  }

  function consumeShelterTargetUpdateRequest(): boolean {
    if (!shelterTargetUpdateRequested) return false;

    shelterTargetUpdateRequested = false;
    return true;
  }

  function createWorldInstance() {
    const streamDefinition = selectedStageDefinition.streams[0];
    if (!streamDefinition) {
      throw new Error(`Stage '${selectedStageDefinition.id}' has no stream definition.`);
    }
    const bulletStreamSource = getStreamSource(streamDefinition.sourceId);
    const streamFieldMap = createStreamFieldMap(bulletStreamSource);
    const bulletStreamTexture = bakeBulletVectorField(
      gl,
      shaderLib,
      blit,
      resolver,
      bulletStreamSource
    );

    return createGameWorld({
      gl,
      canvas,
      fluidSim,
      renderAssets,
      bulletStreamTexture,
      streamFieldMap,
      stageDefinition: selectedStageDefinition,
      input: inputController,
      onShelterChanged: requestShelterTargetUpdate,
    });
  }

  let world = createWorldInstance();

  function resetWorld(): void {
    fluidSim.reset();
    shelterTargetUpdateRequested = false;
    world = createWorldInstance();
    updateDebugSnapshot();
  }

  function initializeFrameTargets() {
    initializeObstacleTarget({
      gl,
      scene: world.scene,
      renderer: world.renderer,
      fluidSim,
      obstacleLayer: SceneLayers.obstacle,
    });
    fluidSim.addDyeFromMask(
      fluidSim.getObstacleTarget().texture,
      SHELTER_STORED_INK_COLOR,
      1.0
    );
  }

  function updateFrame(dt: number) {
    handleCanvasResize({
      canvas,
      scene: world.scene,
      fluidSim,
      fitter: world.fitter,
      onResized: initializeFrameTargets,
    });

    world.debugTextureMap.updateTextures();

    if (gameController.getState() === "playing") {
      world.stage.eventProcessor.update(dt);
    }

    updateFluidFrame({
      gl,
      scene: world.scene,
      renderer: world.renderer,
      fluidSim,
      dyeVisualMaterial: world.dyeVisualMaterial,
      streamLayer: SceneLayers.stream,
      dt,
    });

    if (consumeShelterTargetUpdateRequest()) {
      initializeFrameTargets();
    }

    updateDebugSnapshot();

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
      gameController.showStageSelect();
    },
    stages: stageDefinitions,
    onSelectStage: (stage) => {
      selectedStageDefinition = stage;
      resetWorld();
      gameController.startGame();
    },
    onBackToTitle: () => {
      resetWorld();
      gameController.returnToTitle();
    },
    onResume: () => {
      gameController.resumeGame();
    },
    onReturnToTitle: () => {
      resetWorld();
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
  updateDebugSnapshot();

  function updateDebugSnapshot() {
    const snapshot = createWorldSnapshot(world);
    gameUi.setPlayerHealth(snapshot.stage.player.health);
    gameUi.setPlayerInk(snapshot.stage.player.ink);
    gameUi.setEnemyHealth(snapshot.stage.enemies);
    debugPanel.setText(formatWorldSnapshot(snapshot));
    return snapshot;
  }
}
