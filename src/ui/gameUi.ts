import type { GameState } from "../app/gameController";
import { StartMenu } from "./startMenu";

export type GameUiOptions = {
  onStart: () => void;
};

export class GameUi {
  private readonly startMenu: StartMenu;

  constructor(options: GameUiOptions) {
    this.startMenu = new StartMenu({
      onStart: options.onStart,
    });
  }

  setGameState(state: GameState) {
    if (state === "title") {
      this.startMenu.show();
    } else {
      this.startMenu.hide();
    }
  }

  dispose() {
    this.startMenu.dispose();
  }
}
