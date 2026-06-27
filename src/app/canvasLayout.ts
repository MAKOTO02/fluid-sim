export const GAME_VIEW_ASPECT_WIDTH = 16;
export const GAME_VIEW_ASPECT_HEIGHT = 9;
export const GAME_VIEW_ASPECT_RATIO =
  GAME_VIEW_ASPECT_WIDTH / GAME_VIEW_ASPECT_HEIGHT;

export type CanvasLayoutSize = {
  displayWidth: number;
  displayHeight: number;
  pixelWidth: number;
  pixelHeight: number;
};

export function applyFixedAspectCanvasLayout(
  canvas: HTMLCanvasElement
): CanvasLayoutSize {
  const host = canvas.parentElement ?? document.documentElement;
  const hostWidth = host.clientWidth || window.innerWidth;
  const hostHeight = host.clientHeight || window.innerHeight;

  let displayWidth = hostWidth;
  let displayHeight = displayWidth / GAME_VIEW_ASPECT_RATIO;

  if (displayHeight > hostHeight) {
    displayHeight = hostHeight;
    displayWidth = displayHeight * GAME_VIEW_ASPECT_RATIO;
  }

  displayWidth = Math.max(1, Math.floor(displayWidth));
  displayHeight = Math.max(1, Math.floor(displayHeight));

  canvas.style.width = `${displayWidth}px`;
  canvas.style.height = `${displayHeight}px`;

  const pixelRatio = window.devicePixelRatio || 1;
  return {
    displayWidth,
    displayHeight,
    pixelWidth: Math.max(1, Math.floor(displayWidth * pixelRatio)),
    pixelHeight: Math.max(1, Math.floor(displayHeight * pixelRatio)),
  };
}
