import { type Enemy, EnemyStates } from "./enemy";
import type { FireContext } from "./enemyConfig";

// 1. Strategy インターフェース
export interface IEnemyStrategy {
  update(enemy: Enemy, dt: number): void;
}

// 2. 識別子
export const EnemyStrategies = {
  Default: "default",
  FixedInterval: "fixedInterval",
} as const;

export type EnemyStrategyId =
  (typeof EnemyStrategies)[keyof typeof EnemyStrategies];

// 3. 「この ID から Strategy インスタンスを作る」ファクトリ型
export type EnemyStrategyFactory = (ctx: FireContext) => IEnemyStrategy;

// 4. ID → ファクトリ のマップ
export const enemyStrategyFactories = new Map<EnemyStrategyId, EnemyStrategyFactory>();

// 5. 一度だけ呼んで登録しておく初期化関数
export function setupEnemyStrategyFactories(ctx: FireContext) {
  // default はステートレスなので共有インスタンスでもOK
  enemyStrategyFactories.set(EnemyStrategies.Default, () => defaultEnemyStrategy);

  // FixedInterval は timer を持つので、毎回 new する
  enemyStrategyFactories.set(
    EnemyStrategies.FixedInterval,
    () => new FixedIntervalFireStrategy(ctx, 0.5)  // 仮に0.5秒
  );
}

// ---- Strategy 実装たち ----

// default は「死んでたら destroy するだけ」のシンプルなやつ
export const defaultEnemyStrategy: IEnemyStrategy = {
  update(enemy, dt) {
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
    // 死んでたら何もしない
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
