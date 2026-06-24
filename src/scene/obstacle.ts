import type { Component } from "./component";
import type { GameObject } from "./gameObject";
import { BoxCollider, type Collider } from "./collider";
import { Health } from "./health";

export type ObstacleState = "active" | "destroyed";

export type ObstacleOptions = {
  onDestroyed?: () => void;
  recoveryPerSecond?: number;
};

export class Obstacle implements Component {
  enabled = true;
  owner?: GameObject;

  private state: ObstacleState = "active";
  private readonly onDestroyed?: () => void;
  private readonly recoveryPerSecond: number;
  private readonly playerContacts = new Set<Collider>();

  constructor(options: ObstacleOptions = {}) {
    this.onDestroyed = options.onDestroyed;
    this.recoveryPerSecond = options.recoveryPerSecond ?? 0;
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

  update(dt: number): void {
    if (!this.enabled || this.state !== "active") return;
    if (this.recoveryPerSecond <= 0) return;

    const obstacleHealth = this.owner?.getComponent(Health);
    if (!obstacleHealth || obstacleHealth.isDead()) return;

    for (const playerCollider of this.playerContacts) {
      const player = playerCollider.owner;
      if (!player || !player.active || player.destroyed) {
        this.playerContacts.delete(playerCollider);
        continue;
      }

      const playerHealth = player.getComponent(Health);
      if (!playerHealth || playerHealth.getCurrent() >= playerHealth.getMax()) continue;

      const requestedRecover = Math.min(this.recoveryPerSecond * dt, obstacleHealth.getCurrent());
      const recovered = playerHealth.recover(requestedRecover);
      obstacleHealth.applyDamage(recovered);

      if (obstacleHealth.isDead()) {
        this.destroy();
        return;
      }
    }
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
