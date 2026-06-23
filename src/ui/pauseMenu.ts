export type PauseMenuOptions = {
  onResume: () => void;
};

export class PauseMenu {
  private readonly root: HTMLDivElement;
  private readonly resumeButton: HTMLButtonElement;
  private readonly onResume: () => void;

  constructor(options: PauseMenuOptions) {
    this.onResume = options.onResume;

    this.root = document.createElement("div");
    this.root.style.position = "fixed";
    this.root.style.inset = "0";
    this.root.style.zIndex = "20";
    this.root.style.display = "none";
    this.root.style.alignItems = "center";
    this.root.style.justifyContent = "center";
    this.root.style.background = "rgba(0, 0, 0, 0.52)";
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

    const title = document.createElement("h2");
    title.textContent = "Paused";
    title.style.margin = "0 0 16px";
    title.style.fontSize = "24px";
    title.style.fontWeight = "700";

    this.resumeButton = document.createElement("button");
    this.resumeButton.type = "button";
    this.resumeButton.textContent = "Resume";
    this.resumeButton.style.width = "160px";
    this.resumeButton.style.height = "40px";
    this.resumeButton.style.border = "1px solid rgba(255, 255, 255, 0.35)";
    this.resumeButton.style.borderRadius = "6px";
    this.resumeButton.style.background = "#e8f2ff";
    this.resumeButton.style.color = "#07111f";
    this.resumeButton.style.fontSize = "15px";
    this.resumeButton.style.fontWeight = "700";
    this.resumeButton.style.cursor = "pointer";
    this.resumeButton.addEventListener("click", this.handleResume);

    panel.append(title, this.resumeButton);
    this.root.append(panel);
    document.body.appendChild(this.root);
  }

  show() {
    this.root.style.display = "flex";
    this.resumeButton.focus();
  }

  hide() {
    this.root.style.display = "none";
  }

  dispose() {
    this.resumeButton.removeEventListener("click", this.handleResume);
    this.root.remove();
  }

  private handleResume = () => {
    this.onResume();
  };
}
