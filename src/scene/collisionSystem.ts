import type { Collider } from "./collider";

export class CollisionSystem {
  private colliders: Collider[] = [];

  add(c: Collider) {
    this.colliders.push(c);
  }

  remove(c: Collider) {
    this.colliders = this.colliders.filter(x => x !== c);
  }

  // Called every frame.
  update(_dt: number) {
    const n = this.colliders.length;
    for (let i = 0; i < n; i++) {
      const a = this.colliders[i];
      const ao = a.owner;
      if (!a.enabled || !ao) continue;

      for (let j = i + 1; j < n; j++) {
        const b = this.colliders[j];
        const bo = b.owner;
        if (!b.enabled || !bo) continue;

        // Add layer-mask filtering here if needed.
        if (!this.shouldCollide(a, b)) continue;

        if (this.areIntersecting(a, b)) {
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

  private shouldCollide(_a: Collider, _b: Collider): boolean {
    // Add layer-pair rules here if broader collision filtering is needed.
    return true;
  }

  private areIntersecting(a: Collider, b: Collider): boolean {
    return a.intersects(b) || b.intersects(a);
  }
}
