import type { Component } from "./component";
import type { GameObject } from "./gameObject";
import { BoxCollider, type Collider } from "./collider";

export type ObstacleState = "active" | "destroyed";

export type ObstacleOptions = {
  onDestroyed?: () => void;
};

export class Obstacle implements Component {
  enabled = true;
  owner?: GameObject;

  private state: ObstacleState = "active";
  private readonly onDestroyed?: () => void;
  private readonly playerContacts = new Set<Collider>();

  constructor(options: ObstacleOptions = {}) {
    this.onDestroyed = options.onDestroyed;
  }

  getState(): ObstacleState {
    return this.state;
  }

  isPlayerInside(): boolean {
    return this.playerContacts.size > 0;
  }

  onAttach(): void {
    const collider = this.owner?.getComponent(BoxCollider);
    if (!collider) return;

    collider.onTriggerEnter = this.handleTriggerEnter;
    collider.onTriggerStay = this.handleTriggerStay;
    collider.onTriggerExit = this.handleTriggerExit;
  }

  onDetach(): void {
    const collider = this.owner?.getComponent(BoxCollider);
    if (collider?.onTriggerEnter === this.handleTriggerEnter) {
      collider.onTriggerEnter = undefined;
    }
    if (collider?.onTriggerStay === this.handleTriggerStay) {
      collider.onTriggerStay = undefined;
    }
    if (collider?.onTriggerExit === this.handleTriggerExit) {
      collider.onTriggerExit = undefined;
    }

    this.playerContacts.clear();
  }

  destroy(): void {
    if (this.state === "destroyed") return;

    this.state = "destroyed";
    this.enabled = false;
    this.owner?.destroy();
    this.onDestroyed?.();
  }

  private readonly handleTriggerEnter = (other: Collider): void => {
    this.addPlayerContact(other);
  };

  private readonly handleTriggerStay = (other: Collider): void => {
    this.addPlayerContact(other);
  };

  private readonly handleTriggerExit = (other: Collider): void => {
    if (other.layer !== "player") return;
    this.playerContacts.delete(other);
  };

  private addPlayerContact(other: Collider): void {
    if (other.layer !== "player") return;
    this.playerContacts.add(other);
  }
}
