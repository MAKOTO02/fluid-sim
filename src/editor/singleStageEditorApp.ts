import type { StageDefinition } from "../stage/stageDefinition";
import { createStagePreview } from "./stagePreview";
import { createStreamPreviewList } from "./streamPreview";

export function createSingleStageEditorApp(
  stages: readonly StageDefinition[],
  stageId: string | null
): void {
  const app = document.querySelector<HTMLElement>("#app");
  if (!app) throw new Error("#app not found");

  const selectedStage = findStage(stages, stageId);

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

  const header = document.createElement("header");
  header.style.display = "flex";
  header.style.alignItems = "center";
  header.style.justifyContent = "space-between";
  header.style.gap = "16px";
  header.style.marginBottom = "14px";

  const titleGroup = document.createElement("div");
  const title = document.createElement("h1");
  title.textContent = `Stage Editor: ${selectedStage.name}`;
  title.style.margin = "0 0 4px";
  title.style.fontSize = "24px";

  const subtitle = document.createElement("div");
  subtitle.textContent = `stage=${selectedStage.id}`;
  subtitle.style.color = "rgba(238,244,255,0.62)";
  subtitle.style.font = "13px/1.4 Consolas, Monaco, monospace";
  titleGroup.append(title, subtitle);

  const nav = document.createElement("nav");
  nav.style.display = "flex";
  nav.style.gap = "8px";
  nav.append(
    createLinkButton("?mode=editor", "Stage List"),
    createLinkButton("?", "Game")
  );

  header.append(titleGroup, nav);

  const layout = document.createElement("div");
  layout.style.display = "grid";
  layout.style.gridTemplateColumns = "minmax(520px, 1.25fr) minmax(360px, 0.75fr)";
  layout.style.gap = "14px";
  layout.style.alignItems = "start";

  const previewPanel = document.createElement("div");
  const sidePanel = document.createElement("div");
  stylePanel(previewPanel);
  stylePanel(sidePanel);

  const preview = createStagePreview(selectedStage, { showStreamOverlay: true });
  previewPanel.append(preview, createStreamPreviewList(selectedStage));

  const note = document.createElement("p");
  note.textContent = "This page is prepared for editing controls. For now it shows the selected stage layout and raw definition.";
  note.style.margin = "10px 0 0";
  note.style.color = "rgba(238,244,255,0.68)";
  note.style.fontSize = "13px";
  previewPanel.appendChild(note);

  sidePanel.appendChild(createSectionTitle("Stage Definition"));
  sidePanel.appendChild(createStageSelector(stages, selectedStage));
  sidePanel.appendChild(createStageObjectSummary(selectedStage));
  sidePanel.appendChild(createJsonBlock(selectedStage));

  layout.append(previewPanel, sidePanel);
  root.append(header, layout);
  app.appendChild(root);
}

function findStage(stages: readonly StageDefinition[], stageId: string | null): StageDefinition {
  return stages.find((stage) => stage.id === stageId) ?? stages[0];
}

function createStageSelector(
  stages: readonly StageDefinition[],
  selectedStage: StageDefinition
): HTMLElement {
  const wrapper = document.createElement("div");
  wrapper.style.margin = "0 0 12px";

  const label = document.createElement("label");
  label.textContent = "Select stage";
  label.style.display = "block";
  label.style.marginBottom = "6px";
  label.style.fontSize = "13px";
  label.style.color = "rgba(238,244,255,0.7)";

  const select = document.createElement("select");
  select.style.width = "100%";
  select.style.boxSizing = "border-box";
  select.style.padding = "8px 10px";
  select.style.borderRadius = "6px";
  select.style.border = "1px solid rgba(255,255,255,0.18)";
  select.style.background = "#111824";
  select.style.color = "#eef4ff";

  for (const stage of stages) {
    const option = document.createElement("option");
    option.value = stage.id;
    option.textContent = `${stage.name} (${stage.id})`;
    select.appendChild(option);
  }
  select.value = selectedStage.id;

  select.addEventListener("change", () => {
    window.location.href = `?mode=stage-editor&stage=${encodeURIComponent(select.value)}`;
  });

  wrapper.append(label, select);
  return wrapper;
}

function createStageObjectSummary(stage: StageDefinition): HTMLElement {
  const section = document.createElement("section");
  section.style.margin = "0 0 14px";
  section.appendChild(createSectionTitle("Stage Objects"));

  const rows: Array<[string, string]> = [
    ["Player", `pos=${formatVec(stage.playerStart)}`],
    ["Shelters", stage.shelters.length === 0 ? "None" : stage.shelters.map((shelter) =>
      `${shelter.id} / ${shelter.type} pos=${formatVec(shelter.position)}`
    ).join("\n")],
    ["Enemies", stage.enemies.length === 0 ? "None" : stage.enemies.map((enemy) =>
      `${enemy.id} / ${enemy.typeId} pos=${formatVec(enemy.centerPosition)}`
    ).join("\n")],
    ["Streams", stage.streams.length === 0 ? "None" : stage.streams.map((stream) =>
      `${stream.id} / ${stream.sourceId}`
    ).join("\n")],
    ["Hazards", stage.hazardEmitters.length === 0 ? "None" : stage.hazardEmitters.map((hazard) =>
      `${hazard.id} / ${hazard.typeId} pos=${formatVec(hazard.position)}`
    ).join("\n")],
    ["Events", stage.events.length === 0 ? "None" : stage.events.map((event) =>
      `${formatTrigger(event.trigger)} -> ${formatAction(event.action)}`
    ).join("\n")],
  ];

  const grid = document.createElement("div");
  grid.style.display = "grid";
  grid.style.gridTemplateColumns = "86px 1fr";
  grid.style.gap = "7px 10px";
  grid.style.padding = "10px";
  grid.style.borderRadius = "6px";
  grid.style.background = "rgba(0,0,0,0.22)";
  grid.style.font = "12px/1.45 Consolas, Monaco, monospace";

  for (const [label, value] of rows) {
    const key = document.createElement("div");
    key.textContent = label;
    key.style.color = "rgba(238,244,255,0.58)";

    const val = document.createElement("div");
    val.textContent = value;
    val.style.whiteSpace = "pre-wrap";

    grid.append(key, val);
  }

  section.appendChild(grid);
  return section;
}

function createJsonBlock(stage: StageDefinition): HTMLElement {
  const json = document.createElement("pre");
  json.textContent = JSON.stringify(stage, null, 2);
  json.style.margin = "0";
  json.style.padding = "12px";
  json.style.maxHeight = "calc(100vh - 190px)";
  json.style.overflow = "auto";
  json.style.borderRadius = "6px";
  json.style.background = "rgba(0,0,0,0.28)";
  json.style.font = "12px/1.45 Consolas, Monaco, monospace";
  json.style.whiteSpace = "pre-wrap";
  return json;
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

function createLinkButton(href: string, text: string): HTMLAnchorElement {
  const link = document.createElement("a");
  link.href = href;
  link.textContent = text;
  link.style.display = "inline-block";
  link.style.padding = "8px 10px";
  link.style.border = "1px solid rgba(255,255,255,0.22)";
  link.style.borderRadius = "6px";
  link.style.color = "#eef4ff";
  link.style.textDecoration = "none";
  link.style.background = "rgba(255,255,255,0.07)";
  return link;
}

function createSectionTitle(text: string): HTMLElement {
  const title = document.createElement("h2");
  title.textContent = text;
  title.style.margin = "0 0 10px";
  title.style.fontSize = "16px";
  title.style.color = "#cfe3ff";
  return title;
}

function stylePanel(el: HTMLElement): void {
  el.style.padding = "14px";
  el.style.border = "1px solid rgba(255,255,255,0.14)";
  el.style.borderRadius = "8px";
  el.style.background = "rgba(255,255,255,0.055)";
}
