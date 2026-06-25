import type { vec3 } from "gl-matrix";
import type { InkZone } from "./inkZone";

export class InkZoneRegistry {
  private readonly zones = new Set<InkZone>();

  register(zone: InkZone): void {
    this.zones.add(zone);
  }

  unregister(zone: InkZone): void {
    this.zones.delete(zone);
  }

  containsPoint(position: vec3): boolean {
    for (const zone of this.zones) {
      if (zone.containsPoint(position)) return true;
    }
    return false;
  }
}
