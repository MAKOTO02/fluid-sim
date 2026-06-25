import type { GameObjectSnapshot } from "../app/worldSnapshot";

export class EnemyHealthPanel {
  private readonly root: HTMLDivElement;
  private readonly list: HTMLDivElement;

  constructor() {
    this.root = document.createElement("div");
    this.root.style.position = "fixed";
    this.root.style.right = "16px";
    this.root.style.top = "16px";
    this.root.style.zIndex = "10";
    this.root.style.width = "220px";
    this.root.style.padding = "8px";
    this.root.style.border = "1px solid rgba(255, 255, 255, 0.22)";
    this.root.style.borderRadius = "6px";
    this.root.style.background = "rgba(5, 8, 12, 0.72)";
    this.root.style.color = "#f5f7ff";
    this.root.style.fontFamily = "system-ui, sans-serif";
    this.root.style.fontSize = "12px";
    this.root.style.pointerEvents = "none";

    const title = document.createElement("div");
    title.textContent = "Enemy HP";
    title.style.marginBottom = "6px";
    title.style.fontWeight = "700";

    this.list = document.createElement("div");
    this.list.style.display = "grid";
    this.list.style.gap = "6px";

    this.root.append(title, this.list);
    document.body.appendChild(this.root);
  }

  setEnemies(enemies: GameObjectSnapshot[]): void {
    this.list.replaceChildren();

    const visibleEnemies = enemies.filter(enemy => enemy.health && !enemy.destroyed);
    if (visibleEnemies.length === 0) {
      this.root.style.display = "none";
      return;
    }

    this.root.style.display = "block";
    for (const enemy of visibleEnemies) {
      this.list.appendChild(this.createEnemyRow(enemy));
    }
  }

  dispose(): void {
    this.root.remove();
  }

  private createEnemyRow(enemy: GameObjectSnapshot): HTMLDivElement {
    const health = enemy.health;
    const current = health ? Math.max(0, Math.min(health.current, health.max)) : 0;
    const max = health?.max ?? 0;
    const ratio = max > 0 ? current / max : 0;

    const row = document.createElement("div");

    const label = document.createElement("div");
    label.textContent = `#${enemy.id} ${enemy.name} ${Math.ceil(current)} / ${Math.ceil(max)}`;
    label.style.marginBottom = "4px";
    label.style.color = "rgba(245, 247, 255, 0.86)";

    const track = document.createElement("div");
    track.style.height = "8px";
    track.style.overflow = "hidden";
    track.style.borderRadius = "4px";
    track.style.background = "rgba(255, 255, 255, 0.14)";

    const fill = document.createElement("div");
    fill.style.width = `${ratio * 100}%`;
    fill.style.height = "100%";
    fill.style.borderRadius = "4px";
    fill.style.background = ratio > 0.35 ? "#ff7373" : "#ffb15c";

    track.appendChild(fill);
    row.append(label, track);
    return row;
  }
}
