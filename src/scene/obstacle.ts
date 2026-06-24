import type { Component } from "./component";
import type { GameObject } from "./gameObject";

export type ObstacleState = "active" | "destroyed";

export class Obstacle implements Component {
  enabled = true;
  owner?: GameObject;

  private state: ObstacleState = "active";

  getState(): ObstacleState {
    return this.state;
  }

  destroy(): void {
    if (this.state === "destroyed") return;

    this.state = "destroyed";
    this.enabled = false;
    this.owner?.destroy();
  }
}
