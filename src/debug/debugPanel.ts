export class DebugPanel {
  private readonly element: HTMLPreElement;

  constructor(parent: HTMLElement = document.body) {
    this.element = document.createElement("pre");
    this.element.style.position = "fixed";
    this.element.style.left = "8px";
    this.element.style.top = "8px";
    this.element.style.zIndex = "10";
    this.element.style.margin = "0";
    this.element.style.padding = "8px 10px";
    this.element.style.maxWidth = "420px";
    this.element.style.maxHeight = "60vh";
    this.element.style.overflow = "auto";
    this.element.style.pointerEvents = "none";
    this.element.style.background = "rgba(0, 0, 0, 0.65)";
    this.element.style.color = "#e8f2ff";
    this.element.style.font = "12px/1.45 Consolas, Monaco, monospace";
    this.element.style.whiteSpace = "pre-wrap";
    this.element.style.border = "1px solid rgba(255, 255, 255, 0.18)";
    this.element.style.borderRadius = "6px";
    parent.appendChild(this.element);
  }

  setText(text: string) {
    this.element.textContent = text;
  }

  dispose() {
    this.element.remove();
  }
}
