import { GameLoop, type FrameCallback } from "./gameLoop";
import { StateMachine, type StateMachineListener } from "./stateMachine";

export type GameState = "title" | "playing" | "paused" | "cleared" | "gameOver";
export type GameStateListener = StateMachineListener<GameState>;

export type GameControllerOptions = {
  onStart?: () => void;
  onFrame: FrameCallback;
  maxDelta?: number;
};

export class GameController {
  private readonly gameLoop: GameLoop;
  private readonly onStart?: () => void;
  private readonly stateMachine = new StateMachine<GameState>("title", {
    title: ["playing"],
    playing: ["paused", "title", "cleared", "gameOver"],
    paused: ["playing", "title"],
    cleared: ["title"],
    gameOver: ["title"],
  });

  constructor(options: GameControllerOptions) {
    this.onStart = options.onStart;
    this.gameLoop = new GameLoop(options.onFrame, options.maxDelta);
  }

  startGame() {
    if (!this.stateMachine.canTransitionTo("playing")) return;

    this.onStart?.();
    this.gameLoop.start();
    this.stateMachine.transitionTo("playing");
  }

  returnToTitle() {
    this.gameLoop.stop();
    this.stateMachine.transitionTo("title");
  }

  pauseGame() {
    if (!this.stateMachine.canTransitionTo("paused")) return;

    this.gameLoop.pause();
    this.stateMachine.transitionTo("paused");
  }

  resumeGame() {
    if (!this.stateMachine.canTransitionTo("playing")) return;

    this.gameLoop.resume();
    this.stateMachine.transitionTo("playing");
  }

  clearStage() {
    if (!this.stateMachine.canTransitionTo("cleared")) return;

    this.gameLoop.pause();
    this.stateMachine.transitionTo("cleared");
  }

  gameOver() {
    if (!this.stateMachine.canTransitionTo("gameOver")) return;

    this.gameLoop.pause();
    this.stateMachine.transitionTo("gameOver");
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
    return this.stateMachine.getState();
  }

  onStateChanged(listener: GameStateListener) {
    return this.stateMachine.onChanged(listener);
  }
}
