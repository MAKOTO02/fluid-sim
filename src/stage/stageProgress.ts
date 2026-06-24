import { Health } from "../scene/health";
import type { GameStage } from "./demoStage";

export type StageStatus = "playing" | "cleared" | "failed";

export function getStageStatus(stage: GameStage): StageStatus {
  const playerHealth = stage.player.getComponent(Health);
  if (!stage.player.active || stage.player.destroyed || playerHealth?.isDead()) {
    return "failed";
  }

  const allEnemiesDefeated = stage.enemies.every((enemy) => {
    const health = enemy.getComponent(Health);
    return !enemy.active || enemy.destroyed || health?.isDead();
  });

  return allEnemiesDefeated ? "cleared" : "playing";
}
