import type { Component } from "./component";
import type { GameObject } from "./gameObject";

export type HealthSnapshot = {
  current: number;
  max: number;
};

export class Health implements Component {
  enabled = true;
  owner?: GameObject;

  private current: number;
  private readonly max: number;

  constructor(max = 100, current = max) {
    this.max = Math.max(max, 0);
    this.current = this.clamp(current);
  }

  getCurrent() {
    return this.current;
  }

  getMax() {
    return this.max;
  }

  applyDamage(amount: number): number {
    if (amount <= 0) return 0;
    const before = this.current;
    this.current = this.clamp(this.current - amount);
    return before - this.current;
  }

  recover(amount: number, limit = this.max): number {
    if (amount <= 0) return 0;
    const before = this.current;
    this.current = Math.min(this.clamp(limit), this.clamp(this.current + amount));
    return this.current - before;
  }

  isDead() {
    return this.current <= 0;
  }

  getSnapshot(): HealthSnapshot {
    return {
      current: this.current,
      max: this.max,
    };
  }

  private clamp(value: number) {
    return Math.max(0, Math.min(this.max, value));
  }
}
