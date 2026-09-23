import { ORIGIN_X, ORIGIN_Y, TILE_H, TILE_W } from "./tile-map.ts";

const LEFT_WALL = "#5e6a72";
const RIGHT_WALL = "#8d9aa1";
const ROOF = "#d5ddd8";
const DOOR = "#3a3530";
const OUTLINE = "#1a1814";

export const BUILDING_COLORS = {
  leftWall: LEFT_WALL,
  rightWall: RIGHT_WALL,
  roof: ROOF,
  door: DOOR,
  outline: OUTLINE
};

export type BuildingColors = typeof BUILDING_COLORS;

const DEMOLISH = "#c43c3c";
const DEMOLISH_COLORS: BuildingColors = {
  leftWall: DEMOLISH,
  rightWall: DEMOLISH,
  roof: DEMOLISH,
  door: DEMOLISH,
  outline: BUILDING_COLORS.outline
};

type Point = { x: number; y: number };

/** 占一块矩形地的盒子。墙高决定它能挡住人的多少，门在朝左的那面墙上。 */
export class Building {
  public readonly tx: number;
  public readonly ty: number;
  private readonly tilesW: number;
  private readonly tilesH: number;
  private readonly wallH: number;
  /** 删除工具悬停在占地里时为 true，整栋用红色画。 */
  public removing = false;

  public constructor(tx: number, ty: number, tilesW: number, tilesH: number, wallH: number) {
    this.tx = tx;
    this.ty = ty;
    this.tilesW = tilesW;
    this.tilesH = tilesH;
    this.wallH = wallH;
  }

  /** 靠画面前的那一角。整栋房子按这个深度一次画完。 */
  public depth(): number {
    return this.tx + this.tilesW - 1 + (this.ty + this.tilesH - 1);
  }

  public occupies(tx: number, ty: number): boolean {
    return tx >= this.tx && tx < this.tx + this.tilesW && ty >= this.ty && ty < this.ty + this.tilesH;
  }

  public render(ctx: CanvasRenderingContext2D): void {
    const colors = this.removing ? DEMOLISH_COLORS : BUILDING_COLORS;
    BuildingRenderer.render(ctx, this.tx, this.ty, this.tilesW, this.tilesH, this.wallH, colors);
  }
}

/** 按后角格子、占地和墙高画一栋房子。左右墙、顶、门、轮廓的颜色由调用方给。 */
export class BuildingRenderer {
  public static render(ctx: CanvasRenderingContext2D, tx: number, ty: number, tilesW: number, tilesH: number, wallH: number, colors: BuildingColors): void {
    const ground = this.footprint(tx, ty, tilesW, tilesH);
    const raised = ground.map(point => ({ x: point.x, y: point.y - wallH }));
    const south = this.bottom(tx + tilesW - 1, ty + tilesH - 1);
    let doorEdge: [Point, Point] = null;
    let passedSouth = false;

    for (let i = 0; i < ground.length; i++) {
      const a = ground[i];
      const b = ground[(i + 1) % ground.length];
      if (this.same(a, south)) passedSouth = true;
      if (a.x <= b.x) continue;
      this.polygon(ctx, [a, b, { x: b.x, y: b.y - wallH }, { x: a.x, y: a.y - wallH }], passedSouth ? colors.leftWall : colors.rightWall, colors.outline);
      if (passedSouth && doorEdge == null) doorEdge = [a, b];
    }

    this.polygon(ctx, raised, colors.roof, colors.outline);
    if (doorEdge) this.door(ctx, doorEdge[0], doorEdge[1], tilesW, wallH, colors.door, colors.outline);
  }

  private static footprint(tx: number, ty: number, tilesW: number, tilesH: number): Point[] {
    const tx1 = tx + tilesW - 1;
    const ty1 = ty + tilesH - 1;
    const points = [this.top(tx, ty), this.right(tx1, ty), this.right(tx1, ty1), this.bottom(tx1, ty1), this.left(tx, ty1), this.left(tx, ty)];
    const unique: Point[] = [];
    for (const point of points) {
      const prev = unique[unique.length - 1];
      if (prev && this.same(prev, point)) continue;
      unique.push(point);
    }
    if (unique.length > 1 && this.same(unique[0], unique[unique.length - 1])) unique.pop();
    return this.dropCollinear(unique);
  }

  private static top(tx: number, ty: number): Point {
    return {
      x: ORIGIN_X + (tx - ty) * (TILE_W / 2),
      y: ORIGIN_Y + (tx + ty) * (TILE_H / 2)
    };
  }

  private static right(tx: number, ty: number): Point {
    const point = this.top(tx, ty);
    return { x: point.x + TILE_W / 2, y: point.y + TILE_H / 2 };
  }

  private static bottom(tx: number, ty: number): Point {
    const point = this.top(tx, ty);
    return { x: point.x, y: point.y + TILE_H };
  }

  private static left(tx: number, ty: number): Point {
    const point = this.top(tx, ty);
    return { x: point.x - TILE_W / 2, y: point.y + TILE_H / 2 };
  }

  private static door(ctx: CanvasRenderingContext2D, a: Point, b: Point, tilesW: number, wallH: number, color: string, outline: string): void {
    const doorH = Math.min(14, wallH * 0.45);
    const width = 0.36 / tilesW;
    const u0 = 0.5 - width / 2;
    const u1 = 0.5 + width / 2;
    const at = (u: number, v: number) => ({
      x: a.x + (b.x - a.x) * u,
      y: a.y + (b.y - a.y) * u - v
    });
    this.polygon(ctx, [at(u0, 2), at(u1, 2), at(u1, 2 + doorH), at(u0, 2 + doorH)], color, outline);
  }

  private static polygon(ctx: CanvasRenderingContext2D, points: Point[], color: string, outline: string): void {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = outline;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  private static same(a: Point, b: Point): boolean {
    return a.x === b.x && a.y === b.y;
  }

  private static dropCollinear(points: Point[]): Point[] {
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
}
