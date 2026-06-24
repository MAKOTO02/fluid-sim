import type { GameState } from "../app/gameController";
import type { HealthSnapshot } from "../scene/health";
import { PauseMenu } from "./pauseMenu";
import { PlayerHealthBar } from "./playerHealthBar";
import { StartMenu } from "./startMenu";

export type GameUiOptions = {
  onStart: () => void;
  onResume: () => void;
};

export class GameUi {
  private readonly pauseMenu: PauseMenu;
  private readonly playerHealthBar: PlayerHealthBar;
  private readonly startMenu: StartMenu;

  constructor(options: GameUiOptions) {
    this.startMenu = new StartMenu({
      onStart: options.onStart,
    });
    this.pauseMenu = new PauseMenu({
      onResume: options.onResume,
    });
    this.playerHealthBar = new PlayerHealthBar();
  }

  setPlayerHealth(health?: HealthSnapshot): void {
    this.playerHealthBar.setHealth(health);
  }

  setGameState(state: GameState) {
    if (state === "title") {
      this.startMenu.show();
    } else {
      this.startMenu.hide();
    }

    if (state === "paused") {
      this.pauseMenu.show();
    } else {
      this.pauseMenu.hide();
    }
  }

  dispose() {
    this.startMenu.dispose();
    this.pauseMenu.dispose();
    this.playerHealthBar.dispose();
  }
}
