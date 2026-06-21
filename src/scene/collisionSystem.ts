import { SphereCollider } from "./collider";

export class CollisionSystem {
  private colliders: SphereCollider[] = [];

  add(c: SphereCollider) {
    this.colliders.push(c);
  }

  remove(c: SphereCollider) {
    this.colliders = this.colliders.filter(x => x !== c);
  }

  // Called every frame.
  update(_dt: number) {
    const n = this.colliders.length;
    for (let i = 0; i < n; i++) {
      const a = this.colliders[i];
      const ao = a.owner;
      if (!a.enabled || !ao) continue;

      const pa = ao.transform.getWorldPosition();

      for (let j = i + 1; j < n; j++) {
        const b = this.colliders[j];
        const bo = b.owner;
        if (!b.enabled || !bo) continue;

        // Add layer-mask filtering here if needed.
        if (!this.shouldCollide(a, b)) continue;

        const pb = bo.transform.getWorldPosition();
        const dx = pa[0] - pb[0];
        const dy = pa[1] - pb[1];
        const dz = pa[2] - pb[2]; // Works in 3D when z is aligned.

        const r = a.radius + b.radius;
        if (dx*dx + dy*dy + dz*dz <= r*r) {
          // Trigger pairs only emit events.
          if (a.isTrigger && b.isTrigger) {
            a.onTriggerEnter?.(b);
            b.onTriggerEnter?.(a);
          }
          // Add physical response here if needed.
        }
      }
    }
  }

  private shouldCollide(_a: SphereCollider, _b: SphereCollider): boolean {
    // Add layer-pair rules here, such as allowing player vs enemyBullet
    // while ignoring playerBullet vs player.
    return true;
  }
}
