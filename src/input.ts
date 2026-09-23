import type { InputFrame } from "./scene.ts";
import { VIEW_H, VIEW_W } from "./view.ts";

/** 把指针收成逻辑坐标。按下边沿在本帧 update 读过之后清掉。 */
export class PointerInput {
  private x = 0;
  private y = 0;
  private held = false;
  private pressed = false;

  constructor(canvas: HTMLCanvasElement) {
    canvas.addEventListener("pointerdown", (event) => {
      this.held = true;
      this.pressed = true;
      this.track(canvas, event);
    });
    canvas.addEventListener("pointerup", (event) => {
      this.held = false;
      this.track(canvas, event);
    });
    canvas.addEventListener("pointermove", (event) => {
      this.track(canvas, event);
    });
  }

  public snapshot(): InputFrame {
    return {
      pointerX: this.x,
      pointerY: this.y,
      pointerHeld: this.held,
      pointerPressed: this.pressed,
    };
  }

  public acknowledgePressed(): void {
    this.pressed = false;
  }

  private track(canvas: HTMLCanvasElement, event: PointerEvent): void {
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width > 0 ? VIEW_W / rect.width : 1;
    const scaleY = rect.height > 0 ? VIEW_H / rect.height : 1;
    this.x = (event.clientX - rect.left) * scaleX;
    this.y = (event.clientY - rect.top) * scaleY;
  }
}
