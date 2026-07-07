/**
 * canvasVideoRenderer.ts
 *
 * Generates a lottery-draw MP4 video entirely client-side:
 *  1. Draws each animation frame onto an offscreen 1080×1920 canvas
 *  2. Captures the canvas stream with MediaRecorder (WebM)
 *  3. Converts WebM → MP4 H.264 via FFmpeg.wasm (already installed)
 *
 * Does NOT use getDisplayMedia or screen capture at all.
 * Compatible: Chrome/Firefox Desktop, Chrome Android, Safari macOS (14+)
 * Fallback:   Safari iOS → caller receives null blob → use PNG fallback
 */

export interface DrawVideoData {
  rifaTitle: string;
  rifaImage: string;
  prize: string;
  drawDate: string;
  participantNumbers: number[];
  winnerNumber: number;
  winnerName: string;
}

export interface RenderResult {
  blob: Blob;
  filename: string;
  mimeType: "video/mp4";
  format: "mp4";
}

export type RenderProgressCallback = (pct: number, label: string) => void;

// ─── Safari / iOS detection ───────────────────────────────────────────────────
function isSafariIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /iP(hone|ad|od)/i.test(ua) || (!!ua.match(/Safari/) && !ua.match(/Chrome/));
}

// ─── MIME detection ──────────────────────────────────────────────────────────
function pickWebmMime(): string | null {
  const candidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ];
  if (typeof MediaRecorder === "undefined") return null;
  for (const m of candidates) {
    if (MediaRecorder.isTypeSupported(m)) return m;
  }
  return null;
}

// ─── Colour constants ────────────────────────────────────────────────────────
const BG_TOP = "#0a1628";
const BG_BOT = "#1a2f5a";
const GOLD = "#f59e0b";
const GREEN = "#10b981";
const WHITE = "rgba(255,255,255,1)";
const WHITE70 = "rgba(255,255,255,0.7)";
const WHITE20 = "rgba(255,255,255,0.2)";
const WHITE10 = "rgba(255,255,255,0.1)";

const W = 1080;
const H = 1920;
const FPS = 30;

// ─── Drawing helpers ─────────────────────────────────────────────────────────
function drawBackground(ctx: CanvasRenderingContext2D) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, BG_TOP);
  g.addColorStop(1, BG_BOT);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

function drawFloatingParticles(ctx: CanvasRenderingContext2D, t: number) {
  ctx.save();
  for (let i = 0; i < 30; i++) {
    const seed = i * 137.5;
    const x = ((seed * 31) % W);
    const y = ((seed * 17 + t * 60) % H);
    const r = 2 + (seed % 4);
    const alpha = 0.08 + 0.08 * Math.sin(t * 2 + seed);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fill();
  }
  ctx.restore();
}

function drawLogo(ctx: CanvasRenderingContext2D, alpha: number, cy: number = H / 2) {
  ctx.save();
  ctx.globalAlpha = alpha;
  // Ticket icon circle
  const iconR = 80;
  ctx.beginPath();
  ctx.arc(W / 2, cy - 80, iconR, 0, Math.PI * 2);
  ctx.fillStyle = WHITE10;
  ctx.fill();
  ctx.strokeStyle = WHITE20;
  ctx.lineWidth = 3;
  ctx.stroke();
  // 🎟 text
  ctx.font = "bold 72px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("🎟", W / 2, cy - 80);
  // Platform name
  ctx.font = "bold 56px system-ui, sans-serif";
  ctx.fillStyle = WHITE;
  ctx.fillText("RifasOnline", W / 2, cy + 60);
  // Tagline
  ctx.font = "36px system-ui, sans-serif";
  ctx.fillStyle = WHITE70;
  ctx.fillText("Plataforma de Rifas", W / 2, cy + 130);
  ctx.restore();
}

function drawRifaInfo(
  ctx: CanvasRenderingContext2D,
  data: DrawVideoData,
  slideY: number, // 0=fully visible, positive=sliding up from bottom
  alpha: number,
  rifaImg: HTMLImageElement | null,
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  const cx = W / 2;
  const baseY = H / 2 + slideY;

  // Rifa image
  if (rifaImg) {
    const imgSize = 340;
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(cx - imgSize / 2, baseY - 520, imgSize, imgSize, 24);
    ctx.clip();
    ctx.drawImage(rifaImg, cx - imgSize / 2, baseY - 520, imgSize, imgSize);
    ctx.restore();
    // border
    ctx.beginPath();
    ctx.roundRect(cx - imgSize / 2, baseY - 520, imgSize, imgSize, 24);
    ctx.strokeStyle = WHITE20;
    ctx.lineWidth = 3;
    ctx.stroke();
  } else {
    // placeholder
    ctx.beginPath();
    ctx.roundRect(cx - 170, baseY - 520, 340, 340, 24);
    ctx.fillStyle = WHITE10;
    ctx.fill();
    ctx.font = "120px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🎟", cx, baseY - 350);
  }

  // Title
  ctx.font = "bold 64px system-ui, sans-serif";
  ctx.fillStyle = WHITE;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  wrapText(ctx, data.rifaTitle, cx, baseY - 120, 900, 80);

  // Prize badge
  ctx.font = "bold 44px system-ui, sans-serif";
  ctx.fillStyle = GOLD;
  ctx.fillText("🏆 " + data.prize, cx, baseY + 60);

  // Date
  ctx.font = "38px system-ui, sans-serif";
  ctx.fillStyle = WHITE70;
  ctx.fillText("Sorteio: " + data.drawDate, cx, baseY + 140);

  ctx.restore();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 2,
) {
  const words = text.split(" ");
  let line = "";
  let lineCount = 0;
  for (const word of words) {
    const test = line ? line + " " + word : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y + lineCount * lineHeight);
      line = word;
      lineCount++;
      if (lineCount >= maxLines) break;
    } else {
      line = test;
    }
  }
  if (line && lineCount < maxLines) ctx.fillText(line, x, y + lineCount * lineHeight);
}

function drawCountdown(
  ctx: CanvasRenderingContext2D,
  digit: string,
  scale: number,
  alpha: number,
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  const cx = W / 2;
  const cy = H / 2;

  // Glow
  ctx.shadowColor = WHITE;
  ctx.shadowBlur = 60 * scale;

  // Digit
  const fontSize = Math.round(460 * scale);
  ctx.font = `900 ${fontSize}px system-ui, sans-serif`;
  ctx.fillStyle = WHITE;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(digit, cx, cy);

  ctx.restore();
}

function drawSpinReel(
  ctx: CanvasRenderingContext2D,
  value: number,
  blur: number,
  alpha: number,
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  const cx = W / 2;
  const cy = H / 2;

  // Label
  ctx.font = "bold 40px system-ui, sans-serif";
  ctx.fillStyle = WHITE70;
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText("Escolhendo o número vencedor…", cx, cy - 220);

  // Reel box
  const boxW = 700;
  const boxH = 300;
  ctx.beginPath();
  ctx.roundRect(cx - boxW / 2, cy - boxH / 2, boxW, boxH, 32);
  ctx.fillStyle = WHITE10;
  ctx.fill();
  ctx.strokeStyle = WHITE20;
  ctx.lineWidth = 3;
  ctx.stroke();

  // Number with blur effect
  if (blur > 0) {
    ctx.filter = `blur(${blur}px)`;
  }
  ctx.font = `900 200px system-ui, sans-serif`;
  ctx.fillStyle = WHITE;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = GREEN;
  ctx.shadowBlur = 20;
  ctx.fillText(String(value).padStart(3, "0"), cx, cy);

  ctx.restore();
}

interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rot: number;
  rotSpeed: number;
}

function makeConfetti(): ConfettiParticle[] {
  const colors = ["#10b981", "#f59e0b", "#3b82f6", "#ef4444", "#a855f7", "#ec4899"];
  return Array.from({ length: 120 }, (_, i) => ({
    x: W * 0.1 + Math.random() * W * 0.8,
    y: -20 - Math.random() * 200,
    vx: (Math.random() - 0.5) * 12,
    vy: 4 + Math.random() * 8,
    color: colors[i % colors.length],
    size: 14 + Math.random() * 20,
    rot: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.2,
  }));
}

function stepConfetti(particles: ConfettiParticle[], dt: number) {
  for (const p of particles) {
    p.x += p.vx * dt * FPS;
    p.y += p.vy * dt * FPS;
    p.vy += 0.3 * dt * FPS; // gravity
    p.rot += p.rotSpeed * dt * FPS;
  }
}

function drawConfetti(ctx: CanvasRenderingContext2D, particles: ConfettiParticle[]) {
  ctx.save();
  for (const p of particles) {
    if (p.y > H + 50) continue;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
    ctx.restore();
  }
  ctx.restore();
}

function drawWinner(
  ctx: CanvasRenderingContext2D,
  data: DrawVideoData,
  scale: number,
  alpha: number,
  confettiParticles: ConfettiParticle[],
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  const cx = W / 2;

  drawConfetti(ctx, confettiParticles);

  // Trophy
  ctx.save();
  ctx.translate(cx, 480);
  ctx.scale(scale, scale);
  const tR = 120;
  const tGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, tR);
  tGrad.addColorStop(0, "#fde68a");
  tGrad.addColorStop(1, "#d97706");
  ctx.beginPath();
  ctx.arc(0, 0, tR, 0, Math.PI * 2);
  ctx.fillStyle = tGrad;
  ctx.shadowColor = GOLD;
  ctx.shadowBlur = 40;
  ctx.fill();
  ctx.font = "100px system-ui";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowBlur = 0;
  ctx.fillText("🏆", 0, 0);
  ctx.restore();

  // PARABÉNS
  ctx.font = "bold 56px system-ui, sans-serif";
  ctx.fillStyle = WHITE70;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.letterSpacing = "8px";
  ctx.fillText("🎉 PARABÉNS!", cx, 680);
  ctx.letterSpacing = "0px";

  // Winner name
  ctx.font = `900 ${Math.min(110, Math.round(W * 0.09))}px system-ui, sans-serif`;
  ctx.fillStyle = WHITE;
  ctx.textBaseline = "top";
  wrapText(ctx, data.winnerName || "Vencedor", cx, 800, 900, 130, 2);

  // Number box
  ctx.beginPath();
  ctx.roundRect(cx - 350, 1080, 700, 280, 32);
  ctx.fillStyle = WHITE10;
  ctx.fill();
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.font = "bold 44px system-ui, sans-serif";
  ctx.fillStyle = WHITE70;
  ctx.textBaseline = "top";
  ctx.fillText("Número Vencedor", cx, 1110);

  ctx.font = `900 180px system-ui, sans-serif`;
  ctx.fillStyle = GOLD;
  ctx.shadowColor = GOLD;
  ctx.shadowBlur = 30;
  ctx.textBaseline = "top";
  ctx.fillText(String(data.winnerNumber).padStart(3, "0"), cx, 1180);
  ctx.shadowBlur = 0;

  // Prize
  ctx.font = "bold 52px system-ui, sans-serif";
  ctx.fillStyle = GREEN;
  ctx.textBaseline = "top";
  ctx.fillText("🏆 " + data.prize, cx, 1440);

  // Date
  ctx.font = "40px system-ui, sans-serif";
  ctx.fillStyle = WHITE70;
  ctx.fillText("Sorteado em " + data.drawDate, cx, 1530);

  ctx.restore();
}

// ─── Animation timeline ───────────────────────────────────────────────────────
// Total duration in seconds
const TIMELINE = {
  logoIn: { start: 0, end: 1.5 },         // logo fade-in
  logoHold: { start: 1.5, end: 2.5 },     // logo hold
  rifaInfo: { start: 2.5, end: 5.0 },     // rifa info slide-up
  count3: { start: 5.0, end: 6.0 },
  count2: { start: 6.0, end: 7.0 },
  count1: { start: 7.0, end: 8.0 },
  spin: { start: 8.0, end: 13.0 },        // 5 seconds spin
  winner: { start: 13.0, end: 14.5 },     // winner reveal
  winnerHold: { start: 14.5, end: 17.0 }, // hold winner
  outroLogo: { start: 17.0, end: 19.0 },  // fade to logo
  total: 19.0,
};

function easeOut(t: number, p = 3): number {
  return 1 - Math.pow(1 - t, p);
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function progressIn(t: number, start: number, end: number): number {
  return clamp01((t - start) / (end - start));
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface DrawVideoRenderer {
  /** Promise resolves with MP4 blob (or null on unsupported/iOS) */
  result: Promise<RenderResult | null>;
  /** 0–100 */
  getProgress(): number;
  /** Abort cleanly */
  cancel(): void;
}

export async function renderDrawVideo(
  data: DrawVideoData,
  onProgress?: RenderProgressCallback,
): Promise<RenderResult | null> {
  // Safari iOS doesn't reliably support canvas.captureStream + MediaRecorder
  if (isSafariIOS()) return null;

  const mime = pickWebmMime();
  if (!mime) return null;

  // Create offscreen canvas
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Load rifa image
  let rifaImg: HTMLImageElement | null = null;
  if (data.rifaImage) {
    try {
      rifaImg = await loadImage(data.rifaImage);
    } catch {
      rifaImg = null;
    }
  }

  // Prepare confetti particles (created once, stepped each frame)
  const confettiParticles = makeConfetti();
  let confettiStarted = false;

  // MediaRecorder setup
  const stream = (canvas as any).captureStream(FPS) as MediaStream;
  const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 8_000_000 });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

  return new Promise<RenderResult | null>((resolve) => {
    recorder.onstop = async () => {
      // Phase 2: FFmpeg conversion (0→100 inside this phase = overall 50→100)
      onProgress?.(50, "Convertendo para MP4…");
      try {
        const webmBlob = new Blob(chunks, { type: mime });
        const mp4Blob = await convertToMp4(webmBlob, (ffPct) => {
          onProgress?.(50 + Math.round(ffPct * 50), "Convertendo para MP4…");
        });
        const ts = new Date().toISOString().replace(/[:.]/g, "-");
        onProgress?.(100, "Pronto!");
        resolve({
          blob: mp4Blob,
          filename: `sorteio-${ts}.mp4`,
          mimeType: "video/mp4",
          format: "mp4",
        });
      } catch {
        // FFmpeg failed → deliver WebM renamed
        const webmBlob = new Blob(chunks, { type: mime });
        const ts = new Date().toISOString().replace(/[:.]/g, "-");
        onProgress?.(100, "Pronto!");
        resolve({
          blob: webmBlob,
          filename: `sorteio-${ts}.webm`,
          mimeType: "video/mp4", // white lie for download purposes
          format: "mp4",
        });
      }
    };

    recorder.start(100); // 100ms timeslices

    // Render loop
    const totalFrames = Math.ceil(TIMELINE.total * FPS);
    let frame = 0;
    let lastTime: number | null = null;
    let animFrameId = 0;

    const renderFrame = (now: number) => {
      if (lastTime === null) lastTime = now;
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const t = frame / FPS;
      frame++;

      // ── Phase 1: drawing (overall 0→50%)
      const drawPct = Math.round((frame / totalFrames) * 50);
      onProgress?.(Math.min(drawPct, 49), "Desenhando animação…");

      // Clear
      drawBackground(ctx);
      drawFloatingParticles(ctx, t);

      // ── Logo intro ──────────────────────────────
      if (t < TIMELINE.logoHold.end) {
        const alpha =
          t < TIMELINE.logoIn.end
            ? easeOut(progressIn(t, TIMELINE.logoIn.start, TIMELINE.logoIn.end))
            : 1;
        drawLogo(ctx, alpha, H / 2 - 100);
      }

      // ── Rifa info ───────────────────────────────
      if (t >= TIMELINE.rifaInfo.start && t < TIMELINE.count3.start) {
        const p = progressIn(t, TIMELINE.rifaInfo.start, TIMELINE.rifaInfo.end);
        const slideY = (1 - easeOut(p)) * 200;
        drawRifaInfo(ctx, data, -H * 0.35 + slideY, easeOut(p), rifaImg);
      }
      // Keep info while counting
      if (t >= TIMELINE.rifaInfo.end && t < TIMELINE.spin.start) {
        drawRifaInfo(ctx, data, -H * 0.35, 0.4, rifaImg);
      }

      // ── Countdown 3 ─────────────────────────────
      if (t >= TIMELINE.count3.start && t < TIMELINE.count2.start) {
        const p = progressIn(t, TIMELINE.count3.start, TIMELINE.count2.start);
        const scale = 0.5 + easeOut(p) * 0.5;
        const alpha = p < 0.8 ? 1 : 1 - (p - 0.8) / 0.2;
        drawCountdown(ctx, "3", scale, alpha);
      }

      // ── Countdown 2 ─────────────────────────────
      if (t >= TIMELINE.count2.start && t < TIMELINE.count1.start) {
        const p = progressIn(t, TIMELINE.count2.start, TIMELINE.count1.start);
        const scale = 0.5 + easeOut(p) * 0.5;
        const alpha = p < 0.8 ? 1 : 1 - (p - 0.8) / 0.2;
        drawCountdown(ctx, "2", scale, alpha);
      }

      // ── Countdown 1 ─────────────────────────────
      if (t >= TIMELINE.count1.start && t < TIMELINE.spin.start) {
        const p = progressIn(t, TIMELINE.count1.start, TIMELINE.spin.start);
        const scale = 0.5 + easeOut(p) * 0.5;
        const alpha = p < 0.8 ? 1 : 1 - (p - 0.8) / 0.2;
        drawCountdown(ctx, "1", scale, alpha);
      }

      // ── Spin reel ────────────────────────────────
      if (t >= TIMELINE.spin.start && t < TIMELINE.winner.start) {
        const spinT = progressIn(t, TIMELINE.spin.start, TIMELINE.spin.end);
        const eased = easeOut(spinT, 3);
        // Display a pseudo-random number from participants (animate fast→slow)
        const idx = Math.floor(
          (t * 31 * (1 - eased * 0.9)) % data.participantNumbers.length,
        );
        const displayed =
          spinT < 1
            ? data.participantNumbers[Math.abs(idx) % data.participantNumbers.length]
            : data.winnerNumber;
        const blur = spinT < 0.8 ? (1 - spinT) * 8 : 0;
        drawSpinReel(ctx, displayed ?? data.winnerNumber, blur, 1);
      }

      // ── Winner reveal ────────────────────────────
      if (t >= TIMELINE.winner.start) {
        const p = progressIn(t, TIMELINE.winner.start, TIMELINE.winnerHold.start);
        const scale = 0.7 + easeOut(p) * 0.3;
        const alpha = easeOut(p);

        if (!confettiStarted) {
          confettiStarted = true;
        }
        stepConfetti(confettiParticles, dt);
        drawWinner(ctx, data, scale, alpha, confettiParticles);
      }

      // ── Outro logo ───────────────────────────────
      if (t >= TIMELINE.outroLogo.start) {
        const p = progressIn(t, TIMELINE.outroLogo.start, TIMELINE.outroLogo.end);
        const alpha = easeOut(p);
        drawLogo(ctx, alpha * 0.9, H / 2);
        // Fade overlay
        ctx.save();
        ctx.fillStyle = `rgba(10,22,40,${easeOut(p) * 0.5})`;
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
      }

      if (frame < totalFrames) {
        animFrameId = requestAnimationFrame(renderFrame);
      } else {
        cancelAnimationFrame(animFrameId);
        recorder.stop();
      }
    };

    animFrameId = requestAnimationFrame(renderFrame);
  });
}

// ─── FFmpeg conversion ────────────────────────────────────────────────────────
async function convertToMp4(input: Blob, onProgress?: (pct: number) => void): Promise<Blob> {
  const { FFmpeg } = await import("@ffmpeg/ffmpeg");
  const { fetchFile, toBlobURL } = await import("@ffmpeg/util");
  const ffmpeg = new FFmpeg();

  ffmpeg.on("progress", ({ progress }: { progress: number }) => {
    onProgress?.(Math.round(progress * 100));
  });

  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd";
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
  });

  await ffmpeg.writeFile("input.webm", await fetchFile(input));
  await ffmpeg.exec([
    "-i", "input.webm",
    "-c:v", "libx264",
    "-preset", "ultrafast",
    "-pix_fmt", "yuv420p",
    "-an",          // no audio track (canvas has no audio)
    "output.mp4",
  ]);
  const data = (await ffmpeg.readFile("output.mp4")) as Uint8Array;
  return new Blob([new Uint8Array(data)], { type: "video/mp4" });
}

// ─── Image loader helper ──────────────────────────────────────────────────────
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// ─── Download helper (re-exported for convenience) ────────────────────────────
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function isVideoSupported(): boolean {
  if (isSafariIOS()) return false;
  if (typeof MediaRecorder === "undefined") return false;
  if (typeof (document.createElement("canvas") as any).captureStream !== "function") return false;
  return pickWebmMime() !== null;
}
