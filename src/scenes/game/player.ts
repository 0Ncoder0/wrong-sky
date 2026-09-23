import type { KeyboardState } from "../../input/keyboard.ts";
import { isLand, ORIGIN_X, ORIGIN_Y, TILE_H, TILE_W, type Terrain } from "./map.ts";

const BODY_W = 10;
const BODY_H = 20;
const HEAD_R = 5;
const STEP_INTERVAL = 0.16;

/** 站在格子中心。WASD 按屏幕方向换格，含斜向；海和地图外不进入。 */
export class Player {
  public readonly id = "player";
  public tx = 16;
  public ty = 16;
  private stepTimer = 0;

  /** 平地不挡人。以后有更高的东西时，按这个数决定谁盖住谁。 */
  public depth(): number {
    return this.tx + this.ty;
  }

  public update(dt: number, keyboard: KeyboardState, tiles: Terrain[][]): void {
    const move = this.direction(keyboard);
    if (!move) {
      this.stepTimer = 0;
      return;
    }
    this.stepTimer -= dt;
    if (this.stepTimer > 0) return;
    this.stepTimer = STEP_INTERVAL;
    const tx = this.tx + move.tx;
    const ty = this.ty + move.ty;
    if (!isLand(tiles, tx, ty)) return;
    this.tx = tx;
    this.ty = ty;
  }

  public render(ctx: CanvasRenderingContext2D): void {
    const footX = ORIGIN_X + (this.tx - this.ty) * (TILE_W / 2);
    const footY = ORIGIN_Y + (this.tx + this.ty) * (TILE_H / 2) + TILE_H / 2;
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
