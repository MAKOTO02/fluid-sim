export type DebugToggleButtonOptions = {
  label: string;
  initialChecked: boolean;
  onChanged: (checked: boolean) => void;
};

export class DebugToggleButton {
  private readonly button: HTMLButtonElement;
  private checked: boolean;

  constructor(options: DebugToggleButtonOptions) {
    this.checked = options.initialChecked;

    this.button = document.createElement("button");
    this.button.type = "button";
    this.button.style.position = "fixed";
    this.button.style.right = "16px";
    this.button.style.bottom = "16px";
    this.button.style.zIndex = "10";
    this.button.style.height = "32px";
    this.button.style.padding = "0 12px";
    this.button.style.border = "1px solid rgba(255, 255, 255, 0.28)";
    this.button.style.borderRadius = "6px";
    this.button.style.background = "rgba(5, 8, 12, 0.78)";
    this.button.style.color = "#f5f7ff";
    this.button.style.font = "12px system-ui, sans-serif";
    this.button.style.cursor = "pointer";
    this.button.addEventListener("click", () => {
      this.setChecked(!this.checked);
      options.onChanged(this.checked);
    });

    document.body.appendChild(this.button);
    this.updateLabel(options.label);
  }

  setChecked(checked: boolean): void {
    this.checked = checked;
    this.updatePressed();
  }

  dispose(): void {
    this.button.remove();
  }

  private updateLabel(label: string): void {
    this.button.dataset.label = label;
    this.updatePressed();
  }

  private updatePressed(): void {
    const label = this.button.dataset.label ?? "Toggle";
    this.button.textContent = `${label}: ${this.checked ? "ON" : "OFF"}`;
    this.button.style.opacity = this.checked ? "1" : "0.62";
    this.button.setAttribute("aria-pressed", String(this.checked));
  }
}
