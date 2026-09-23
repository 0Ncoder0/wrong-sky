import type { KeyboardState } from "../../input/keyboard.ts";
import type { PointerState } from "../../input/pointer.ts";
import type { Building } from "./building.ts";
import { ORIGIN_X, ORIGIN_Y, TILE_H, TILE_W, type TileMap } from "./tile-map.ts";

const STEP_INTERVAL = 0.16;

/** 格子中心之间匀速走。当前这段走完才响应新的方向。 */
export class Player {
  public readonly id = "player";
  public tx = 16;
  public ty = 16;
  /** 右键指定的那一格。 */
  private goal: { tx: number; ty: number } | null = null;
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

  /** 脚下清掉。海上、房子上、地图外保持原目标。 */
  private setGoal(tile: { tx: number; ty: number } | null, map: TileMap, buildings: Building[]): void {
    if (tile == null) return;
    if (tile.tx === this.tx && tile.ty === this.ty) {
      this.goal = null;
      return;
    }
    if (!map.isLand(tile.tx, tile.ty)) return;
    if (buildings.some(building => building.occupies(tile.tx, tile.ty))) return;
    this.goal = tile;
  }

  public update(dt: number, keyboard: KeyboardState, pointer: PointerState, map: TileMap, buildings: Building[]): void {
    if (pointer.right.pressed) this.setGoal(map.tileAt(pointer.x, pointer.y), map, buildings);
    if (this.direction(keyboard)) this.goal = null;
    if (this.to == null) {
      this.to = this.next(keyboard, map, buildings);
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
    const rest = { ...pointer, right: { ...pointer.right, pressed: false } };
    this.update(extra, keyboard, rest, map, buildings);
  }

  public render(ctx: CanvasRenderingContext2D): void {
    const tile = this.drawTile();
    PlayerRenderer.render(ctx, tile.tx, tile.ty);
    if (this.goal) GoalRenderer.render(ctx, this.goal.tx, this.goal.ty);
  }

  private drawTile(): { tx: number; ty: number } {
    if (!this.to) return { tx: this.tx, ty: this.ty };
    const t = Math.min(this.moveT, 1);
    return {
      tx: this.tx + (this.to.tx - this.tx) * t,
      ty: this.ty + (this.to.ty - this.ty) * t
    };
  }

  private next(keyboard: KeyboardState, map: TileMap, buildings: Building[]): { tx: number; ty: number } {
    const move = this.direction(keyboard);
    if (move) {
      const tx = this.tx + move.tx;
      const ty = this.ty + move.ty;
      if (!Pathfinder.canStep(tx, ty, map, buildings)) return null;
      return { tx, ty };
    }
    return this.towardGoal(map, buildings);
  }

  /** 没有路就停下。寻路本身在 Pathfinder。 */
  private towardGoal(map: TileMap, buildings: Building[]): { tx: number; ty: number } | null {
    const goal = this.goal;
    if (goal == null) return null;
    if (this.tx === goal.tx && this.ty === goal.ty) {
      this.goal = null;
      return null;
    }
    const step = Pathfinder.firstStep({ tx: this.tx, ty: this.ty }, goal, map, buildings);
    if (step == null) this.goal = null;
    return step;
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

type Tile = { tx: number; ty: number };

/** 八向等代价。给出最短路的第一步；到不了就是 null。 */
class Pathfinder {
  public static firstStep(from: Tile, goal: Tile, map: TileMap, buildings: Building[]): Tile | null {
    if (from.tx === goal.tx && from.ty === goal.ty) return null;

    const queue: { tx: number; ty: number; first: Tile | null }[] = [{ tx: from.tx, ty: from.ty, first: null }];
    const seen = new Set<string>([`${from.tx},${from.ty}`]);
    for (let i = 0; i < queue.length; i++) {
      const current = queue[i];
      for (const step of this.neighbors(current.tx, current.ty, goal)) {
        const key = `${step.tx},${step.ty}`;
        if (seen.has(key) || !this.canStep(step.tx, step.ty, map, buildings)) continue;
        seen.add(key);
        const first = current.first ?? step;
        if (step.tx === goal.tx && step.ty === goal.ty) return first;
        queue.push({ tx: step.tx, ty: step.ty, first });
      }
    }
    return null;
  }

  public static canStep(tx: number, ty: number, map: TileMap, buildings: Building[]): boolean {
    if (!map.isLand(tx, ty)) return false;
    return !buildings.some(building => building.occupies(tx, ty));
  }

  /** 先试更靠近目标的相邻格，空地上就会沿直线走。 */
  private static neighbors(tx: number, ty: number, goal: Tile): Tile[] {
    const cells: Tile[] = [];
    for (let nx = tx - 1; nx <= tx + 1; nx++) {
      for (let ny = ty - 1; ny <= ty + 1; ny++) {
        if (nx !== tx || ny !== ty) cells.push({ tx: nx, ty: ny });
      }
    }
    cells.sort((a, b) => {
      const da = Math.max(Math.abs(a.tx - goal.tx), Math.abs(a.ty - goal.ty));
      const db = Math.max(Math.abs(b.tx - goal.tx), Math.abs(b.ty - goal.ty));
      if (da !== db) return da - db;
      return Math.abs(a.tx - goal.tx) + Math.abs(a.ty - goal.ty) - (Math.abs(b.tx - goal.tx) + Math.abs(b.ty - goal.ty));
    });
    return cells;
  }
}

const BODY_W = 10;
const BODY_H = 20;
const HEAD_R = 5;
const BODY = "#c4564a";
const OUTLINE = "#1a1814";

class PlayerRenderer {
  public static render(ctx: CanvasRenderingContext2D, tx: number, ty: number): void {
    const foot = this.foot(tx, ty);
    const bodyTop = foot.y - BODY_H;
    ctx.fillStyle = BODY;
    ctx.fillRect(foot.x - BODY_W / 2, bodyTop, BODY_W, BODY_H);

    ctx.beginPath();
    ctx.arc(foot.x, bodyTop - HEAD_R + 1, HEAD_R, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 1;
    ctx.strokeRect(foot.x - BODY_W / 2, bodyTop, BODY_W, BODY_H);
    ctx.beginPath();
    ctx.arc(foot.x, bodyTop - HEAD_R + 1, HEAD_R, 0, Math.PI * 2);
    ctx.stroke();
  }

  private static foot(tx: number, ty: number): { x: number; y: number } {
    return {
      x: ORIGIN_X + (tx - ty) * (TILE_W / 2),
      y: ORIGIN_Y + (tx + ty) * (TILE_H / 2) + TILE_H / 2
    };
  }
}

const GOAL = "#e2b340";

class GoalRenderer {
  public static render(ctx: CanvasRenderingContext2D, tx: number, ty: number): void {
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
    ctx.strokeStyle = GOAL;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}
