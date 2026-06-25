import type { Component } from "./component";
import type { GameObject } from "./gameObject";

export type PlayerInkSnapshot = {
  current: number;
  max: number;
};

export class PlayerInk implements Component {
  enabled = true;
  owner?: GameObject;

  private current: number;
  private readonly max: number;

  constructor(max = 100, current = max) {
    this.max = Math.max(max, 0);
    this.current = this.clamp(current);
  }

  getCurrent(): number {
    return this.current;
  }

  getMax(): number {
    return this.max;
  }

  consume(amount: number): number {
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

  has(amount: number): boolean {
    return this.current >= amount;
  }

  getSnapshot(): PlayerInkSnapshot {
    return {
      current: this.current,
      max: this.max,
    };
  }

  private clamp(value: number): number {
    return Math.max(0, Math.min(this.max, value));
  }
}
