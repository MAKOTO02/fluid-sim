import type { FluidSim } from "../fluid/fluidSim";
import type { GameObject } from "../scene/gameObject";
import { HazardEmitter } from "../scene/hazardEmitter";
import { Health } from "../scene/health";

export type StageEventTrigger =
  | {
      type: "time";
      at: number;
    }
  | {
      type: "enemy:defeated";
      targetId: string;
    };

export type StageEventAction =
  | {
      type: "hazard:setEnabled";
      targetId: string;
      enabled: boolean;
    }
  | {
      type: "stream:setForceEnabled";
      enabled: boolean;
    };

export type StageEventDefinition = {
  trigger: StageEventTrigger;
  action: StageEventAction;
};

export class StageEventProcessor {
  private elapsed = 0;
  private readonly events: StageEventDefinition[];
  private readonly processedEventIndexes = new Set<number>();
  private readonly objectsById: ReadonlyMap<string, GameObject>;
  private readonly fluidSim: FluidSim;

  constructor(
    events: readonly StageEventDefinition[],
    objectsById: ReadonlyMap<string, GameObject>,
    fluidSim: FluidSim
  ) {
    this.events = [...events];
    this.objectsById = objectsById;
    this.fluidSim = fluidSim;
  }

  update(dt: number): void {
    this.elapsed += Math.max(0, dt);

    for (let i = 0; i < this.events.length; i += 1) {
      if (this.processedEventIndexes.has(i)) continue;

      const event = this.events[i];
      if (!this.isTriggered(event.trigger)) continue;

      this.processAction(event.action);
      this.processedEventIndexes.add(i);
    }
  }

  reset(): void {
    this.elapsed = 0;
    this.processedEventIndexes.clear();
  }

  getElapsed(): number {
    return this.elapsed;
  }

  getNextTimeEvent(): StageEventDefinition | undefined {
    let next: StageEventDefinition | undefined;
    let nextAt = Number.POSITIVE_INFINITY;

    for (let i = 0; i < this.events.length; i += 1) {
      if (this.processedEventIndexes.has(i)) continue;

      const event = this.events[i];
      if (event.trigger.type !== "time") continue;
      if (event.trigger.at < this.elapsed) continue;

      if (event.trigger.at < nextAt) {
        next = event;
        nextAt = event.trigger.at;
      }
    }

    return next;
  }

  private isTriggered(trigger: StageEventTrigger): boolean {
    switch (trigger.type) {
      case "time":
        return trigger.at <= this.elapsed;
      case "enemy:defeated":
        return this.isObjectDefeated(trigger.targetId);
    }
  }

  private processAction(action: StageEventAction): void {
    switch (action.type) {
      case "hazard:setEnabled":
        this.setHazardEnabled(action.targetId, action.enabled);
        break;
      case "stream:setForceEnabled":
        this.fluidSim.setStreamForceEnabled(action.enabled);
        break;
    }
  }

  private isObjectDefeated(targetId: string): boolean {
    const target = this.objectsById.get(targetId);
    if (!target) {
      console.warn(`Stage event target not found: ${targetId}`);
      return false;
    }

    const health = target.getComponent(Health);
    return !target.active || target.destroyed || Boolean(health?.isDead());
  }

  private setHazardEnabled(targetId: string, enabled: boolean): void {
    const target = this.objectsById.get(targetId);
    if (!target) {
      console.warn(`Stage event target not found: ${targetId}`);
      return;
    }

    const hazard = target.getComponent(HazardEmitter);
    if (!hazard) {
      console.warn(`Stage event target is not a hazard emitter: ${targetId}`);
      return;
    }

    hazard.enabled = enabled;
  }
}
