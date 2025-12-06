import { SphereCollider } from "./collider";

export class CollisionSystem {
  private colliders: SphereCollider[] = [];

  add(c: SphereCollider) {
    this.colliders.push(c);
  }

  remove(c: SphereCollider) {
    this.colliders = this.colliders.filter(x => x !== c);
  }

  // 毎フレーム呼ぶ
  update(dt: number) {
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

        // layer マスクでフィルタしたければここで
        if (!this.shouldCollide(a, b)) continue;

        const pb = bo.transform.getWorldPosition();
        const dx = pa[0] - pb[0];
        const dy = pa[1] - pb[1];
        const dz = pa[2] - pb[2]; // z 揃えておけば3DでもOK

        const r = a.radius + b.radius;
        if (dx*dx + dy*dy + dz*dz <= r*r) {
          // Trigger 同士ならイベントだけ
          if (a.isTrigger && b.isTrigger) {
            a.onTriggerEnter?.(b);
            b.onTriggerEnter?.(a);
          }
          // 物理反応つけるならここで
        }
      }
    }
  }

  private shouldCollide(a: SphereCollider, b: SphereCollider): boolean {
    // ここで layer 組合せを見て、「player vs enemyBullet は衝突させるけど
    // playerBullet vs player は無視」みたいなルールを入れられる
    return true;
  }
}
