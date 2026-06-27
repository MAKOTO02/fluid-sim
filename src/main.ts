import { startGameApp } from "./app/gameApp";
import { createSingleStageEditorApp } from "./editor/singleStageEditorApp";
import { createStageEditorApp } from "./editor/stageEditorApp";
import { projectileDefinitionList } from "./scene/projectileDefinition";
import { stageDefinitions } from "./stage/stageDefinition";

const params = new URLSearchParams(window.location.search);
const mode = params.get("mode");

if (mode === "editor") {
  createStageEditorApp(stageDefinitions, projectileDefinitionList);
} else if (mode === "stage-editor") {
  createSingleStageEditorApp(stageDefinitions, params.get("stage"));
} else {
  startGameApp();
}
