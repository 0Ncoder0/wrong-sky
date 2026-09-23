import type { InputFrame, Scene, SceneHost } from "../../scene.ts";
import type { PointerState } from "../../input/pointer.ts";
import { VIEW_H, VIEW_W } from "../../view.ts";

const BUTTON = { x: (VIEW_W - 270) / 2, y: 321, w: 270, h: 68 };

function pointerInside(pointer: PointerState): boolean {
  return pointer.x >= BUTTON.x && pointer.x < BUTTON.x + BUTTON.w && pointer.y >= BUTTON.y && pointer.y < BUTTON.y + BUTTON.h;
}

/** 标题占位：游戏名和「开始」。点击进入游戏场景。本目录放置标题场景的脚本和资源。 */
export class TitleScene implements Scene {
  public readonly id = "title" as const;
  private host: SceneHost = null;
  private hovered = false;

  public enter(host: SceneHost): void {
    this.host = host;
    this.hovered = false;
  }

  public exit(): void {
    this.host = null;
    this.hovered = false;
  }

  public update(dt: number, input: InputFrame): void {
    void dt;
    this.hovered = pointerInside(input.pointer);
    if (input.pointer.left.pressed && this.hovered && this.host) {
      this.host.switchTo("game");
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = "#1c2430";
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    ctx.fillStyle = "#e7e2d6";
    ctx.font = "61px ui-sans-serif, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Wrong Sky", VIEW_W / 2, 203);

    ctx.fillStyle = this.hovered ? "#d9c7a2" : "#c4b48a";
    ctx.fillRect(BUTTON.x, BUTTON.y, BUTTON.w, BUTTON.h);
    ctx.fillStyle = "#1a1a1e";
    ctx.font = "30px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText("开始", BUTTON.x + BUTTON.w / 2, BUTTON.y + BUTTON.h / 2);

    ctx.fillStyle = "#8e8a80";
    ctx.font = "24px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText("占位", VIEW_W / 2, 473);
  }
}
