import { VIEW_H, VIEW_W } from "../../view.ts";
import { Iso } from "./iso.ts";

/** 32×32。投影按这个边长把整张岛放进画面。 */
export const MAP_SIZE = 32;
/** 外圈这么多格是海。1 格在这个砖高下几乎看不出边界。 */
export const SEA_DEPTH = 2;

Iso.placeOrigin(MAP_SIZE);

const SEA_COLOR = "#4e8d98";
const LAND_COLOR = "#b7a47a";
const GRID_COLOR = "#8e8a80";

type Terrain = "land" | "sea";

/** 一张固定的岛。格子留在内部，能不能走和画出来都问它。 */
export class TileMap {
  private readonly tiles: Terrain[][];

  constructor() {
    this.tiles = createIsland();
  }

  public isLand(tx: number, ty: number): boolean {
    if (tx < 0 || ty < 0 || tx >= MAP_SIZE || ty >= MAP_SIZE) return false;
    return this.tiles[ty][tx] === "land";
  }

  /** 屏幕点落在哪一格。地图外返回 null。 */
  public tileAt(x: number, y: number): { tx: number; ty: number } | null {
    const tile = Iso.tileOf(x, y);
    if (tile.tx < 0 || tile.ty < 0 || tile.tx >= MAP_SIZE || tile.ty >= MAP_SIZE) return null;
    return tile;
  }

  public render(ctx: CanvasRenderingContext2D): void {
    TileMapRenderer.render(ctx, this.tiles);
  }
}

function createIsland(): Terrain[][] {
  const rows: Terrain[][] = [];
  for (let ty = 0; ty < MAP_SIZE; ty++) {
    const row: Terrain[] = [];
    for (let tx = 0; tx < MAP_SIZE; tx++) {
      const sea = tx < SEA_DEPTH || ty < SEA_DEPTH || tx >= MAP_SIZE - SEA_DEPTH || ty >= MAP_SIZE - SEA_DEPTH;
      row.push(sea ? "sea" : "land");
    }
    rows.push(row);
  }
  return rows;
}

/** 先铺海，再填菱形，最后描网格。填色会盖住半条线，所以网格单独再描一遍。 */
class TileMapRenderer {
  public static render(ctx: CanvasRenderingContext2D, tiles: Terrain[][]): void {
    ctx.fillStyle = SEA_COLOR;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    this.fill(ctx, tiles);
    this.grid(ctx);
  }

  private static fill(ctx: CanvasRenderingContext2D, tiles: Terrain[][]): void {
    this.forEachTile((tx, ty) => {
      Iso.traceDiamond(ctx, tx, ty);
      ctx.fillStyle = tiles[ty][tx] === "land" ? LAND_COLOR : SEA_COLOR;
      ctx.fill();
    });
  }

  private static grid(ctx: CanvasRenderingContext2D): void {
    ctx.strokeStyle = GRID_COLOR;
    ctx.lineWidth = 1;
    ctx.lineJoin = "miter";
    this.forEachTile((tx, ty) => {
      Iso.traceDiamond(ctx, tx, ty);
      ctx.stroke();
    });
  }

  /** 按 tx+ty 从远到近。平地现在看不出遮挡，以后人和建筑沿用这个顺序。 */
  private static forEachTile(visit: (tx: number, ty: number) => void): void {
    for (let sum = 0; sum < MAP_SIZE * 2 - 1; sum++) {
      const txStart = Math.max(0, sum - (MAP_SIZE - 1));
      const txEnd = Math.min(sum, MAP_SIZE - 1);
      for (let tx = txStart; tx <= txEnd; tx++) visit(tx, sum - tx);
    }
  }
}
