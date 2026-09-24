import { VIEW_H, VIEW_W } from "../../view.ts";

/** 砖 32×16，正方形格子压成高为宽一半的菱形。 */
export const TILE_W = 32;
export const TILE_H = 16;

export type Point = { x: number; y: number };

/** 等距换算。格子和屏幕的互换、菱形、深度都从这里取。 */
export class Iso {
  /** (0,0) 的上顶点。地图加载时放好，绘制不再另传。 */
  private static originX = 0;
  private static originY = 0;

  /**
   * 水平居中，垂直把整张岛放进画面。
   * 最后一格的下顶点到 (0,0) 上顶点的距离，正好是边长乘砖高。
   */
  public static placeOrigin(mapSize: number): void {
    this.originX = VIEW_W / 2;
    this.originY = (VIEW_H - mapSize * TILE_H) / 2;
  }

  /** 越大越靠近画面前方，排序时越晚画。tx、ty 可以是小数。 */
  public static depth(tx: number, ty: number): number {
    return tx + ty;
  }

  /** 格子上顶点。墙角和菱形都从这里出发。 */
  public static top(tx: number, ty: number): Point {
    return {
      x: this.originX + (tx - ty) * (TILE_W / 2),
      y: this.originY + (tx + ty) * (TILE_H / 2)
    };
  }

  /** 格子中心。人物的脚在这里。 */
  public static center(tx: number, ty: number): Point {
    const point = this.top(tx, ty);
    return { x: point.x, y: point.y + TILE_H / 2 };
  }

  public static right(tx: number, ty: number): Point {
    const point = this.top(tx, ty);
    return { x: point.x + TILE_W / 2, y: point.y + TILE_H / 2 };
  }

  public static bottom(tx: number, ty: number): Point {
    const point = this.top(tx, ty);
    return { x: point.x, y: point.y + TILE_H };
  }

  public static left(tx: number, ty: number): Point {
    const point = this.top(tx, ty);
    return { x: point.x - TILE_W / 2, y: point.y + TILE_H / 2 };
  }

  /** 上、右、下、左。地图格子和目标点共用这一圈。 */
  public static traceDiamond(ctx: CanvasRenderingContext2D, tx: number, ty: number): void {
    const north = this.top(tx, ty);
    const east = this.right(tx, ty);
    const south = this.bottom(tx, ty);
    const west = this.left(tx, ty);
    ctx.beginPath();
    ctx.moveTo(north.x, north.y);
    ctx.lineTo(east.x, east.y);
    ctx.lineTo(south.x, south.y);
    ctx.lineTo(west.x, west.y);
    ctx.closePath();
  }

  /** 屏幕点落在哪一格。地图外的格子也返回，边界由地图自己判断。 */
  public static tileOf(x: number, y: number): { tx: number; ty: number } {
    const halfW = TILE_W / 2;
    const halfH = TILE_H / 2;
    const rx = x - this.originX;
    const ry = y - this.originY;
    return {
      tx: Math.floor((ry / halfH + rx / halfW) / 2),
      ty: Math.floor((ry / halfH - rx / halfW) / 2)
    };
  }
}
