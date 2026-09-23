import type { InputFrame, Scene, SceneHost } from "../../scene.ts";
import { VIEW_H, VIEW_W } from "../../view.ts";

/** 结局占位。发射演出结束以后进入。本目录放置结局场景的脚本和资源。 */
export class EndingScene implements Scene {
  public readonly id = "ending" as const;

  public enter(host: SceneHost): void {
    void host;
  }

  public exit(): void {}

  public update(dt: number, input: InputFrame): void {
    void dt;
    void input;
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = "#241c2a";
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    ctx.fillStyle = "#e7e2d6";
    ctx.font = "61px ui-sans-serif, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("结局", VIEW_W / 2, 203);
    ctx.fillStyle = "#8e8a80";
    ctx.font = "24px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText("占位", VIEW_W / 2, 304);
  }
}
