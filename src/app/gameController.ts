import { GameLoop, type FrameCallback } from "./gameLoop";

export type GameState = "title" | "playing" | "paused";
export type GameStateListener = (state: GameState, previousState: GameState) => void;

export type GameControllerOptions = {
  onStart?: () => void;
  onFrame: FrameCallback;
  maxDelta?: number;
};

export class GameController {
  private readonly gameLoop: GameLoop;
  private readonly onStart?: () => void;
  private readonly stateListeners = new Set<GameStateListener>();
  private state: GameState = "title";

  constructor(options: GameControllerOptions) {
    this.onStart = options.onStart;
    this.gameLoop = new GameLoop(options.onFrame, options.maxDelta);
  }

  startGame() {
    if (this.state === "playing") return;

    this.onStart?.();
    this.gameLoop.start();
    this.setState("playing");
  }

  returnToTitle() {
    this.gameLoop.stop();
    this.setState("title");
  }

  pauseGame() {
    if (this.state !== "playing") return;

    this.gameLoop.pause();
    this.setState("paused");
  }

  resumeGame() {
    if (this.state !== "paused") return;

    this.gameLoop.resume();
    this.setState("playing");
  }

  start() {
    this.startGame();
  }

  stop() {
    this.returnToTitle();
  }

  pause() {
    this.pauseGame();
  }

  resume() {
    this.resumeGame();
  }

  isRunning() {
    return this.gameLoop.isRunning();
  }

  isPaused() {
    return this.gameLoop.isPaused();
  }

  getState() {
    return this.state;
  }

  onStateChanged(listener: GameStateListener) {
    this.stateListeners.add(listener);
    return () => {
      this.stateListeners.delete(listener);
    };
  }

  private setState(nextState: GameState) {
    if (this.state === nextState) return;

    const previousState = this.state;
    this.state = nextState;
    for (const listener of this.stateListeners) {
      listener(nextState, previousState);
    }
  }
}
