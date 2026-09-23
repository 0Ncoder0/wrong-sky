import { ORIGIN_X, ORIGIN_Y, TILE_H, TILE_W } from "./map.ts";

const LEFT_WALL = "#5e6a72";
const RIGHT_WALL = "#8d9aa1";
const ROOF = "#d5ddd8";
const DOOR = "#3a3530";
const OUTLINE = "#1a1814";

type Point = { x: number; y: number };

/** 占一块矩形地的盒子。墙高决定它能挡住人的多少，门在朝左的那面墙上。 */
export class Building {
  public readonly tx: number;
  public readonly ty: number;
  private readonly tilesW: number;
  private readonly tilesH: number;
  private readonly wallH: number;

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
    const ground = this.footprint();
    const raised = ground.map((point) => ({ x: point.x, y: point.y - this.wallH }));
    const south = this.bottom(this.tx + this.tilesW - 1, this.ty + this.tilesH - 1);
    let doorEdge: [Point, Point] = null;
    let passedSouth = false;

    for (let i = 0; i < ground.length; i++) {
      const a = ground[i];
      const b = ground[(i + 1) % ground.length];
      if (same(a, south)) passedSouth = true;
      if (a.x <= b.x) continue;
      this.face(ctx, a, b, { x: b.x, y: b.y - this.wallH }, { x: a.x, y: a.y - this.wallH }, passedSouth ? LEFT_WALL : RIGHT_WALL);
      if (passedSouth && doorEdge == null) doorEdge = [a, b];
    }

    this.polygon(ctx, raised, ROOF);
    if (doorEdge) this.door(ctx, doorEdge[0], doorEdge[1]);
  }

  private footprint(): Point[] {
    const tx0 = this.tx;
    const ty0 = this.ty;
    const tx1 = this.tx + this.tilesW - 1;
    const ty1 = this.ty + this.tilesH - 1;
    const points = [
      this.top(tx0, ty0),
      this.right(tx1, ty0),
      this.right(tx1, ty1),
      this.bottom(tx1, ty1),
      this.left(tx0, ty1),
      this.left(tx0, ty0),
    ];
    const unique: Point[] = [];
    for (const point of points) {
      const prev = unique[unique.length - 1];
      if (prev && same(prev, point)) continue;
      unique.push(point);
    }
    if (unique.length > 1 && same(unique[0], unique[unique.length - 1])) unique.pop();
    return dropCollinear(unique);
  }

  private top(tx: number, ty: number): Point {
    return {
      x: ORIGIN_X + (tx - ty) * (TILE_W / 2),
      y: ORIGIN_Y + (tx + ty) * (TILE_H / 2),
    };
  }

  private right(tx: number, ty: number): Point {
    const top = this.top(tx, ty);
    return { x: top.x + TILE_W / 2, y: top.y + TILE_H / 2 };
  }

  private bottom(tx: number, ty: number): Point {
    const top = this.top(tx, ty);
    return { x: top.x, y: top.y + TILE_H };
  }

  private left(tx: number, ty: number): Point {
    const top = this.top(tx, ty);
    return { x: top.x - TILE_W / 2, y: top.y + TILE_H / 2 };
  }

  private face(ctx: CanvasRenderingContext2D, a: Point, b: Point, c: Point, d: Point, color: string): void {
    this.polygon(ctx, [a, b, c, d], color);
  }

  private polygon(ctx: CanvasRenderingContext2D, points: Point[], color: string): void {
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

  private door(ctx: CanvasRenderingContext2D, a: Point, b: Point): void {
    const doorH = Math.min(14, this.wallH * 0.45);
    const width = 0.36 / this.tilesW;
    const u0 = 0.5 - width / 2;
    const u1 = 0.5 + width / 2;
    const at = (u: number, v: number) => ({
      x: a.x + (b.x - a.x) * u,
      y: a.y + (b.y - a.y) * u - v,
    });
    this.face(ctx, at(u0, 2), at(u1, 2), at(u1, 2 + doorH), at(u0, 2 + doorH), DOOR);
  }
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
