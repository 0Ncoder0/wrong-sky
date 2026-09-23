/** 一个键在这一帧的状态。按下、抬起只在本帧为 true，update 返回后由主循环清掉。 */
export interface KeyEdge {
  held: boolean;
  pressed: boolean;
  released: boolean;
}

export interface KeyboardState {
  KeyW: KeyEdge;
  KeyA: KeyEdge;
  KeyS: KeyEdge;
  KeyD: KeyEdge;
}

class KeyEdgeState {
  public held = false;
  public pressed = false;
  public released = false;

  public copy(): KeyEdge {
    return { held: this.held, pressed: this.pressed, released: this.released };
  }

  public acknowledge(): void {
    this.pressed = false;
    this.released = false;
  }
}

/** 物理键位上的 WASD。按住留给移动，按下和抬起只活一帧。 */
export class KeyboardInput {
  private readonly keys: Record<keyof KeyboardState, KeyEdgeState> = {
    KeyW: new KeyEdgeState(),
    KeyA: new KeyEdgeState(),
    KeyS: new KeyEdgeState(),
    KeyD: new KeyEdgeState(),
  };

  public constructor() {
    window.addEventListener("keydown", (event) => this.down(event));
    window.addEventListener("keyup", (event) => this.up(event));
    window.addEventListener("blur", () => this.releaseAll());
  }

  public snapshot(): KeyboardState {
    return {
      KeyW: this.keys.KeyW.copy(),
      KeyA: this.keys.KeyA.copy(),
      KeyS: this.keys.KeyS.copy(),
      KeyD: this.keys.KeyD.copy(),
    };
  }

  public acknowledge(): void {
    for (const key of Object.values(this.keys)) key.acknowledge();
  }

  private down(event: KeyboardEvent): void {
    const key = this.slot(event.code);
    if (!key) return;
    event.preventDefault();
    if (event.repeat || key.held) return;
    key.held = true;
    key.pressed = true;
  }

  private up(event: KeyboardEvent): void {
    const key = this.slot(event.code);
    if (!key || !key.held) return;
    event.preventDefault();
    key.held = false;
    key.released = true;
  }

  private releaseAll(): void {
    for (const key of Object.values(this.keys)) {
      if (!key.held) continue;
      key.held = false;
      key.released = true;
    }
  }

  private slot(code: string): KeyEdgeState | null {
    if (code !== "KeyW" && code !== "KeyA" && code !== "KeyS" && code !== "KeyD") return null;
    return this.keys[code];
  }
}
