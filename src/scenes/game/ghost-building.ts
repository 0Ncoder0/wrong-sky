import { Building } from "./building.ts";
import type { Player } from "./player.ts";
import { ORIGIN_X, ORIGIN_Y, TILE_H, TILE_W, type TileMap } from "./tile-map.ts";

const LEFT_WALL = "#5e6a72";
const RIGHT_WALL = "#8d9aa1";
const ROOF = "#d5ddd8";
const DOOR = "#3a3530";
const OUTLINE = "#1a1814";
const BAD = "#c43c3c";
const ALPHA = 0.65;

const TILES_W = 2;
const TILES_H = 2;
const WALL_H = TILE_H * 2;

type Point = { x: number; y: number };

/** 跟着指针的预览房子。不占路，脚印不合法时整栋用同一种红。 */
export class GhostBuilding {
  private tx = 0;
  private ty = 0;
  private shown = false;
  private ok = false;

  public follow(tile: { tx: number; ty: number } | null, map: TileMap, buildings: Building[], player: Player): void {
    if (tile == null) {
      this.shown = false;
      return;
    }
    this.tx = tile.tx;
    this.ty = tile.ty;
    this.shown = true;
    this.ok = this.canPlace(map, buildings, player);
  }

  public isShown(): boolean {
    return this.shown;
  }

  /** 合法时放下同尺寸的实体房子。红色或不在地图上时什么也不做。 */
  public commit(): Building | null {
    if (!this.shown || !this.ok) return null;
    this.ok = false;
    return new Building(this.tx, this.ty, TILES_W, TILES_H, WALL_H);
  }

  /** 靠画面前的那一角。和实体建筑用同一个深度。 */
  public depth(): number {
    return this.tx + TILES_W - 1 + (this.ty + TILES_H - 1);
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (!this.shown) return;
    ctx.save();
    ctx.globalAlpha = ALPHA;
    this.draw(ctx);
    ctx.restore();
  }

  private canPlace(map: TileMap, buildings: Building[], player: Player): boolean {
    for (let ty = this.ty; ty < this.ty + TILES_H; ty++) {
      for (let tx = this.tx; tx < this.tx + TILES_W; tx++) {
        if (!map.isLand(tx, ty)) return false;
        if (buildings.some(building => building.occupies(tx, ty))) return false;
        if (player.occupies(tx, ty)) return false;
      }
    }
    return true;
  }

  private draw(ctx: CanvasRenderingContext2D): void {
    const ground = footprint(this.tx, this.ty);
    const raised = ground.map(point => ({ x: point.x, y: point.y - WALL_H }));
    const south = bottom(this.tx + TILES_W - 1, this.ty + TILES_H - 1);
    let doorEdge: [Point, Point] = null;
    let passedSouth = false;

    for (let i = 0; i < ground.length; i++) {
      const a = ground[i];
      const b = ground[(i + 1) % ground.length];
      if (same(a, south)) passedSouth = true;
      if (a.x <= b.x) continue;
      const wall = this.ok ? (passedSouth ? LEFT_WALL : RIGHT_WALL) : BAD;
      polygon(ctx, [a, b, { x: b.x, y: b.y - WALL_H }, { x: a.x, y: a.y - WALL_H }], wall);
      if (passedSouth && doorEdge == null) doorEdge = [a, b];
    }

    polygon(ctx, raised, this.ok ? ROOF : BAD);
    if (doorEdge) door(ctx, doorEdge[0], doorEdge[1], this.ok ? DOOR : BAD);
  }
}

function footprint(tx: number, ty: number): Point[] {
  const tx1 = tx + TILES_W - 1;
  const ty1 = ty + TILES_H - 1;
  const points = [top(tx, ty), right(tx1, ty), right(tx1, ty1), bottom(tx1, ty1), left(tx, ty1), left(tx, ty)];
  const unique: Point[] = [];
  for (const point of points) {
    const prev = unique[unique.length - 1];
    if (prev && same(prev, point)) continue;
    unique.push(point);
  }
  if (unique.length > 1 && same(unique[0], unique[unique.length - 1])) unique.pop();
  return dropCollinear(unique);
}

function top(tx: number, ty: number): Point {
  return {
    x: ORIGIN_X + (tx - ty) * (TILE_W / 2),
    y: ORIGIN_Y + (tx + ty) * (TILE_H / 2)
  };
}

function right(tx: number, ty: number): Point {
  const point = top(tx, ty);
  return { x: point.x + TILE_W / 2, y: point.y + TILE_H / 2 };
}

function bottom(tx: number, ty: number): Point {
  const point = top(tx, ty);
  return { x: point.x, y: point.y + TILE_H };
}

function left(tx: number, ty: number): Point {
  const point = top(tx, ty);
  return { x: point.x - TILE_W / 2, y: point.y + TILE_H / 2 };
}

function door(ctx: CanvasRenderingContext2D, a: Point, b: Point, color: string): void {
  const doorH = Math.min(14, WALL_H * 0.45);
  const width = 0.36 / TILES_W;
  const u0 = 0.5 - width / 2;
  const u1 = 0.5 + width / 2;
  const at = (u: number, v: number) => ({
    x: a.x + (b.x - a.x) * u,
    y: a.y + (b.y - a.y) * u - v
  });
  polygon(ctx, [at(u0, 2), at(u1, 2), at(u1, 2 + doorH), at(u0, 2 + doorH)], color);
}

function polygon(ctx: CanvasRenderingContext2D, points: Point[], color: string): void {
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 1;
  ctx.stroke();
}

function same(a: Point, b: Point): boolean {
  return a.x === b.x && a.y === b.y;
}

function dropCollinear(points: Point[]): Point[] {
  if (points.length < 3) return points;
  const kept: Point[] = [];
  for (let i = 0; i < points.length; i++) {
    const prev = points[(i + points.length - 1) % points.length];
    const curr = points[i];
    const next = points[(i + 1) % points.length];
    const cross = (curr.x - prev.x) * (next.y - curr.y) - (curr.y - prev.y) * (next.x - curr.x);
    if (cross !== 0) kept.push(curr);
  }
  return kept;
}
