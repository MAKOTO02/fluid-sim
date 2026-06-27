// enemy.ts
import type { Component } from "./component";
import type { GameObject } from "./gameObject";
import { Health } from "./health";
import { SphereCollider, type Collider } from "./collider";
import { Projectile } from "./projectile";
import { type EnemyConfig, getEnemyConfig, type FireContext, type EnemyTypeId } from "./enemyConfig";
import { type IEnemyStrategy, defaultEnemyStrategy } from "./enemyStrategy";
import type { InkZoneRegistry } from "./inkZoneRegistry";
import type { Transform } from "./transform";
import type { Scene } from "./scene";

export const EnemyStates = {
  Default: "default",
  Dead: "dead",
} as const;

// Define enemy states as a union type.
export type EnemyState = (typeof EnemyStates)[keyof typeof EnemyStates];

const PLAYER_BULLET_DAMAGE = 1;

export class Enemy implements Component {
  enabled = true;
  owner?: GameObject;
  private state: EnemyState = EnemyStates.Default;
  name: string = "enemy";
  readonly config: EnemyConfig;
  private strategy: IEnemyStrategy;
  private readonly playerContacts = new Set<Collider>();
  private readonly inkZoneRegistry?: InkZoneRegistry;
  target?: Transform;

  constructor(typeId: EnemyTypeId, ctx: FireContext, name?: string, inkZoneRegistry?: InkZoneRegistry){
    const cfg = getEnemyConfig(typeId);
    this.config = cfg;
    this.name = name ?? "enemy";
    this.inkZoneRegistry = inkZoneRegistry;

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

    col.onTriggerEnter = (other) => {
      this.handleTriggerEnter(other);
    };
    col.onTriggerStay = (other) => {
      this.handleTriggerStay(other);
    };
    col.onTriggerExit = (other) => {
      this.handleTriggerExit(other);
    };
  }

  update(dt: number): void {
    this.applyContactDamage(dt);
    this.applyInkDamage(dt);
    this.strategy.update(this, dt);
  }


  onAttach?(): void {

  }
  onDetach?(): void {
    this.playerContacts.clear();
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

  private handleTriggerEnter(other: Collider): void {
    this.addPlayerContact(other);
    this.handleProjectileHit(other);
  }

  private handleTriggerStay(other: Collider): void {
    this.addPlayerContact(other);
  }

  private handleTriggerExit(other: Collider): void {
    if (other.layer !== "player") return;
    this.playerContacts.delete(other);
  }

  private addPlayerContact(other: Collider): void {
    if (other.layer !== "player") return;
    this.playerContacts.add(other);
  }

  private handleProjectileHit(other: Collider): void {
    if (other.layer !== "playerBullet") return;

    const bulletOwner = other.owner;
    if (!bulletOwner) return;

    const proj = bulletOwner.getComponent(Projectile);
    if (!proj || !proj.canHit("enemy")) return;

    const health = this.owner?.getComponent(Health);
    health?.applyDamage(PLAYER_BULLET_DAMAGE);

    if (!health || health.isDead()) {
      this.kill();
    }
  }

  private applyContactDamage(dt: number): void {
    if (this.state === EnemyStates.Dead) return;

    const damage = this.config.contactDamagePerSecond * dt;
    if (damage <= 0) return;

    for (const playerCollider of this.playerContacts) {
      const player = playerCollider.owner;
      if (!player || !player.active || player.destroyed) {
        this.playerContacts.delete(playerCollider);
        continue;
      }

      player.getComponent(Health)?.applyDamage(damage);
    }
  }

  private applyInkDamage(dt: number): void {
    if (this.state === EnemyStates.Dead) return;
    if (!this.owner || !this.inkZoneRegistry) return;

    const damage = this.config.inkDamagePerSecond * dt;
    if (damage <= 0) return;

    if (!this.inkZoneRegistry.containsPoint(this.owner.transform.getWorldPosition())) {
      return;
    }

    const health = this.owner.getComponent(Health);
    health?.applyDamage(damage);
    if (!health || health.isDead()) {
      this.kill();
    }
  }
}

 
