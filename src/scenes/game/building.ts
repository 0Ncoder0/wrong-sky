import { Iso, type Point } from "./iso.ts";

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

/** 位置、占地格数、墙高。墙高是像素，不是格子。 */
export type BuildingBox = {
  tx: number;
  ty: number;
  tilesW: number;
  tilesH: number;
  wallH: number;
};

/** 靠画面前的那一角。整栋房子按这个深度一次画完。 */
export function buildingDepth(box: BuildingBox): number {
  return Iso.depth(box.tx + box.tilesW - 1, box.ty + box.tilesH - 1);
}

/** 占一块矩形地的盒子。墙高决定它能挡住人的多少，门在朝左的那面墙上。 */
export class Building {
  public readonly box: BuildingBox;
  /** 删除工具悬停在占地里时为 true，整栋用红色画。 */
  public removing = false;

  public constructor(box: BuildingBox) {
    this.box = box;
  }

  public depth(): number {
    return buildingDepth(this.box);
  }

  public occupies(tx: number, ty: number): boolean {
    const box = this.box;
    return tx >= box.tx && tx < box.tx + box.tilesW && ty >= box.ty && ty < box.ty + box.tilesH;
  }

  public render(ctx: CanvasRenderingContext2D): void {
    const colors = this.removing ? DEMOLISH_COLORS : BUILDING_COLORS;
    BuildingRenderer.render(ctx, this.box, colors);
  }
}

/** 按一份盒子数据和颜色画一栋房子。左右墙、顶、门、轮廓的颜色由调用方给。 */
export class BuildingRenderer {
  public static render(ctx: CanvasRenderingContext2D, box: BuildingBox, colors: BuildingColors): void {
    const ground = this.footprint(box);
    const raised = ground.map(point => ({ x: point.x, y: point.y - box.wallH }));
    const south = Iso.bottom(box.tx + box.tilesW - 1, box.ty + box.tilesH - 1);
    let doorEdge: [Point, Point] = null;
    let passedSouth = false;

    for (let i = 0; i < ground.length; i++) {
      const a = ground[i];
      const b = ground[(i + 1) % ground.length];
      if (this.same(a, south)) passedSouth = true;
      if (a.x <= b.x) continue;
      this.polygon(ctx, [a, b, { x: b.x, y: b.y - box.wallH }, { x: a.x, y: a.y - box.wallH }], passedSouth ? colors.leftWall : colors.rightWall, colors.outline);
      if (passedSouth && doorEdge == null) doorEdge = [a, b];
    }

    this.polygon(ctx, raised, colors.roof, colors.outline);
    if (doorEdge) this.door(ctx, doorEdge[0], doorEdge[1], box, colors.door, colors.outline);
  }

  private static footprint(box: BuildingBox): Point[] {
    const tx1 = box.tx + box.tilesW - 1;
    const ty1 = box.ty + box.tilesH - 1;
    const points = [Iso.top(box.tx, box.ty), Iso.right(tx1, box.ty), Iso.right(tx1, ty1), Iso.bottom(tx1, ty1), Iso.left(box.tx, ty1), Iso.left(box.tx, box.ty)];
    const unique: Point[] = [];
    for (const point of points) {
      const prev = unique[unique.length - 1];
      if (prev && this.same(prev, point)) continue;
      unique.push(point);
    }
    if (unique.length > 1 && this.same(unique[0], unique[unique.length - 1])) unique.pop();
    return this.dropCollinear(unique);
  }

  private static door(ctx: CanvasRenderingContext2D, a: Point, b: Point, box: BuildingBox, color: string, outline: string): void {
    const doorH = Math.min(14, box.wallH * 0.45);
    const width = 0.36 / box.tilesW;
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
