import type { InputFrame, Scene, SceneHost } from "../../scene.ts";
import { TileMap } from "./tile-map.ts";
import { Building } from "./building.ts";
import { GhostBuilding } from "./ghost-building.ts";
import { Player } from "./player.ts";

interface Sprite {
  depth(): number;
  render(ctx: CanvasRenderingContext2D): void;
}

type Tool = "build" | "remove";

/** 游戏场景。本目录放置局内脚本和资源。 */
export class GameScene implements Scene {
  public readonly id = "game" as const;
  private readonly map = new TileMap();
  private readonly player = new Player();
  private readonly buildings = [new Building({ tx: 12, ty: 14, tilesW: 2, tilesH: 1, wallH: 16 }), new Building({ tx: 20, ty: 14, tilesW: 2, tilesH: 2, wallH: 28 }), new Building({ tx: 16, ty: 22, tilesW: 3, tilesH: 3, wallH: 40 })];
  private ghost: GhostBuilding = null;
  /** 当前工具。建造和删除共用这一个字段。 */
  private tool: Tool | null = null;

  public enter(host: SceneHost): void {
    void host;
  }

  public exit(): void {}

  public update(dt: number, input: InputFrame): void {
    if (input.keyboard.KeyB.pressed) this.tool = this.tool === "build" ? null : "build";
    if (input.keyboard.KeyR.pressed) this.tool = this.tool === "remove" ? null : "remove";

    this.player.update(dt, input.keyboard, input.pointer, this.map, this.buildings);
    if (this.tool === "build") this.onBuild(input);
    else this.ghost = null;
    if (this.tool === "remove") this.onRemove(input);
    else this.clearRemoving();
  }

  private onBuild(input: InputFrame): void {
    if (this.ghost == null) this.ghost = new GhostBuilding();
    const tile = this.map.tileAt(input.pointer.x, input.pointer.y);
    this.ghost.follow(tile, this.map, this.buildings, this.player);
    if (!input.pointer.left.pressed) return;
    const placed = this.ghost.commit();
    if (!placed) return;
    this.buildings.push(placed);
    this.tool = null;
    this.ghost = null;
  }

  private onRemove(input: InputFrame): void {
    this.clearRemoving();
    const tile = this.map.tileAt(input.pointer.x, input.pointer.y);
    if (tile == null) return;
    const target = this.buildings.find(building => building.occupies(tile.tx, tile.ty)) ?? null;
    if (target == null) return;
    target.removing = true;
    if (!input.pointer.left.pressed) return;
    const index = this.buildings.indexOf(target);
    if (index >= 0) this.buildings.splice(index, 1);
  }

  private clearRemoving(): void {
    for (const building of this.buildings) building.removing = false;
  }

  public render(ctx: CanvasRenderingContext2D): void {
    this.map.render(ctx);
    const sprites: Sprite[] = [...this.buildings, this.player];
    if (this.ghost != null && this.ghost.isShown()) sprites.push(this.ghost);
    sprites.sort((a, b) => a.depth() - b.depth());
    for (const sprite of sprites) sprite.render(ctx);
  }
}
