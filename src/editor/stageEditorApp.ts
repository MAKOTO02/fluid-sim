import type { StageDefinition } from "../stage/stageDefinition";
import type { ProjectileDefinition } from "../scene/projectileDefinition";
import { createStagePreview } from "./stagePreview";
import { createStreamPreviewList } from "./streamPreview";

export function createStageEditorApp(
  stages: readonly StageDefinition[],
  projectiles: readonly ProjectileDefinition[]
): void {
  const app = document.querySelector<HTMLElement>("#app");
  if (!app) throw new Error("#app not found");

  let selectedStage = stages[0];
  app.innerHTML = "";
  app.style.display = "block";
  app.style.height = "auto";
  document.body.style.overflow = "auto";
  document.body.style.background = "#090c10";

  const root = document.createElement("div");
  root.style.minHeight = "100vh";
  root.style.padding = "18px";
  root.style.boxSizing = "border-box";
  root.style.color = "#eef4ff";
  root.style.fontFamily = "system-ui, sans-serif";

  const title = document.createElement("h1");
  title.textContent = "Stage Editor";
  title.style.margin = "0 0 14px";
  title.style.fontSize = "24px";

  const layout = document.createElement("div");
  layout.style.display = "grid";
  layout.style.gridTemplateColumns = "220px minmax(320px, 1fr) minmax(320px, 0.8fr) minmax(360px, 0.9fr)";
  layout.style.gap = "14px";
  layout.style.alignItems = "start";

  const stageList = document.createElement("div");
  const detail = document.createElement("div");
  const projectilePanel = document.createElement("div");
  const jsonPanel = document.createElement("pre");

  stylePanel(stageList);
  stylePanel(detail);
  stylePanel(projectilePanel);
  stylePanel(jsonPanel);
  jsonPanel.style.margin = "0";
  jsonPanel.style.overflow = "auto";
  jsonPanel.style.maxHeight = "calc(100vh - 88px)";
  jsonPanel.style.font = "12px/1.45 Consolas, Monaco, monospace";
  jsonPanel.style.whiteSpace = "pre-wrap";

  root.append(title, layout);
  layout.append(stageList, detail, projectilePanel, jsonPanel);
  app.appendChild(root);

  function render(): void {
    renderStageList(stageList, stages, selectedStage, (stage) => {
      selectedStage = stage;
      render();
    });
    renderStageDetail(detail, selectedStage);
    renderProjectileList(projectilePanel, projectiles);
    jsonPanel.textContent = JSON.stringify(selectedStage, null, 2);
  }

  render();
}

function renderProjectileList(root: HTMLElement, projectiles: readonly ProjectileDefinition[]): void {
  root.innerHTML = "";
  root.appendChild(createSectionTitle("Projectiles"));

  for (const projectile of projectiles) {
    const block = document.createElement("div");
    block.style.padding = "9px 0";
    block.style.borderTop = "1px solid rgba(255,255,255,0.1)";
    block.style.font = "13px/1.5 Consolas, Monaco, monospace";

    const title = document.createElement("div");
    title.textContent = `${projectile.id} / ${projectile.visual}`;
    title.style.color = "#eef4ff";
    title.style.fontWeight = "700";

    const detail = document.createElement("div");
    detail.textContent = [
      `mat=${projectile.materialKey}`,
      `radius=${projectile.radius}`,
      `speed=${projectile.speed}`,
      `life=${projectile.lifeSec}`,
      `damage=${projectile.damage}`,
      projectile.fluid ? "fluid=yes" : "fluid=no",
      projectile.fluid ? `drag=${projectile.fluid.dragStrength ?? 0.015}` : "",
      projectile.fluid?.logicSplat ? "logic=yes" : "logic=no",
    ].filter(Boolean).join(" ");
    detail.style.color = "rgba(238,244,255,0.7)";

    block.append(title, detail);
    root.appendChild(block);
  }
}

function renderStageList(
  root: HTMLElement,
  stages: readonly StageDefinition[],
  selected: StageDefinition,
  onSelect: (stage: StageDefinition) => void
): void {
  root.innerHTML = "";
  root.appendChild(createSectionTitle("Stages"));

  for (const stage of stages) {
    const row = document.createElement("div");
    row.style.display = "grid";
    row.style.gridTemplateColumns = "1fr auto";
    row.style.gap = "6px";
    row.style.margin = "0 0 8px";

    const button = document.createElement("button");
    button.textContent = stage.name;
    button.style.width = "100%";
    button.style.padding = "9px 10px";
    button.style.border = "1px solid rgba(255,255,255,0.2)";
    button.style.borderRadius = "6px";
    button.style.background = stage === selected ? "#e8f2ff" : "rgba(255,255,255,0.07)";
    button.style.color = stage === selected ? "#07111f" : "#eef4ff";
    button.style.textAlign = "left";
    button.style.cursor = "pointer";
    button.onclick = () => onSelect(stage);

    const editLink = document.createElement("a");
    editLink.textContent = "Edit";
    editLink.href = `?mode=stage-editor&stage=${encodeURIComponent(stage.id)}`;
    editLink.style.display = "inline-flex";
    editLink.style.alignItems = "center";
    editLink.style.padding = "0 9px";
    editLink.style.border = "1px solid rgba(255,255,255,0.2)";
    editLink.style.borderRadius = "6px";
    editLink.style.color = "#eef4ff";
    editLink.style.textDecoration = "none";
    editLink.style.background = "rgba(255,255,255,0.07)";

    row.append(button, editLink);
    root.appendChild(row);
  }
}

function renderStageDetail(root: HTMLElement, stage: StageDefinition): void {
  root.innerHTML = "";

  const heading = document.createElement("h2");
  heading.textContent = `${stage.name} (${stage.id})`;
  heading.style.margin = "0 0 12px";
  heading.style.fontSize = "18px";
  root.appendChild(heading);

  root.appendChild(createMetaGrid([
    ["Player Start", formatVec(stage.playerStart)],
    ["Shelters", String(stage.shelters.length)],
    ["Enemies", String(stage.enemies.length)],
    ["Streams", String(stage.streams.length)],
    ["Hazards", String(stage.hazardEmitters.length)],
    ["Events", String(stage.events.length)],
  ]));
  root.appendChild(createStagePreview(stage));
  root.appendChild(createStreamPreviewList(stage));

  root.appendChild(createListSection("Shelters", stage.shelters.map((s) =>
    `${s.id} / ${s.type} pos=${formatVec(s.position)}`
  )));
  root.appendChild(createListSection("Enemies", stage.enemies.map((e) =>
    `${e.id} / ${e.typeId} pos=${formatVec(e.centerPosition)}`
  )));
  root.appendChild(createListSection("Streams", stage.streams.map((s) =>
    `${s.id} / ${s.sourceId}`
  )));
  root.appendChild(createListSection("Hazard Emitters", stage.hazardEmitters.map((h) =>
    `${h.id} / ${h.typeId} pos=${formatVec(h.position)}`
  )));
  root.appendChild(createListSection("Events", stage.events.map((event) =>
    `${formatTrigger(event.trigger)} -> ${formatAction(event.action)}`
  )));
}

function createMetaGrid(rows: Array<[string, string]>): HTMLElement {
  const grid = document.createElement("div");
  grid.style.display = "grid";
  grid.style.gridTemplateColumns = "120px 1fr";
  grid.style.gap = "6px 10px";
  grid.style.marginBottom = "16px";
  grid.style.fontSize = "13px";

  for (const [label, value] of rows) {
    const key = document.createElement("div");
    key.textContent = label;
    key.style.color = "rgba(238,244,255,0.68)";
    const val = document.createElement("div");
    val.textContent = value;
    grid.append(key, val);
  }

  return grid;
}

function createListSection(title: string, rows: string[]): HTMLElement {
  const section = document.createElement("section");
  section.style.marginTop = "14px";
  section.appendChild(createSectionTitle(title));

  if (rows.length === 0) {
    const empty = document.createElement("div");
    empty.textContent = "None";
    empty.style.color = "rgba(238,244,255,0.5)";
    empty.style.fontSize = "13px";
    section.appendChild(empty);
    return section;
  }

  const list = document.createElement("ul");
  list.style.margin = "0";
  list.style.paddingLeft = "18px";
  list.style.font = "13px/1.55 Consolas, Monaco, monospace";

  for (const row of rows) {
    const item = document.createElement("li");
    item.textContent = row;
    list.appendChild(item);
  }

  section.appendChild(list);
  return section;
}

function createSectionTitle(text: string): HTMLElement {
  const title = document.createElement("h3");
  title.textContent = text;
  title.style.margin = "0 0 8px";
  title.style.fontSize = "14px";
  title.style.color = "#cfe3ff";
  return title;
}

function stylePanel(el: HTMLElement): void {
  el.style.padding = "14px";
  el.style.border = "1px solid rgba(255,255,255,0.14)";
  el.style.borderRadius = "8px";
  el.style.background = "rgba(255,255,255,0.055)";
}

function formatVec(vec: readonly number[]): string {
  return `[${vec.map((v) => v.toFixed(2)).join(", ")}]`;
}

function formatTrigger(trigger: StageDefinition["events"][number]["trigger"]): string {
  switch (trigger.type) {
    case "time":
      return `time at ${trigger.at}s`;
    case "enemy:defeated":
      return `enemy defeated ${trigger.targetId}`;
  }
}

function formatAction(action: StageDefinition["events"][number]["action"]): string {
  switch (action.type) {
    case "hazard:setEnabled":
      return `hazard ${action.targetId} enabled=${action.enabled}`;
    case "stream:setForceEnabled":
      return `stream force enabled=${action.enabled}`;
  }
}
