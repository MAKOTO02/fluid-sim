import type { HealthSnapshot } from "../scene/health";

export class PlayerHealthBar {
  private readonly root: HTMLDivElement;
  private readonly fill: HTMLDivElement;
  private readonly label: HTMLDivElement;

  constructor() {
    this.root = document.createElement("div");
    this.root.style.position = "fixed";
    this.root.style.left = "16px";
    this.root.style.bottom = "16px";
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

    this.label = document.createElement("div");
    this.label.textContent = "HP 0 / 0";
    this.label.style.marginBottom = "5px";
    this.label.style.fontWeight = "700";

    const track = document.createElement("div");
    track.style.height = "10px";
    track.style.overflow = "hidden";
    track.style.borderRadius = "5px";
    track.style.background = "rgba(255, 255, 255, 0.14)";

    this.fill = document.createElement("div");
    this.fill.style.width = "0%";
    this.fill.style.height = "100%";
    this.fill.style.borderRadius = "5px";
    this.fill.style.background = "#5ee985";
    this.fill.style.transition = "width 120ms linear";

    track.appendChild(this.fill);
    this.root.append(this.label, track);
    document.body.appendChild(this.root);
  }

  setHealth(health?: HealthSnapshot): void {
    if (!health || health.max <= 0) {
      this.label.textContent = "HP -- / --";
      this.fill.style.width = "0%";
      return;
    }

    const current = Math.max(0, Math.min(health.current, health.max));
    const ratio = current / health.max;
    this.label.textContent = `HP ${Math.ceil(current)} / ${Math.ceil(health.max)}`;
    this.fill.style.width = `${ratio * 100}%`;
    this.fill.style.background = ratio > 0.35 ? "#5ee985" : "#ff5c64";
  }

  dispose(): void {
    this.root.remove();
  }
}
