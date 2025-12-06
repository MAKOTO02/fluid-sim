import { type Component } from "./component";
import { Transform } from "./transform";
import type { Scene } from "./scene";

let nextId = 1;
export class GameObject {
  active: boolean = true;
  destroyed = false;
  transform = new Transform();
  private components: Component[] = [];
  private componentStarted = new WeakMap<Component, boolean>();
  readonly id: number;
  name: string;
  layer: number = 1 << 0;
  scene?: Scene;

  constructor(name = "GameObject") {
    this.id = nextId++;
    this.name = name;
  }

  setActive(b: boolean){
    if (this.active === b) return;
    this.active = b;

    if (b) {
      // 有効化
      for (const c of this.components) {
        c.onEnable?.();
      }
    } else {
      // 無効化
      for (const c of this.components) {
        c.onDisable?.();
      }
    }
  }

  addComponent<T extends Component>(comp: T): T {
    this.components.push(comp);
    comp.owner = this;
    comp.onAttach?.();
    return comp;
  }

  getComponent<T extends Component>(ctor: new (...args: any[]) => T): T | null {
    for (const c of this.components) {
      if (c instanceof ctor) {
        return c as T;
      }
    }
    return null;
  }
  getComponents<T extends Component>(ctor: new (...args: any[]) => T): T[] {
    const result: T[] = [];
    for (const c of this.components) {
      if (c instanceof ctor) {
        result.push(c as T);
      }
    }
    return result;
  }

  removeComponent(comp: Component) {
    const idx = this.components.indexOf(comp);
    if (idx >= 0) {
      this.components.splice(idx, 1);
      comp.onDetach?.();
    }
  }

  update(dt: number) {
    if(!this.active || this.destroyed) return;
    // --- 1回だけ start させる ---
    for (const c of this.components) {
        if (!this.componentStarted.get(c)) {
            c.start?.();
            this.componentStarted.set(c, true);
        }
    }
    this.components.forEach(c => c.enabled && c.update?.(dt));
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    this.active = false;
    this.scene?.markForDestroy(this);
  }

  forEachComponent(cb: (c: Component) => void) {
    for (const c of this.components) cb(c);
  }
}
