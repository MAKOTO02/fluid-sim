import type { GameState } from "../app/gameController";
import { PauseMenu } from "./pauseMenu";
import { StartMenu } from "./startMenu";

export type GameUiOptions = {
  onStart: () => void;
  onResume: () => void;
};

export class GameUi {
  private readonly pauseMenu: PauseMenu;
  private readonly startMenu: StartMenu;

  constructor(options: GameUiOptions) {
    this.startMenu = new StartMenu({
      onStart: options.onStart,
    });
    this.pauseMenu = new PauseMenu({
      onResume: options.onResume,
    });
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
  }
}
