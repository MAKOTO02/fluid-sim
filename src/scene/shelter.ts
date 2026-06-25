import type { Component } from "./component";
import type { GameObject } from "./gameObject";
import { BoxCollider, type Collider } from "./collider";
import { Health } from "./health";
import { PlayerInk } from "./playerInk";

export type ShelterState = "active" | "destroyed";

export type ShelterOptions = {
  onDestroyed?: () => void;
  recoveryPerSecond?: number;
  inkRecoveryPerSecond?: number;
};

export class Shelter implements Component {
  enabled = true;
  owner?: GameObject;

  private state: ShelterState = "active";
  private readonly onDestroyed?: () => void;
  private readonly recoveryPerSecond: number;
  private readonly inkRecoveryPerSecond: number;
  private readonly playerContacts = new Set<Collider>();

  constructor(options: ShelterOptions = {}) {
    this.onDestroyed = options.onDestroyed;
    this.recoveryPerSecond = options.recoveryPerSecond ?? 0;
    this.inkRecoveryPerSecond = options.inkRecoveryPerSecond ?? 0;
  }

  getState(): ShelterState {
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
    if (this.recoveryPerSecond <= 0 && this.inkRecoveryPerSecond <= 0) return;

    const shelterHealth = this.owner?.getComponent(Health);
    if (!shelterHealth || shelterHealth.isDead()) return;

    for (const playerCollider of this.playerContacts) {
      const player = playerCollider.owner;
      if (!player || !player.active || player.destroyed) {
        this.playerContacts.delete(playerCollider);
        continue;
      }

      const recoveredHealth = this.recoverPlayerHealth(player, shelterHealth, dt);
      const recoveredInk = this.recoverPlayerInk(player, shelterHealth, dt);

      if (recoveredHealth + recoveredInk > 0 && shelterHealth.isDead()) {
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

  private recoverPlayerHealth(player: GameObject, shelterHealth: Health, dt: number): number {
    if (this.recoveryPerSecond <= 0) return 0;

    const playerHealth = player.getComponent(Health);
    if (!playerHealth || playerHealth.getCurrent() >= playerHealth.getMax()) return 0;

    const requestedRecover = Math.min(this.recoveryPerSecond * dt, shelterHealth.getCurrent());
    const recovered = playerHealth.recover(requestedRecover);
    shelterHealth.applyDamage(recovered);
    return recovered;
  }

  private recoverPlayerInk(player: GameObject, shelterHealth: Health, dt: number): number {
    if (this.inkRecoveryPerSecond <= 0) return 0;

    const playerInk = player.getComponent(PlayerInk);
    if (!playerInk || playerInk.getCurrent() >= playerInk.getMax()) return 0;

    const requestedRecover = Math.min(this.inkRecoveryPerSecond * dt, shelterHealth.getCurrent());
    const recovered = playerInk.recover(requestedRecover);
    shelterHealth.applyDamage(recovered);
    return recovered;
  }
}
