export type MoveAxis = {
  x: number;
  y: number;
};

export interface MovementInput {
  getMoveAxis(): MoveAxis;
}

export class InputController implements MovementInput {
  private readonly pressedKeys = new Set<string>();
  private readonly target: Window;

  constructor(target: Window = window) {
    this.target = target;
    this.target.addEventListener("keydown", this.onKeyDown);
    this.target.addEventListener("keyup", this.onKeyUp);
    this.target.addEventListener("blur", this.onBlur);
  }

  getMoveAxis(): MoveAxis {
    let x = 0;
    let y = 0;

    if (this.isPressed("a") || this.isPressed("arrowleft")) x -= 1;
    if (this.isPressed("d") || this.isPressed("arrowright")) x += 1;
    if (this.isPressed("s") || this.isPressed("arrowdown")) y -= 1;
    if (this.isPressed("w") || this.isPressed("arrowup")) y += 1;

    return { x, y };
  }

  dispose() {
    this.target.removeEventListener("keydown", this.onKeyDown);
    this.target.removeEventListener("keyup", this.onKeyUp);
    this.target.removeEventListener("blur", this.onBlur);
  }

  private isPressed(key: string) {
    return this.pressedKeys.has(key);
  }

  private onKeyDown = (event: KeyboardEvent) => {
    const key = this.normalizeKey(event.key);
    if (!this.isMovementKey(key)) return;

    event.preventDefault();
    this.pressedKeys.add(key);
  };

  private onKeyUp = (event: KeyboardEvent) => {
    const key = this.normalizeKey(event.key);
    if (!this.isMovementKey(key)) return;

    event.preventDefault();
    this.pressedKeys.delete(key);
  };

  private onBlur = () => {
    this.pressedKeys.clear();
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
}
