import { ORIGIN_X, ORIGIN_Y, TILE_H, TILE_W } from "./map.ts";

const BODY_W = 10;
const BODY_H = 20;
const HEAD_R = 5;

/** 站在陆地中央。脚在菱形中心，色块从脚往上画。 */
export class Player {
  public readonly id = "player";
  public tx = 16;
  public ty = 16;

  /** 平地不挡人。以后有更高的东西时，按这个数决定谁盖住谁。 */
  public depth(): number {
    return this.tx + this.ty;
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
}
