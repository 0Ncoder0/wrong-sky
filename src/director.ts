import type { InputFrame, Scene, SceneHost, SceneId } from "./scene.ts";
import { VIEW_H, VIEW_W } from "./view.ts";

const MAX_FRAME_DT = 0.25;

export class SceneDirector implements SceneHost {
  private current: Scene;
  private pending: SceneId = null;
  private readonly create: (id: SceneId) => Scene;

  public constructor(create: (id: SceneId) => Scene, initial: SceneId) {
    this.create = create;
    this.current = create(initial);
    this.current.enter(this);
  }

  public switchTo(id: SceneId): void {
    this.pending = id;
  }

  /** 每帧一次逻辑。dt 为这一帧的秒数，封顶以免切页回来时一次结算太久。 */
  public advance(frameDt: number, input: InputFrame): void {
    const dt = Math.min(Math.max(frameDt, 0), MAX_FRAME_DT);
    this.current.update(dt, input);
    if (this.pending != null) this.applyPending();
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.clearRect(0, 0, VIEW_W, VIEW_H);
    this.current.render(ctx);
  }

  private applyPending(): void {
    if (this.pending === this.current.id) {
      this.pending = null;
      return;
    }
    const id = this.pending;
    this.pending = null;
    this.current.exit();
    this.current = this.create(id);
    this.current.enter(this);
  }
}
