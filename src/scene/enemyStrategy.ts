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
    () => new FixedIntervalFireStrategy(ctx, 0.5)
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
  private timer = 0;
  private readonly interval: number;
  private readonly ctx: FireContext;

  constructor(ctx: FireContext, interval: number) {
    this.ctx = ctx;
    this.interval = Math.max(interval, 0.1);
  }

  update(enemy: Enemy, dt: number): void {
    // Do nothing after death except destroy the owner.
    if (enemy.State === EnemyStates.Dead) {
      enemy.owner?.destroy();
    }

    const config = enemy.config;
    if (!config || !config.fire) {
      return;
    }

    this.timer += dt;
    if (this.timer >= this.interval) {
      console.log("fire");
      this.timer -= this.interval;
      config.fire(this.ctx, enemy);
    }
  }
}
