import type { Scene, SceneId } from "../scene.ts";
import { DeathScene } from "./death/scene.ts";
import { EndingScene } from "./ending/scene.ts";
import { GameScene } from "./game/scene.ts";
import { TitleScene } from "./title/scene.ts";

export const scenes: Record<SceneId, new () => Scene> = {
  title: TitleScene,
  game: GameScene,
  death: DeathScene,
  ending: EndingScene
};
