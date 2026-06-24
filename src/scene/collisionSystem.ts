import type { Collider } from "./collider";

type ContactPair = {
  a: Collider;
  b: Collider;
};

export class CollisionSystem {
  private colliders: Collider[] = [];
  private previousContacts = new Map<string, ContactPair>();
  private colliderIds = new WeakMap<Collider, number>();
  private nextColliderId = 1;

  add(c: Collider) {
    this.colliders.push(c);
    this.getColliderId(c);
  }

  remove(c: Collider) {
    this.endContactsFor(c);
    this.colliders = this.colliders.filter(x => x !== c);
  }

  // Called every frame.
  update(_dt: number) {
    const n = this.colliders.length;
    const currentContacts = new Map<string, ContactPair>();

    for (let i = 0; i < n; i++) {
      const a = this.colliders[i];
      if (!this.isColliderActive(a)) continue;

      for (let j = i + 1; j < n; j++) {
        const b = this.colliders[j];
        if (!this.isColliderActive(b)) continue;

        // Add layer-mask filtering here if needed.
        if (!this.shouldCollide(a, b)) continue;

        if (this.areIntersecting(a, b)) {
          // Trigger pairs only emit events.
          if (a.isTrigger && b.isTrigger) {
            const key = this.getPairKey(a, b);

            if (this.previousContacts.has(key)) {
              this.emitTriggerStay(a, b);
            } else {
              this.emitTriggerEnter(a, b);
            }

            if (this.isColliderActive(a) && this.isColliderActive(b)) {
              currentContacts.set(key, { a, b });
            }
          }
          // Add physical response here if needed.
        }
      }
    }

    for (const [key, pair] of this.previousContacts) {
      if (!currentContacts.has(key)) {
        this.emitTriggerExit(pair.a, pair.b);
      }
    }

    this.previousContacts = currentContacts;
  }

  private shouldCollide(_a: Collider, _b: Collider): boolean {
    // Add layer-pair rules here if broader collision filtering is needed.
    return true;
  }

  private isColliderActive(collider: Collider): boolean {
    const owner = collider.owner;
    return collider.enabled && !!owner && owner.active && !owner.destroyed;
  }

  private areIntersecting(a: Collider, b: Collider): boolean {
    return a.intersects(b) || b.intersects(a);
  }

  private getColliderId(collider: Collider): number {
    const existing = this.colliderIds.get(collider);
    if (existing != null) return existing;

    const id = this.nextColliderId++;
    this.colliderIds.set(collider, id);
    return id;
  }

  private getPairKey(a: Collider, b: Collider): string {
    const aId = this.getColliderId(a);
    const bId = this.getColliderId(b);
    return aId < bId ? `${aId}:${bId}` : `${bId}:${aId}`;
  }

  private emitTriggerEnter(a: Collider, b: Collider): void {
    a.onTriggerEnter?.(b);
    b.onTriggerEnter?.(a);
  }

  private emitTriggerStay(a: Collider, b: Collider): void {
    a.onTriggerStay?.(b);
    b.onTriggerStay?.(a);
  }

  private emitTriggerExit(a: Collider, b: Collider): void {
    a.onTriggerExit?.(b);
    b.onTriggerExit?.(a);
  }

  private endContactsFor(collider: Collider): void {
    for (const [key, pair] of this.previousContacts) {
      if (pair.a !== collider && pair.b !== collider) continue;

      this.emitTriggerExit(pair.a, pair.b);
      this.previousContacts.delete(key);
    }
  }
}
