import { GameLoop, type FrameCallback } from "./gameLoop";

export type GameControllerOptions = {
  onStart?: () => void;
  onFrame: FrameCallback;
  maxDelta?: number;
};

export class GameController {
  private readonly gameLoop: GameLoop;
  private readonly onStart?: () => void;

  constructor(options: GameControllerOptions) {
    this.onStart = options.onStart;
    this.gameLoop = new GameLoop(options.onFrame, options.maxDelta);
  }

  start() {
    if (this.gameLoop.isRunning()) return;

    this.onStart?.();
    this.gameLoop.start();
  }

  stop() {
    this.gameLoop.stop();
  }

  pause() {
    this.gameLoop.pause();
  }

  resume() {
    this.gameLoop.resume();
  }

  isRunning() {
    return this.gameLoop.isRunning();
  }

  isPaused() {
    return this.gameLoop.isPaused();
  }
}
