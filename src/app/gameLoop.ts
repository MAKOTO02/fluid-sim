export type FrameCallback = (dt: number, now: number) => void;

export class GameLoop {
  private frameId: number | null = null;
  private last = 0;
  private running = false;
  private paused = false;
  private readonly onFrame: FrameCallback;
  private readonly maxDelta: number;

  constructor(onFrame: FrameCallback, maxDelta = 1 / 30) {
    this.onFrame = onFrame;
    this.maxDelta = maxDelta;
  }

  start() {
    if (this.running) return;

    this.running = true;
    this.paused = false;
    this.last = performance.now();
    this.frameId = requestAnimationFrame(this.tick);
  }

  stop() {
    if (this.frameId != null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
    this.running = false;
    this.paused = false;
  }

  pause() {
    this.paused = true;
  }

  resume() {
    if (!this.running) return;

    this.paused = false;
    this.last = performance.now();
  }

  isRunning() {
    return this.running;
  }

  isPaused() {
    return this.paused;
  }

  private tick = (now: number) => {
    if (!this.running) return;

    let dt = (now - this.last) / 1000;
    this.last = now;
    dt = Math.min(dt, this.maxDelta);

    if (!this.paused) {
      this.onFrame(dt, now);
    }

    this.frameId = requestAnimationFrame(this.tick);
  };
}
