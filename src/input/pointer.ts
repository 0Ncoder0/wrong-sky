import { VIEW_H, VIEW_W } from "../view.ts";

/** 一个键在这一帧的状态。按下、抬起只在本帧为 true。 */
export interface PointerButton {
  held: boolean;
  pressed: boolean;
  released: boolean;
}

export interface PointerState {
  x: number;
  y: number;
  left: PointerButton;
  right: PointerButton;
}

class PointerButtonState {
  public held = false;
  public pressed = false;
  public released = false;

  public copy(): PointerButton {
    return { held: this.held, pressed: this.pressed, released: this.released };
  }

  public acknowledge(): void {
    this.pressed = false;
    this.released = false;
  }
}

/** 把指针收成逻辑坐标。按下和抬起只活一帧，update 返回后由主循环清掉。 */
export class PointerInput {
  private x = 0;
  private y = 0;
  private readonly left = new PointerButtonState();
  private readonly right = new PointerButtonState();

  constructor(canvas: HTMLCanvasElement) {
    canvas.addEventListener("pointerdown", event => this.down(canvas, event));
    canvas.addEventListener("pointerup", event => this.up(canvas, event));
    canvas.addEventListener("pointermove", event => this.track(canvas, event));
    canvas.addEventListener("pointerleave", () => {
      this.x = -1;
      this.y = -1;
    });
    canvas.addEventListener("contextmenu", event => event.preventDefault());
  }

  public snapshot(): PointerState {
    return {
      x: this.x,
      y: this.y,
      left: this.left.copy(),
      right: this.right.copy()
    };
  }

  public acknowledgePressed(): void {
    this.left.acknowledge();
    this.right.acknowledge();
  }

  private down(canvas: HTMLCanvasElement, event: PointerEvent): void {
    const button = this.button(event.button);
    if (!button) return;
    this.track(canvas, event);
    if (button.held) return;
    button.held = true;
    button.pressed = true;
  }

  private up(canvas: HTMLCanvasElement, event: PointerEvent): void {
    const button = this.button(event.button);
    if (!button || !button.held) return;
    this.track(canvas, event);
    button.held = false;
    button.released = true;
  }

  private button(button: number): PointerButtonState | null {
    if (button === 0) return this.left;
    if (button === 2) return this.right;
    return null;
  }

  private track(canvas: HTMLCanvasElement, event: PointerEvent): void {
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width > 0 ? VIEW_W / rect.width : 1;
    const scaleY = rect.height > 0 ? VIEW_H / rect.height : 1;
    this.x = (event.clientX - rect.left) * scaleX;
    this.y = (event.clientY - rect.top) * scaleY;
  }
}
