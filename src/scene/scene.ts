import type { GameObject } from "./gameObject";
import type { CameraComponent } from "./camera";
import { CollisionSystem } from "./collisionSystem";

export class Scene{
    private objects: GameObject[] = [];
    private _mainCamera: CameraComponent | null = null;
    private destroyQueue: GameObject[] = [];

    readonly collisionSystem = new CollisionSystem();

    addObject(obj: GameObject){
        this.objects.push(obj);
        obj.scene = this;
    }
    removeObject(obj: GameObject){
        const i = this.objects.indexOf(obj);
        if(i >= 0){
            this.objects.splice(i, 1);
        }
    }
    markForDestroy(obj: GameObject) {
        this.destroyQueue.push(obj);
    }
    findByName(name: string): GameObject | null{
        return this.objects.find(o => o.name === name) ?? null;
    }
    setMainCamera(cam: CameraComponent){
        this._mainCamera = cam;
    } 
    get MainCamera(): CameraComponent | null{
        return this._mainCamera;
    }

    update(dt: number){
        for(const obj of this.objects){  
            obj.update(dt);
        }
        this.collisionSystem.update(dt);

        // ★ ここでまとめて破棄
        if (this.destroyQueue.length > 0) {
            const toRemove = new Set(this.destroyQueue);
            for (const obj of this.destroyQueue) {
                obj.forEachComponent(c => c.onDetach?.());
            }
            this.objects = this.objects.filter(o => !toRemove.has(o));
            this.destroyQueue.length = 0;
        }
    }

    getObjects(): readonly GameObject[] {
        return this.objects;
    }
}