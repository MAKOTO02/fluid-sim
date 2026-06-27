import type { StageDefinition } from "../stage/stageDefinition";

export type StageSelectMenuOptions = {
  stages: readonly StageDefinition[];
  onSelectStage: (stage: StageDefinition) => void;
  onBack: () => void;
};

export class StageSelectMenu {
  private readonly root: HTMLDivElement;
  private readonly selectButtons: HTMLButtonElement[] = [];
  private readonly selectHandlers: Array<() => void> = [];
  private readonly backButton: HTMLButtonElement;
  private readonly onSelectStage: (stage: StageDefinition) => void;
  private readonly onBack: () => void;
  private readonly stages: readonly StageDefinition[];

  constructor(options: StageSelectMenuOptions) {
    this.onSelectStage = options.onSelectStage;
    this.onBack = options.onBack;
    this.stages = options.stages;

    this.root = document.createElement("div");
    this.root.style.position = "fixed";
    this.root.style.inset = "0";
    this.root.style.zIndex = "20";
    this.root.style.display = "none";
    this.root.style.alignItems = "center";
    this.root.style.justifyContent = "center";
    this.root.style.background = "rgba(0, 0, 0, 0.72)";
    this.root.style.color = "#f5f7ff";
    this.root.style.fontFamily = "system-ui, sans-serif";

    const panel = document.createElement("div");
    panel.style.width = "min(360px, calc(100vw - 32px))";
    panel.style.padding = "22px";
    panel.style.border = "1px solid rgba(255, 255, 255, 0.22)";
    panel.style.borderRadius = "8px";
    panel.style.background = "rgba(8, 12, 18, 0.92)";
    panel.style.textAlign = "center";
    panel.style.boxShadow = "0 18px 60px rgba(0, 0, 0, 0.38)";

    const title = document.createElement("h2");
    title.textContent = "Select Stage";
    title.style.margin = "0 0 16px";
    title.style.fontSize = "24px";
    title.style.fontWeight = "700";

    const stageButtons = this.stages.map((stage) => {
      const button = this.createButton(stage.name);
      const handler = () => this.onSelectStage(stage);
      button.addEventListener("click", handler);
      this.selectButtons.push(button);
      this.selectHandlers.push(handler);
      return button;
    });

    this.backButton = this.createButton("Back");
    this.backButton.style.marginTop = "10px";
    this.backButton.style.background = "rgba(255, 255, 255, 0.08)";
    this.backButton.style.color = "#f5f7ff";
    this.backButton.addEventListener("click", this.handleBack);

    panel.append(title, ...stageButtons, this.backButton);
    this.root.append(panel);
    document.body.appendChild(this.root);
  }

  show(): void {
    this.root.style.display = "flex";
    this.selectButtons[0]?.focus();
  }

  hide(): void {
    this.root.style.display = "none";
  }

  dispose(): void {
    this.selectButtons.forEach((button, index) => {
      const handler = this.selectHandlers[index];
      if (handler) button.removeEventListener("click", handler);
    });
    this.backButton.removeEventListener("click", this.handleBack);
    this.root.remove();
  }

  private createButton(text: string): HTMLButtonElement {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = text;
    button.style.display = "block";
    button.style.width = "180px";
    button.style.height = "40px";
    button.style.margin = "0 auto";
    button.style.border = "1px solid rgba(255, 255, 255, 0.35)";
    button.style.borderRadius = "6px";
    button.style.background = "#e8f2ff";
    button.style.color = "#07111f";
    button.style.fontSize = "15px";
    button.style.fontWeight = "700";
    button.style.cursor = "pointer";
    return button;
  }

  private handleBack = (): void => {
    this.onBack();
  };
}
