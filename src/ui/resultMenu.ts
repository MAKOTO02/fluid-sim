import type { GameState } from "../app/gameController";

export type ResultMenuOptions = {
  onReturnToTitle: () => void;
};

export class ResultMenu {
  private readonly root: HTMLDivElement;
  private readonly title: HTMLHeadingElement;
  private readonly returnButton: HTMLButtonElement;
  private readonly onReturnToTitle: () => void;

  constructor(options: ResultMenuOptions) {
    this.onReturnToTitle = options.onReturnToTitle;

    this.root = document.createElement("div");
    this.root.style.position = "fixed";
    this.root.style.inset = "0";
    this.root.style.zIndex = "20";
    this.root.style.display = "none";
    this.root.style.alignItems = "center";
    this.root.style.justifyContent = "center";
    this.root.style.background = "rgba(0, 0, 0, 0.58)";
    this.root.style.color = "#f5f7ff";
    this.root.style.fontFamily = "system-ui, sans-serif";

    const panel = document.createElement("div");
    panel.style.width = "min(340px, calc(100vw - 32px))";
    panel.style.padding = "22px";
    panel.style.border = "1px solid rgba(255, 255, 255, 0.22)";
    panel.style.borderRadius = "8px";
    panel.style.background = "rgba(8, 12, 18, 0.92)";
    panel.style.textAlign = "center";
    panel.style.boxShadow = "0 18px 60px rgba(0, 0, 0, 0.38)";

    this.title = document.createElement("h2");
    this.title.style.margin = "0 0 16px";
    this.title.style.fontSize = "24px";
    this.title.style.fontWeight = "700";

    this.returnButton = document.createElement("button");
    this.returnButton.type = "button";
    this.returnButton.textContent = "Back to Title";
    this.returnButton.style.width = "160px";
    this.returnButton.style.height = "40px";
    this.returnButton.style.border = "1px solid rgba(255, 255, 255, 0.35)";
    this.returnButton.style.borderRadius = "6px";
    this.returnButton.style.background = "#e8f2ff";
    this.returnButton.style.color = "#07111f";
    this.returnButton.style.fontSize = "15px";
    this.returnButton.style.fontWeight = "700";
    this.returnButton.style.cursor = "pointer";
    this.returnButton.addEventListener("click", this.handleReturnToTitle);

    panel.append(this.title, this.returnButton);
    this.root.append(panel);
    document.body.appendChild(this.root);
  }

  setGameState(state: GameState): void {
    if (state === "cleared") {
      this.show("Stage Clear");
    } else if (state === "gameOver") {
      this.show("Game Over");
    } else {
      this.hide();
    }
  }

  dispose(): void {
    this.returnButton.removeEventListener("click", this.handleReturnToTitle);
    this.root.remove();
  }

  private show(title: string): void {
    this.title.textContent = title;
    this.root.style.display = "flex";
    this.returnButton.focus();
  }

  private hide(): void {
    this.root.style.display = "none";
  }

  private handleReturnToTitle = (): void => {
    this.onReturnToTitle();
  };
}
