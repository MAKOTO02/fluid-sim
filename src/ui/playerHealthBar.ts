import type { HealthSnapshot } from "../scene/health";
import type { PlayerInkSnapshot } from "../scene/playerInk";

export class PlayerHealthBar {
  private readonly root: HTMLDivElement;
  private readonly healthFill: HTMLDivElement;
  private readonly healthLabel: HTMLDivElement;
  private readonly inkFill: HTMLDivElement;
  private readonly inkLabel: HTMLDivElement;

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

    const healthRow = this.createBarRow("HP 0 / 0", "#5ee985");
    this.healthLabel = healthRow.label;
    this.healthFill = healthRow.fill;

    const inkRow = this.createBarRow("INK 0 / 0", "#42d6ff");
    this.inkLabel = inkRow.label;
    this.inkFill = inkRow.fill;
    inkRow.container.style.marginTop = "8px";

    this.root.append(healthRow.container, inkRow.container);
    document.body.appendChild(this.root);
  }

  setHealth(health?: HealthSnapshot): void {
    if (!health || health.max <= 0) {
      this.healthLabel.textContent = "HP -- / --";
      this.healthFill.style.width = "0%";
      return;
    }

    const current = Math.max(0, Math.min(health.current, health.max));
    const ratio = current / health.max;
    this.healthLabel.textContent = `HP ${Math.ceil(current)} / ${Math.ceil(health.max)}`;
    this.healthFill.style.width = `${ratio * 100}%`;
    this.healthFill.style.background = ratio > 0.35 ? "#5ee985" : "#ff5c64";
  }

  setInk(ink?: PlayerInkSnapshot): void {
    if (!ink || ink.max <= 0) {
      this.inkLabel.textContent = "INK -- / --";
      this.inkFill.style.width = "0%";
      return;
    }

    const current = Math.max(0, Math.min(ink.current, ink.max));
    const ratio = current / ink.max;
    this.inkLabel.textContent = `INK ${Math.ceil(current)} / ${Math.ceil(ink.max)}`;
    this.inkFill.style.width = `${ratio * 100}%`;
    this.inkFill.style.background = ratio > 0.25 ? "#42d6ff" : "#ffb547";
  }

  dispose(): void {
    this.root.remove();
  }

  private createBarRow(labelText: string, color: string): {
    container: HTMLDivElement;
    label: HTMLDivElement;
    fill: HTMLDivElement;
  } {
    const container = document.createElement("div");

    const label = document.createElement("div");
    label.textContent = labelText;
    label.style.marginBottom = "5px";
    label.style.fontWeight = "700";

    const track = document.createElement("div");
    track.style.height = "10px";
    track.style.overflow = "hidden";
    track.style.borderRadius = "5px";
    track.style.background = "rgba(255, 255, 255, 0.14)";

    const fill = document.createElement("div");
    fill.style.width = "0%";
    fill.style.height = "100%";
    fill.style.borderRadius = "5px";
    fill.style.background = color;
    fill.style.transition = "width 120ms linear";

    track.appendChild(fill);
    container.append(label, track);

    return { container, label, fill };
  }
}
