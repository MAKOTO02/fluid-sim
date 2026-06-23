export type StartMenuOptions = {
  title?: string;
  onStart: () => void;
};

export class StartMenu {
  private readonly root: HTMLDivElement;
  private readonly startButton: HTMLButtonElement;
  private readonly onStart: () => void;

  constructor(options: StartMenuOptions) {
    this.onStart = options.onStart;

    this.root = document.createElement("div");
    this.root.style.position = "fixed";
    this.root.style.inset = "0";
    this.root.style.zIndex = "20";
    this.root.style.display = "flex";
    this.root.style.alignItems = "center";
    this.root.style.justifyContent = "center";
    this.root.style.background = "rgba(0, 0, 0, 0.72)";
    this.root.style.color = "#f5f7ff";
    this.root.style.fontFamily = "system-ui, sans-serif";

    const panel = document.createElement("div");
    panel.style.width = "min(420px, calc(100vw - 32px))";
    panel.style.padding = "24px";
    panel.style.border = "1px solid rgba(255, 255, 255, 0.22)";
    panel.style.borderRadius = "8px";
    panel.style.background = "rgba(8, 12, 18, 0.92)";
    panel.style.textAlign = "center";
    panel.style.boxShadow = "0 18px 60px rgba(0, 0, 0, 0.38)";

    const title = document.createElement("h1");
    title.textContent = options.title ?? "Fluid Ink Arena";
    title.style.margin = "0 0 12px";
    title.style.fontSize = "28px";
    title.style.fontWeight = "700";

    const help = document.createElement("p");
    help.textContent = "Move: WASD / Arrow keys   Shoot: Click";
    help.style.margin = "0 0 20px";
    help.style.color = "rgba(245, 247, 255, 0.72)";
    help.style.fontSize = "13px";

    this.startButton = document.createElement("button");
    this.startButton.type = "button";
    this.startButton.textContent = "Start";
    this.startButton.style.width = "160px";
    this.startButton.style.height = "40px";
    this.startButton.style.border = "1px solid rgba(255, 255, 255, 0.35)";
    this.startButton.style.borderRadius = "6px";
    this.startButton.style.background = "#e8f2ff";
    this.startButton.style.color = "#07111f";
    this.startButton.style.fontSize = "15px";
    this.startButton.style.fontWeight = "700";
    this.startButton.style.cursor = "pointer";
    this.startButton.addEventListener("click", this.handleStart);

    panel.append(title, help, this.startButton);
    this.root.append(panel);
    document.body.appendChild(this.root);
  }

  show() {
    this.root.style.display = "flex";
    this.startButton.focus();
  }

  hide() {
    this.root.style.display = "none";
  }

  dispose() {
    this.startButton.removeEventListener("click", this.handleStart);
    this.root.remove();
  }

  private handleStart = () => {
    this.onStart();
  };
}
