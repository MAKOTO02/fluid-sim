export type MoveAxis = {
  x: number;
  y: number;
};

export interface MovementInput {
  getMoveAxis(): MoveAxis;
}

export type ShootCommand = {
  u: number;
  v: number;
};

export interface ShootingInput {
  consumeShootCommands(): ShootCommand[];
}

export type GameInput = MovementInput & ShootingInput;

export type InputControllerOptions = {
  keyboardTarget?: Window;
  pointerTarget?: HTMLElement;
};

export class InputController implements GameInput {
  private readonly pressedKeys = new Set<string>();
  private readonly shootCommands: ShootCommand[] = [];
  private readonly keyboardTarget: Window;
  private readonly pointerTarget?: HTMLElement;
  private enabled = false;

  constructor(options: InputControllerOptions = {}) {
    this.keyboardTarget = options.keyboardTarget ?? window;
    this.pointerTarget = options.pointerTarget;
    this.keyboardTarget.addEventListener("keydown", this.onKeyDown);
    this.keyboardTarget.addEventListener("keyup", this.onKeyUp);
    this.keyboardTarget.addEventListener("blur", this.onBlur);
    this.pointerTarget?.addEventListener("click", this.onClick);
  }

  enable() {
    this.clearState();
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
    this.clearState();
  }

  setEnabled(enabled: boolean): void{
    this.enabled = enabled;
  }

  isEnabled(): boolean{
    return this.enabled;
  }

  getMoveAxis(): MoveAxis {
    if (!this.enabled) return { x: 0, y: 0 };

    let x = 0;
    let y = 0;

    if (this.isPressed("a") || this.isPressed("arrowleft")) x -= 1;
    if (this.isPressed("d") || this.isPressed("arrowright")) x += 1;
    if (this.isPressed("s") || this.isPressed("arrowdown")) y -= 1;
    if (this.isPressed("w") || this.isPressed("arrowup")) y += 1;

    return { x, y };
  }

  consumeShootCommands(): ShootCommand[] {
    if (!this.enabled) {
      this.shootCommands.length = 0;
      return [];
    }

    return this.shootCommands.splice(0);
  }

  dispose() {
    this.keyboardTarget.removeEventListener("keydown", this.onKeyDown);
    this.keyboardTarget.removeEventListener("keyup", this.onKeyUp);
    this.keyboardTarget.removeEventListener("blur", this.onBlur);
    this.pointerTarget?.removeEventListener("click", this.onClick);
  }

  private isPressed(key: string) {
    return this.pressedKeys.has(key);
  }

  private onKeyDown = (event: KeyboardEvent) => {
    if (!this.enabled) return;

    const key = this.normalizeKey(event.key);
    if (!this.isMovementKey(key)) return;

    event.preventDefault();
    this.pressedKeys.add(key);
  };

  private onKeyUp = (event: KeyboardEvent) => {
    if (!this.enabled) return;

    const key = this.normalizeKey(event.key);
    if (!this.isMovementKey(key)) return;

    event.preventDefault();
    this.pressedKeys.delete(key);
  };

  private onBlur = () => {
    this.clearState();
  };

  private onClick = (event: MouseEvent) => {
    if (!this.enabled) return;
    if (!this.pointerTarget) return;

    const rect = this.pointerTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    this.shootCommands.push({
      u: x / rect.width,
      v: 1 - y / rect.height,
    });
  };

  private normalizeKey(key: string) {
    return key.toLowerCase();
  }

  private isMovementKey(key: string) {
    return (
      key === "a" ||
      key === "d" ||
      key === "s" ||
      key === "w" ||
      key === "arrowleft" ||
      key === "arrowright" ||
      key === "arrowdown" ||
      key === "arrowup"
    );
  }

  private clearState() {
    this.pressedKeys.clear();
    this.shootCommands.length = 0;
  }
}
