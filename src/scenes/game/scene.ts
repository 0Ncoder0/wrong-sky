import type { InputFrame, Scene, SceneHost } from "../../scene.ts";
import { TileMap } from "./tile-map.ts";
import { Building } from "./building.ts";
import { GhostBuilding } from "./ghost-building.ts";
import { Player } from "./player.ts";

interface Sprite {
  depth(): number;
  render(ctx: CanvasRenderingContext2D): void;
}

/** 游戏场景。本目录放置局内脚本和资源。 */
export class GameScene implements Scene {
  public readonly id = "game" as const;
  private readonly map = new TileMap();
  private readonly player = new Player();
  private readonly buildings = [new Building(12, 14, 2, 1, 16), new Building(20, 14, 2, 2, 28), new Building(16, 22, 3, 3, 40)];
  private readonly ghost = new GhostBuilding();

  public enter(host: SceneHost): void {
    void host;
  }

  public exit(): void {}

  public update(dt: number, input: InputFrame): void {
    this.player.update(dt, input.keyboard, this.map, this.buildings);
    this.ghost.follow(this.map.tileAt(input.pointer.x, input.pointer.y), this.map, this.buildings, this.player);
    if (!input.pointer.pressed) return;
    const placed = this.ghost.commit();
    if (placed) this.buildings.push(placed);
  }

  public render(ctx: CanvasRenderingContext2D): void {
    this.map.render(ctx);
    const sprites: Sprite[] = [...this.buildings, this.player];
    if (this.ghost.isShown()) sprites.push(this.ghost);
    sprites.sort((a, b) => a.depth() - b.depth());
    for (const sprite of sprites) sprite.render(ctx);
  }
}
