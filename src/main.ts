/**
 * rAF = requestAnimationFrame
 * 浏览器在下一帧绘制前调用你的回调，适合游戏循环（跟屏幕刷新对齐，页签隐藏时会降频）。
 *
 * 注：本项目关闭了 strictNullChecks（见 tsconfig），DOM/资源以运行时检查为主。
 */

const canvas = document.querySelector<HTMLCanvasElement>("#game");
if (!canvas) {
  throw new Error("Missing #game canvas");
}

const ctx = canvas.getContext("2d");
if (!ctx) {
  throw new Error("2D context unavailable");
}

/** Logical (CSS) size — drawing coordinates use these, not backing-store pixels. */
const VIEW_W = 640;
const VIEW_H = 360;

function configureCanvas(): void {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  canvas.style.width = `${VIEW_W}px`;
  canvas.style.height = `${VIEW_H}px`;
  canvas.width = Math.round(VIEW_W * dpr);
  canvas.height = Math.round(VIEW_H * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

configureCanvas();
window.addEventListener("resize", configureCanvas);

const cx = VIEW_W / 2;
const cy = VIEW_H / 2;
const orbitRadius = 90;
const ballRadius = 16;

let angle = 0;
let lastTime = performance.now();

function frame(now: number): void {
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;
  angle += dt * 1.6;

  ctx.clearRect(0, 0, VIEW_W, VIEW_H);

  ctx.strokeStyle = "#5a5a68";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, orbitRadius, 0, Math.PI * 2);
  ctx.stroke();

  const x = cx + Math.cos(angle) * orbitRadius;
  const y = cy + Math.sin(angle) * orbitRadius;

  ctx.fillStyle = "#7ec8ff";
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#c8c8d0";
  ctx.font = "14px ui-sans-serif, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("Wrong Sky · canvas + rAF", cx, VIEW_H - 24);

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
