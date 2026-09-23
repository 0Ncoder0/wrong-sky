import type { KeyboardState } from "../../input/keyboard.ts";
import type { Building } from "./building.ts";
import { isLand, ORIGIN_X, ORIGIN_Y, TILE_H, TILE_W, type Terrain } from "./map.ts";

const BODY_W = 10;
const BODY_H = 20;
const HEAD_R = 5;
const STEP_INTERVAL = 0.16;

/** 格子中心之间匀速走。当前这段走完才响应新的方向。 */
export class Player {
  public readonly id = "player";
  public tx = 16;
  public ty = 16;
  private to: { tx: number; ty: number } = null;
  private moveT = 0;

  /** 当前格，以及正在走入的那一格。 */
  public occupies(tx: number, ty: number): boolean {
    if (this.tx === tx && this.ty === ty) return true;
    return this.to != null && this.to.tx === tx && this.to.ty === ty;
  }

  /** 用插值后的位置。平地不挡人，以后建筑按这个数决定谁盖住谁。 */
  public depth(): number {
    const tile = this.drawTile();
    return tile.tx + tile.ty;
  }

  public update(dt: number, keyboard: KeyboardState, tiles: Terrain[][], buildings: Building[]): void {
    if (this.to == null) {
      this.to = this.next(keyboard, tiles, buildings);
      this.moveT = 0;
    }
    if (this.to == null) return;

    this.moveT += dt / STEP_INTERVAL;
    if (this.moveT < 1) return;

    const extra = (this.moveT - 1) * STEP_INTERVAL;
    this.tx = this.to.tx;
    this.ty = this.to.ty;
    this.to = null;
    this.moveT = 0;
    this.update(extra, keyboard, tiles, buildings);
  }

  public render(ctx: CanvasRenderingContext2D): void {
    const tile = this.drawTile();
    const footX = ORIGIN_X + (tile.tx - tile.ty) * (TILE_W / 2);
    const footY = ORIGIN_Y + (tile.tx + tile.ty) * (TILE_H / 2) + TILE_H / 2;
    const bodyTop = footY - BODY_H;

    ctx.fillStyle = "#c4564a";
    ctx.fillRect(footX - BODY_W / 2, bodyTop, BODY_W, BODY_H);

    ctx.beginPath();
    ctx.arc(footX, bodyTop - HEAD_R + 1, HEAD_R, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#1a1814";
    ctx.lineWidth = 1;
    ctx.strokeRect(footX - BODY_W / 2, bodyTop, BODY_W, BODY_H);
    ctx.beginPath();
    ctx.arc(footX, bodyTop - HEAD_R + 1, HEAD_R, 0, Math.PI * 2);
    ctx.stroke();
  }

  private drawTile(): { tx: number; ty: number } {
    if (!this.to) return { tx: this.tx, ty: this.ty };
    const t = Math.min(this.moveT, 1);
    return {
      tx: this.tx + (this.to.tx - this.tx) * t,
      ty: this.ty + (this.to.ty - this.ty) * t
    };
  }

  private next(keyboard: KeyboardState, tiles: Terrain[][], buildings: Building[]): { tx: number; ty: number } {
    const move = this.direction(keyboard);
    if (!move) return null;
    const tx = this.tx + move.tx;
    const ty = this.ty + move.ty;
    if (!isLand(tiles, tx, ty)) return null;
    if (buildings.some(building => building.occupies(tx, ty))) return null;
    return { tx, ty };
  }

  /**
   * 画面斜向只改一轴：左上 tx-1，右上 ty-1，左下 ty+1，右下 tx+1。
   * 画面正上、正下、正左、正右是相邻两个斜向合在一起。
   */
  private direction(keyboard: KeyboardState): { tx: number; ty: number } | null {
    const up = keyboard.KeyW.held && !keyboard.KeyS.held;
    const down = keyboard.KeyS.held && !keyboard.KeyW.held;
    const left = keyboard.KeyA.held && !keyboard.KeyD.held;
    const right = keyboard.KeyD.held && !keyboard.KeyA.held;

    if (up && left) return { tx: -1, ty: 0 };
    if (up && right) return { tx: 0, ty: -1 };
    if (down && left) return { tx: 0, ty: 1 };
    if (down && right) return { tx: 1, ty: 0 };
    if (up) return { tx: -1, ty: -1 };
    if (down) return { tx: 1, ty: 1 };
    if (left) return { tx: -1, ty: 1 };
    if (right) return { tx: 1, ty: -1 };
    return null;
  }
}
