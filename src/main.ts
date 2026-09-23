/**
 * rAF = requestAnimationFrame
 * 浏览器在下一帧绘制前调用回调。每帧 update 一次，渲染只读当前场景。
 *
 * 注：本项目关闭了 strictNullChecks（见 tsconfig），DOM/资源以运行时检查为主。
 */

import { Game } from "./game.ts";

const canvas = document.querySelector<HTMLCanvasElement>("#game");
if (!canvas) throw new Error("Missing #game canvas");

declare global {
  var game: Game;
}

globalThis.game = new Game(canvas);
globalThis.game.start();
