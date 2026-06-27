import { type Enemy, EnemyStates } from "./enemy";
import type { FireContext } from "./enemyConfig";

// 1. Strategy interface.
export interface IEnemyStrategy {
  update(enemy: Enemy, dt: number): void;
}

// 2. Strategy identifiers.
export const EnemyStrategies = {
  Default: "default",
  FixedInterval: "fixedInterval",
} as const;

export type EnemyStrategyId =
  (typeof EnemyStrategies)[keyof typeof EnemyStrategies];

// 3. Factory type for creating a strategy instance from an ID.
export type EnemyStrategyFactory = (ctx: FireContext) => IEnemyStrategy;

// 4. ID to factory map.
export const enemyStrategyFactories = new Map<EnemyStrategyId, EnemyStrategyFactory>();

// 5. One-time registration function.
export function setupEnemyStrategyFactories(ctx: FireContext) {
  // The default strategy is stateless, so sharing is fine.
  enemyStrategyFactories.set(EnemyStrategies.Default, () => defaultEnemyStrategy);

  // FixedInterval owns a timer, so create a fresh instance each time.
  enemyStrategyFactories.set(
    EnemyStrategies.FixedInterval,
    () => new FixedIntervalFireStrategy(ctx)
  );
}

// ---- Strategy implementations ----

// Default only destroys the enemy after it dies.
export const defaultEnemyStrategy: IEnemyStrategy = {
  update(enemy, _dt) {
    if (enemy.State === EnemyStates.Dead) {
      enemy.owner?.destroy();
    }
  }
};

export class FixedIntervalFireStrategy implements IEnemyStrategy {
  private readonly timers: number[] = [];
  private readonly ctx: FireContext;

  constructor(ctx: FireContext) {
    this.ctx = ctx;
  }

  update(enemy: Enemy, dt: number): void {
    // Do nothing after death except destroy the owner.
    if (enemy.State === EnemyStates.Dead) {
      enemy.owner?.destroy();
    }

    const attacks = enemy.config.attacks;
    if (attacks.length === 0) {
      return;
    }

    for (let i = 0; i < attacks.length; i += 1) {
      const attack = attacks[i];
      const interval = Math.max(attack.intervalSec, 0.1);
      this.timers[i] = (this.timers[i] ?? 0) + dt;

      if (this.timers[i] >= interval) {
        this.timers[i] -= interval;
        attack.fire(this.ctx, enemy);
      }
    }
  }
}
