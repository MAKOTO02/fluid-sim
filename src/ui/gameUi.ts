import type { GameState } from "../app/gameController";
import type { GameObjectSnapshot } from "../app/worldSnapshot";
import type { HealthSnapshot } from "../scene/health";
import type { PlayerInkSnapshot } from "../scene/playerInk";
import type { StageDefinition } from "../stage/stageDefinition";
import { EnemyHealthPanel } from "./enemyHealthPanel";
import { PauseMenu } from "./pauseMenu";
import { PlayerHealthBar } from "./playerHealthBar";
import { ResultMenu } from "./resultMenu";
import { StageSelectMenu } from "./stageSelectMenu";
import { StartMenu } from "./startMenu";

export type GameUiOptions = {
  onStart: () => void;
  stages: readonly StageDefinition[];
  onSelectStage: (stage: StageDefinition) => void;
  onBackToTitle: () => void;
  onResume: () => void;
  onReturnToTitle: () => void;
};

export class GameUi {
  private readonly enemyHealthPanel: EnemyHealthPanel;
  private readonly pauseMenu: PauseMenu;
  private readonly playerHealthBar: PlayerHealthBar;
  private readonly resultMenu: ResultMenu;
  private readonly stageSelectMenu: StageSelectMenu;
  private readonly startMenu: StartMenu;

  constructor(options: GameUiOptions) {
    this.enemyHealthPanel = new EnemyHealthPanel();
    this.startMenu = new StartMenu({
      onStart: options.onStart,
    });
    this.stageSelectMenu = new StageSelectMenu({
      stages: options.stages,
      onSelectStage: options.onSelectStage,
      onBack: options.onBackToTitle,
    });
    this.pauseMenu = new PauseMenu({
      onResume: options.onResume,
    });
    this.resultMenu = new ResultMenu({
      onReturnToTitle: options.onReturnToTitle,
    });
    this.playerHealthBar = new PlayerHealthBar();
  }

  setPlayerHealth(health?: HealthSnapshot): void {
    this.playerHealthBar.setHealth(health);
  }

  setPlayerInk(ink?: PlayerInkSnapshot): void {
    this.playerHealthBar.setInk(ink);
  }

  setEnemyHealth(enemies: GameObjectSnapshot[]): void {
    this.enemyHealthPanel.setEnemies(enemies);
  }

  setGameState(state: GameState) {
    if (state === "title") {
      this.startMenu.show();
    } else {
      this.startMenu.hide();
    }

    if (state === "stageSelect") {
      this.stageSelectMenu.show();
    } else {
      this.stageSelectMenu.hide();
    }

    if (state === "paused") {
      this.pauseMenu.show();
    } else {
      this.pauseMenu.hide();
    }

    this.resultMenu.setGameState(state);
  }

  dispose() {
    this.enemyHealthPanel.dispose();
    this.startMenu.dispose();
    this.stageSelectMenu.dispose();
    this.pauseMenu.dispose();
    this.resultMenu.dispose();
    this.playerHealthBar.dispose();
  }
}
