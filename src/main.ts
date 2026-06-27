import { startGameApp } from "./app/gameApp";
import { createStageEditorApp } from "./editor/stageEditorApp";
import { stageDefinitions } from "./stage/stageDefinition";

const mode = new URLSearchParams(window.location.search).get("mode");

if (mode === "editor") {
  createStageEditorApp(stageDefinitions);
} else {
  startGameApp();
}
