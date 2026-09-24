import { BUILDING_COLORS, Building, BuildingRenderer, buildingDepth, type BuildingBox, type BuildingColors } from "./building.ts";
import type { Player } from "./player.ts";
import { TILE_H } from "./iso.ts";
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

const SIZE = { tilesW: 2, tilesH: 2, wallH: TILE_H * 2 };

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
    return new Building(this.box());
  }

  public depth(): number {
    return buildingDepth(this.box());
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (!this.shown) return;
    ctx.save();
    ctx.globalAlpha = ALPHA;
    BuildingRenderer.render(ctx, this.box(), this.ok ? BUILDING_COLORS : BAD_COLORS);
    ctx.restore();
  }

  private box(): BuildingBox {
    return { tx: this.tx, ty: this.ty, ...SIZE };
  }

  private canPlace(map: TileMap, buildings: Building[], player: Player): boolean {
    const box = this.box();
    for (let ty = box.ty; ty < box.ty + box.tilesH; ty++) {
      for (let tx = box.tx; tx < box.tx + box.tilesW; tx++) {
        if (!map.isLand(tx, ty)) return false;
        if (buildings.some(building => building.occupies(tx, ty))) return false;
        if (player.occupies(tx, ty)) return false;
      }
    }
    return true;
  }
}
