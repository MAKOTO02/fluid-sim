import type {
  GameObjectSnapshot,
  Vec3Snapshot,
  WorldSnapshot,
} from "../app/worldSnapshot";

export function formatWorldSnapshot(snapshot: WorldSnapshot): string {
  const { stage } = snapshot;

  return [
    "World Snapshot",
    "",
    `Player: ${formatObject(stage.player)}`,
    `Enemies: ${stage.enemies.length}`,
    ...stage.enemies.map((enemy) => `  ${formatObject(enemy)}`),
    `Obstacles: ${stage.obstacles.length}`,
    ...stage.obstacles.map((obstacle) => `  ${formatObject(obstacle)}`),
    `Streams: ${stage.streams.length}`,
    ...stage.streams.map((stream) => `  ${formatObject(stream)}`),
  ].join("\n");
}

function formatObject(obj: GameObjectSnapshot) {
  const velocity = obj.velocity ? ` vel=${formatVec3(obj.velocity)}` : "";
  const health = obj.health ? ` hp=${formatNumber(obj.health.current)}/${formatNumber(obj.health.max)}` : "";
  return `#${obj.id} ${obj.name} pos=${formatVec3(obj.position)} scale=${formatVec3(obj.localScale)}${velocity}${health}`;
}

function formatVec3(v: Vec3Snapshot) {
  return `[${formatNumber(v[0])}, ${formatNumber(v[1])}, ${formatNumber(v[2])}]`;
}

function formatNumber(value: number) {
  return value.toFixed(2);
}
