import { BUILDING_COLORS, Building, BuildingRenderer, type BuildingColors } from "./building.ts";
import type { Player } from "./player.ts";
import { TILE_H, Iso } from "./iso.ts";
import type { TileMap } from "./tile-map.ts";

const BAD = "#c43c3c";
const ALPHA = 0.65;
const BAD_COLORS: BuildingColors = {
  leftWall: BAD,
  rightWall: BAD,
  roof: BAD,
  door: BAD,
  outline: BUILDING_COLORS.outline
};

const TILES_W = 2;
const TILES_H = 2;
const WALL_H = TILE_H * 2;

/** 跟着指针的预览房子。不占路，脚印不合法时整栋用同一种红。 */
export class GhostBuilding {
  private tx = 0;
  private ty = 0;
  private shown = false;
  private ok = false;

  public follow(tile: { tx: number; ty: number } | null, map: TileMap, buildings: Building[], player: Player): void {
    if (tile == null) {
      this.shown = false;
      return;
    }
    this.tx = tile.tx;
    this.ty = tile.ty;
    this.shown = true;
    this.ok = this.canPlace(map, buildings, player);
  }

  public isShown(): boolean {
    return this.shown;
  }

  /** 合法时放下同尺寸的实体房子。红色或不在地图上时什么也不做。 */
  public commit(): Building | null {
    if (!this.shown || !this.ok) return null;
    this.ok = false;
    return new Building(this.tx, this.ty, TILES_W, TILES_H, WALL_H);
  }

  /** 靠画面前的那一角。和实体建筑用同一个深度。 */
  public depth(): number {
    return Iso.depth(this.tx + TILES_W - 1, this.ty + TILES_H - 1);
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (!this.shown) return;
    ctx.save();
    ctx.globalAlpha = ALPHA;
    BuildingRenderer.render(ctx, this.tx, this.ty, TILES_W, TILES_H, WALL_H, this.ok ? BUILDING_COLORS : BAD_COLORS);
    ctx.restore();
  }

  private canPlace(map: TileMap, buildings: Building[], player: Player): boolean {
    for (let ty = this.ty; ty < this.ty + TILES_H; ty++) {
      for (let tx = this.tx; tx < this.tx + TILES_W; tx++) {
        if (!map.isLand(tx, ty)) return false;
        if (buildings.some(building => building.occupies(tx, ty))) return false;
        if (player.occupies(tx, ty)) return false;
      }
    }
    return true;
  }
}
