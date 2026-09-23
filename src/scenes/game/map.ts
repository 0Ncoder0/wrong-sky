import { VIEW_H, VIEW_W } from "../../view.ts";

/** 32×32。砖 32×16 时整图 1024×512，能放进 1080×608。 */
export const MAP_SIZE = 32;
export const TILE_W = 32;
export const TILE_H = 16;
/** 外圈这么多格是海。1 格在这个砖高下几乎看不出边界。 */
export const SEA_DEPTH = 2;

export const SEA_COLOR = "#4e8d98";
export const LAND_COLOR = "#b7a47a";
export const GRID_COLOR = "#8e8a80";

const MAP_PX_H = MAP_SIZE * TILE_H;

/** 上顶点。水平居中，垂直把整张岛放在画面里。 */
export const ORIGIN_X = VIEW_W / 2;
export const ORIGIN_Y = (VIEW_H - MAP_PX_H) / 2;

export type Terrain = "land" | "sea";

export function createIsland(): Terrain[][] {
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

export function isLand(tiles: Terrain[][], tx: number, ty: number): boolean {
  if (tx < 0 || ty < 0 || tx >= MAP_SIZE || ty >= MAP_SIZE) return false;
  return tiles[ty][tx] === "land";
}

/** 按 tx+ty 从远到近。平地现在看不出遮挡，以后人和建筑沿用这个顺序。 */
export function forEachTile(visit: (tx: number, ty: number) => void): void {
  for (let sum = 0; sum < MAP_SIZE * 2 - 1; sum++) {
    const txStart = Math.max(0, sum - (MAP_SIZE - 1));
    const txEnd = Math.min(sum, MAP_SIZE - 1);
    for (let tx = txStart; tx <= txEnd; tx++) visit(tx, sum - tx);
  }
}

export function traceDiamond(ctx: CanvasRenderingContext2D, tx: number, ty: number): void {
  const x = ORIGIN_X + (tx - ty) * (TILE_W / 2);
  const y = ORIGIN_Y + (tx + ty) * (TILE_H / 2);
  const halfW = TILE_W / 2;
  const halfH = TILE_H / 2;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + halfW, y + halfH);
  ctx.lineTo(x, y + TILE_H);
  ctx.lineTo(x - halfW, y + halfH);
  ctx.closePath();
}
