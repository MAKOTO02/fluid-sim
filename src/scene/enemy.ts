// enemy.ts
import type { Component } from "./component";
import type { GameObject } from "./gameObject";
import { SphereCollider } from "./collider";
import { Projectile } from "./projectile";
import { type EnemyConfig, enemyConfigs, type FireContext} from "./enemyConfig";
import { type IEnemyStrategy, defaultEnemyStrategy } from "./enemyStrategy";
import type { Transform } from "./transform";
import type { Scene } from "./scene";

export const EnemyStates = {
  Default: "default",
  Dead: "dead",
} as const;

// 型は union 型として定義
export type EnemyState = (typeof EnemyStates)[keyof typeof EnemyStates];

export class Enemy implements Component {
  enabled = true;
  owner?: GameObject;
  private state: EnemyState = EnemyStates.Default;
  name: string = "enemy";
  readonly config: EnemyConfig;
  private strategy: IEnemyStrategy;
  target?: Transform;

  constructor(typeId: number, ctx: FireContext,  name?: string){
    const cfg = enemyConfigs.get(typeId);
    if (!cfg) {
      throw new Error(`EnemyConfig not found for typeId=${typeId}`);
    }
    this.config = cfg;
    this.name = name ?? "enemy";

    this.strategy = cfg.createStrategy
      ? cfg.createStrategy(ctx)
      : defaultEnemyStrategy;
  }

  setTarget(t: Transform){
    this.target = t;
  }

  start(): void {
    if (!this.owner) return;

    const col = this.owner.getComponent(SphereCollider);
    if (!col) {
      console.warn("Enemy: SphereCollider が見つかりません");
      return;
    }

    // ★ Enemy 側のヒット処理をここに
    col.onTriggerEnter = (other) => {
      // bullet 以外は無視
      if (other.layer !== "bullet") return;

      const bulletOwner = other.owner;
    if (!bulletOwner) return;

    // そのオブジェクトが Projectile を持っているか確認
    const proj = bulletOwner.getComponent(Projectile);
    if (!proj) return;

    // この弾が「enemy レイヤー」をターゲットにしていなければ無視
    if (!proj.canHit("enemy")) return;

      console.log("[Enemy] hit by bullet", { self: this.owner, other });
      this.kill();  // 仮にこうしておく.
      // stateを管理するクラスを用意すべき？
    };
  }

  update(dt: number): void {
    this.strategy.update(this, dt);
  }


  onAttach?(): void {

  }
  onDetach?(): void {

  }

  get State(): EnemyState{
    return this.state;
  }

  get instanceId(): number | undefined {
    return this.owner?.id;
  }

  // ライフサイクル
  kill(): void{
    this.state = "dead";
    console.log(`${this.name} is killed.`);
  }

  createVisual(gl: WebGLRenderingContext | WebGL2RenderingContext, scene: Scene){
    if(this.owner) {
        this.config.visual(gl, scene, this.owner, this.config);
    }
  }
}

 
