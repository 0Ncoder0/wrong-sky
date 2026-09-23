import type { KeyboardState } from "./input/keyboard.ts";
import type { PointerState } from "./input/pointer.ts";

export type SceneId = "title" | "game" | "death" | "ending";

/** 这一帧的输入。边沿只在本帧为 true，update 返回后由主循环清掉。 */
export interface InputFrame {
  pointer: PointerState;
  keyboard: KeyboardState;
}

export interface SceneHost {
  /** 记下目标。当前 update 返回后才真正切换。 */
  switchTo(id: SceneId): void;
}

export interface Scene {
  readonly id: SceneId;
  enter(host: SceneHost): void;
  exit(): void;
  update(dt: number, input: InputFrame): void;
  render(ctx: CanvasRenderingContext2D): void;
}
