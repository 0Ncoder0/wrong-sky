import type { InputFrame, Scene, SceneHost } from "../../scene.ts";
import { VIEW_H, VIEW_W } from "../../view.ts";
import {
  createIsland,
  forEachTile,
  GRID_COLOR,
  isLand,
  LAND_COLOR,
  SEA_COLOR,
  traceDiamond,
  type Terrain,
} from "./map.ts";
import { Player } from "./player.ts";

/** 游戏场景。本目录放置局内脚本和资源。 */
export class GameScene implements Scene {
  public readonly id = "game" as const;
  private readonly tiles: Terrain[][] = createIsland();
  private readonly player = new Player();

  public enter(host: SceneHost): void {
    void host;
  }

  public exit(): void {}

  public update(dt: number, input: InputFrame): void {
    this.player.update(dt, input.keyboard, this.tiles);
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = SEA_COLOR;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);

    forEachTile((tx, ty) => {
      traceDiamond(ctx, tx, ty);
      ctx.fillStyle = isLand(this.tiles, tx, ty) ? LAND_COLOR : SEA_COLOR;
      ctx.fill();
    });

    ctx.strokeStyle = GRID_COLOR;
    ctx.lineWidth = 1;
    ctx.lineJoin = "miter";
    forEachTile((tx, ty) => {
      traceDiamond(ctx, tx, ty);
      ctx.stroke();
    });

    this.player.render(ctx);
  }
}
