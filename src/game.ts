import { SceneDirector } from "./director.ts";
import { KeyboardInput } from "./input/keyboard.ts";
import { PointerInput } from "./input/pointer.ts";
import type { InputFrame } from "./scene.ts";
import { scenes } from "./scenes/scenes.ts";
import { VIEW_H, VIEW_W } from "./view.ts";

/** 调试用总入口。长期对象挂在这里；场景自己的角色和建筑仍留在场景里。 */
export class Game {
  public readonly canvas: HTMLCanvasElement;
  public readonly ctx: CanvasRenderingContext2D;
  public readonly pointer: PointerInput;
  public readonly keyboard: KeyboardInput;
  public readonly director: SceneDirector;
  private lastTime = performance.now();

  public constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D context unavailable");

    this.canvas = canvas;
    this.ctx = ctx;
    this.pointer = new PointerInput(canvas);
    this.keyboard = new KeyboardInput();
    this.director = new SceneDirector(id => new scenes[id](), "game");
    this.configureCanvas();
    window.addEventListener("resize", () => this.configureCanvas());
  }

  public start(): void {
    requestAnimationFrame(this.onFrame.bind(this));
  }

  private configureCanvas(): void {
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    this.canvas.style.width = `${VIEW_W}px`;
    this.canvas.style.height = `${VIEW_H}px`;
    this.canvas.width = Math.round(VIEW_W * dpr);
    this.canvas.height = Math.round(VIEW_H * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  private onFrame(now: number): void {
    const frameDt = (now - this.lastTime) / 1000;
    this.lastTime = now;

    const input: InputFrame = {
      pointer: this.pointer.snapshot(),
      keyboard: this.keyboard.snapshot()
    };
    this.director.advance(frameDt, input);
    this.pointer.acknowledgePressed();
    this.keyboard.acknowledge();
    this.director.render(this.ctx);

    requestAnimationFrame(this.onFrame.bind(this));
  }
}
