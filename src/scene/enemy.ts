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

// Define enemy states as a union type.
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

    // Enemy-side hit handling.
    col.onTriggerEnter = (other) => {
      // Ignore non-bullet colliders.
      if (other.layer !== "bullet") return;

      const bulletOwner = other.owner;
    if (!bulletOwner) return;

    // Check whether the other object owns a Projectile component.
    const proj = bulletOwner.getComponent(Projectile);
    if (!proj) return;

    // Ignore bullets that do not target the enemy layer.
    if (!proj.canHit("enemy")) return;

      console.log("[Enemy] hit by bullet", { self: this.owner, other });
      this.kill();
      // Consider moving state management into a dedicated class later.
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

  // Lifecycle.
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

 
