/**
 * canvasVideoRenderer.ts  (v2)
 *
 * Strategy:
 *  1. Try native MP4 MediaRecorder first (Chrome 94+ Desktop/Android) → no FFmpeg needed
 *  2. Fall back to WebM + FFmpeg.wasm conversion
 *  3. iOS Safari → generate a premium 1080×1920 PNG instead (no video API)
 *
 * No getDisplayMedia / screen capture used anywhere.
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
  mimeType: string;
  format: "mp4" | "webm" | "png";
}

export type RenderProgressCallback = (pct: number, label: string) => void;

// ─── Device detection ─────────────────────────────────────────────────────────
export function isIOSSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  // iPhone / iPad / iPod running Safari (not Chrome on iOS)
  return /iP(hone|ad|od)/i.test(ua) && !!ua.match(/Safari/) && !ua.match(/Chrome/);
}

export function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
}

function isSafariDesktop(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return !!ua.match(/Safari/) && !ua.match(/Chrome/) && !ua.match(/iP(hone|ad|od)/i);
}

// ─── MIME detection — try native MP4 first ────────────────────────────────────
interface PickedMime {
  mime: string;
  isNativeMp4: boolean;
}

function pickRecordingMime(): PickedMime | null {
  if (typeof MediaRecorder === "undefined") return null;

  // Native MP4 — Chrome 94+ desktop and some Android versions
  const mp4Candidates = [
    "video/mp4;codecs=h264,aac",
    "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
    "video/mp4",
  ];
  for (const m of mp4Candidates) {
    if (MediaRecorder.isTypeSupported(m)) {
      return { mime: m, isNativeMp4: true };
    }
  }

  // WebM fallback (requires FFmpeg conversion)
  const webmCandidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ];
  for (const m of webmCandidates) {
    if (MediaRecorder.isTypeSupported(m)) {
      return { mime: m, isNativeMp4: false };
    }
  }
  return null;
}

// ─── Colour constants ─────────────────────────────────────────────────────────
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

// ─── Drawing helpers ──────────────────────────────────────────────────────────
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
    const x = (seed * 31) % W;
    const y = (seed * 17 + t * 60) % H;
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
  const iconR = 80;
  ctx.beginPath();
  ctx.arc(W / 2, cy - 80, iconR, 0, Math.PI * 2);
  ctx.fillStyle = WHITE10;
  ctx.fill();
  ctx.strokeStyle = WHITE20;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.font = "bold 72px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = WHITE;
  ctx.fillText("🎟", W / 2, cy - 80);
  ctx.font = "bold 56px system-ui, sans-serif";
  ctx.fillStyle = WHITE;
  ctx.fillText("RifasOnline", W / 2, cy + 60);
  ctx.font = "36px system-ui, sans-serif";
  ctx.fillStyle = WHITE70;
  ctx.fillText("Plataforma de Rifas", W / 2, cy + 130);
  ctx.restore();
}

function drawRifaInfo(
  ctx: CanvasRenderingContext2D,
  data: DrawVideoData,
  slideY: number,
  alpha: number,
  rifaImg: HTMLImageElement | null,
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  const cx = W / 2;
  const baseY = H / 2 + slideY;

  if (rifaImg) {
    const imgSize = 340;
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(cx - imgSize / 2, baseY - 520, imgSize, imgSize, 24);
    ctx.clip();
    ctx.drawImage(rifaImg, cx - imgSize / 2, baseY - 520, imgSize, imgSize);
    ctx.restore();
    ctx.beginPath();
    ctx.roundRect(cx - imgSize / 2, baseY - 520, imgSize, imgSize, 24);
    ctx.strokeStyle = WHITE20;
    ctx.lineWidth = 3;
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.roundRect(cx - 170, baseY - 520, 340, 340, 24);
    ctx.fillStyle = WHITE10;
    ctx.fill();
    ctx.font = "120px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🎟", cx, baseY - 350);
  }

  ctx.font = "bold 64px system-ui, sans-serif";
  ctx.fillStyle = WHITE;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  wrapText(ctx, data.rifaTitle, cx, baseY - 120, 900, 80);
  ctx.font = "bold 44px system-ui, sans-serif";
  ctx.fillStyle = GOLD;
  ctx.fillText("🏆 " + data.prize, cx, baseY + 60);
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

function drawCountdown(ctx: CanvasRenderingContext2D, digit: string, scale: number, alpha: number) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.shadowColor = WHITE;
  ctx.shadowBlur = 60 * scale;
  const fontSize = Math.round(460 * scale);
  ctx.font = `900 ${fontSize}px system-ui, sans-serif`;
  ctx.fillStyle = WHITE;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(digit, W / 2, H / 2);
  ctx.restore();
}

function drawSpinReel(ctx: CanvasRenderingContext2D, value: number, blur: number, alpha: number) {
  ctx.save();
  ctx.globalAlpha = alpha;
  const cx = W / 2;
  const cy = H / 2;
  ctx.font = "bold 40px system-ui, sans-serif";
  ctx.fillStyle = WHITE70;
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText("Escolhendo o número vencedor…", cx, cy - 220);
  const boxW = 700;
  const boxH = 300;
  ctx.beginPath();
  ctx.roundRect(cx - boxW / 2, cy - boxH / 2, boxW, boxH, 32);
  ctx.fillStyle = WHITE10;
  ctx.fill();
  ctx.strokeStyle = WHITE20;
  ctx.lineWidth = 3;
  ctx.stroke();
  if (blur > 0) ctx.filter = `blur(${blur}px)`;
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
  x: number; y: number; vx: number; vy: number;
  color: string; size: number; rot: number; rotSpeed: number;
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
    p.vy += 0.3 * dt * FPS;
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
  ctx.save();
  ctx.translate(cx, 480);
  ctx.scale(scale, scale);
  const tGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 120);
  tGrad.addColorStop(0, "#fde68a");
  tGrad.addColorStop(1, "#d97706");
  ctx.beginPath();
  ctx.arc(0, 0, 120, 0, Math.PI * 2);
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
  ctx.font = "bold 56px system-ui, sans-serif";
  ctx.fillStyle = WHITE70;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText("🎉 PARABÉNS!", cx, 680);
  ctx.font = `900 ${Math.min(110, Math.round(W * 0.09))}px system-ui, sans-serif`;
  ctx.fillStyle = WHITE;
  wrapText(ctx, data.winnerName || "Vencedor", cx, 800, 900, 130, 2);
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
  ctx.font = "bold 52px system-ui, sans-serif";
  ctx.fillStyle = GREEN;
  ctx.textBaseline = "top";
  ctx.fillText("🏆 " + data.prize, cx, 1440);
  ctx.font = "40px system-ui, sans-serif";
  ctx.fillStyle = WHITE70;
  ctx.fillText("Sorteado em " + data.drawDate, cx, 1530);
  ctx.restore();
}

// ─── Timeline ─────────────────────────────────────────────────────────────────
const TL = {
  logoIn:    { s: 0,    e: 1.5 },
  logoHold:  { s: 1.5,  e: 2.5 },
  rifaInfo:  { s: 2.5,  e: 5.0 },
  count3:    { s: 5.0,  e: 6.0 },
  count2:    { s: 6.0,  e: 7.0 },
  count1:    { s: 7.0,  e: 8.0 },
  spin:      { s: 8.0,  e: 13.0 },
  winner:    { s: 13.0, e: 14.5 },
  winnerHold:{ s: 14.5, e: 17.0 },
  outroLogo: { s: 17.0, e: 19.0 },
  total: 19.0,
};

function eo(t: number, p = 3) { return 1 - Math.pow(1 - t, p); }
function c01(v: number)        { return Math.max(0, Math.min(1, v)); }
function pIn(t: number, s: number, e: number) { return c01((t - s) / (e - s)); }

// ─── Core frame renderer (shared by video AND PNG paths) ──────────────────────
function renderFrameAt(
  ctx: CanvasRenderingContext2D,
  t: number,
  dt: number,
  data: DrawVideoData,
  rifaImg: HTMLImageElement | null,
  confettiParticles: ConfettiParticle[],
) {
  drawBackground(ctx);
  drawFloatingParticles(ctx, t);

  // Logo intro
  if (t < TL.logoHold.e) {
    const alpha = t < TL.logoIn.e ? eo(pIn(t, TL.logoIn.s, TL.logoIn.e)) : 1;
    drawLogo(ctx, alpha, H / 2 - 100);
  }
  // Rifa info
  if (t >= TL.rifaInfo.s && t < TL.count3.s) {
    const p = pIn(t, TL.rifaInfo.s, TL.rifaInfo.e);
    drawRifaInfo(ctx, data, -H * 0.35 + (1 - eo(p)) * 200, eo(p), rifaImg);
  }
  if (t >= TL.rifaInfo.e && t < TL.spin.s) {
    drawRifaInfo(ctx, data, -H * 0.35, 0.4, rifaImg);
  }
  // Countdowns
  if (t >= TL.count3.s && t < TL.count2.s) {
    const p = pIn(t, TL.count3.s, TL.count2.s);
    drawCountdown(ctx, "3", 0.5 + eo(p) * 0.5, p < 0.8 ? 1 : 1 - (p - 0.8) / 0.2);
  }
  if (t >= TL.count2.s && t < TL.count1.s) {
    const p = pIn(t, TL.count2.s, TL.count1.s);
    drawCountdown(ctx, "2", 0.5 + eo(p) * 0.5, p < 0.8 ? 1 : 1 - (p - 0.8) / 0.2);
  }
  if (t >= TL.count1.s && t < TL.spin.s) {
    const p = pIn(t, TL.count1.s, TL.spin.s);
    drawCountdown(ctx, "1", 0.5 + eo(p) * 0.5, p < 0.8 ? 1 : 1 - (p - 0.8) / 0.2);
  }
  // Spin
  if (t >= TL.spin.s && t < TL.winner.s) {
    const spinT = pIn(t, TL.spin.s, TL.spin.e);
    const eased = eo(spinT, 3);
    const idx = Math.floor((t * 31 * (1 - eased * 0.9)) % data.participantNumbers.length);
    const displayed = spinT < 1
      ? data.participantNumbers[Math.abs(idx) % data.participantNumbers.length]
      : data.winnerNumber;
    const blur = spinT < 0.8 ? (1 - spinT) * 8 : 0;
    drawSpinReel(ctx, displayed ?? data.winnerNumber, blur, 1);
  }
  // Winner
  if (t >= TL.winner.s) {
    const p = pIn(t, TL.winner.s, TL.winnerHold.s);
    stepConfetti(confettiParticles, dt);
    drawWinner(ctx, data, 0.7 + eo(p) * 0.3, eo(p), confettiParticles);
  }
  // Outro
  if (t >= TL.outroLogo.s) {
    const p = pIn(t, TL.outroLogo.s, TL.outroLogo.e);
    drawLogo(ctx, eo(p) * 0.9, H / 2);
    ctx.save();
    ctx.fillStyle = `rgba(10,22,40,${eo(p) * 0.5})`;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
}

// ─── iOS / unsupported: generate premium PNG of winner frame ──────────────────
export async function generateResultPng(data: DrawVideoData): Promise<RenderResult> {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  let rifaImg: HTMLImageElement | null = null;
  if (data.rifaImage) {
    try { rifaImg = await loadImage(data.rifaImage); } catch {}
  }

  // Draw the winner-hold frame (t = winnerHold midpoint)
  const confetti = makeConfetti();
  // Advance confetti visually (pretend 2s have passed)
  for (let i = 0; i < 60; i++) stepConfetti(confetti, 1 / FPS);

  drawBackground(ctx);
  drawFloatingParticles(ctx, TL.winner.s + 1);
  drawWinner(ctx, data, 1, 1, confetti);

  // Footer logo
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.font = "bold 38px system-ui, sans-serif";
  ctx.fillStyle = WHITE70;
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText("RifasOnline · Plataforma de Rifas", W / 2, H - 40);
  ctx.restore();

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const ts = new Date().toISOString().replace(/[:.]/g, "-");
      resolve({
        blob: blob!,
        filename: `sorteio-${ts}.png`,
        mimeType: "image/png",
        format: "png",
      });
    }, "image/png");
  });
}

// ─── Audio scheduler helper ───────────────────────────────────────────────────
function scheduleAudioForDraw(audioCtx: AudioContext, destination: AudioNode) {
  const now = audioCtx.currentTime;

  // 1. Countdown ticks (5.0, 6.0, 7.0 seconds)
  [5.0, 6.0, 7.0].forEach((timeOffset) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, now + timeOffset);
    
    gain.gain.setValueAtTime(0.001, now + timeOffset);
    gain.gain.exponentialRampToValueAtTime(0.25, now + timeOffset + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 0.25);
    
    osc.connect(gain).connect(destination);
    osc.start(now + timeOffset);
    osc.stop(now + timeOffset + 0.28);
  });

  // 2. Spin suspense (8.0 to 13.0 seconds)
  [140, 210, 320].forEach((f, idx) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = idx === 0 ? "sawtooth" : "sine";
    osc.frequency.setValueAtTime(f, now + 8.0);
    
    gain.gain.setValueAtTime(0, now + 8.0);
    gain.gain.linearRampToValueAtTime(0.03, now + 8.0 + 0.4);
    gain.gain.linearRampToValueAtTime(0.03, now + 12.8);
    gain.gain.linearRampToValueAtTime(0, now + 13.0);
    
    osc.connect(gain).connect(destination);
    osc.start(now + 8.0);
    osc.stop(now + 13.05);
  });

  // 3. Victory sound (13.0 seconds onward)
  const victoryNotes = [523.25, 659.25, 783.99, 1046.5];
  victoryNotes.forEach((f, idx) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(f, now + 13.0 + idx * 0.12);
    
    const start = now + 13.0 + idx * 0.12;
    gain.gain.setValueAtTime(0.001, start);
    gain.gain.exponentialRampToValueAtTime(0.3, start + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5);
    
    osc.connect(gain).connect(destination);
    osc.start(start);
    osc.stop(start + 0.55);
  });
}

// ─── Video: canvas stream → MediaRecorder ────────────────────────────────────
export async function renderDrawVideo(
  data: DrawVideoData,
  onProgress?: RenderProgressCallback,
): Promise<RenderResult | null> {
  const picked = pickRecordingMime();
  if (!picked) return null;

  // Check canvas.captureStream availability (Safari desktop < 14)
  const testCanvas = document.createElement("canvas");
  if (typeof (testCanvas as any).captureStream !== "function") return null;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  let rifaImg: HTMLImageElement | null = null;
  if (data.rifaImage) {
    try { rifaImg = await loadImage(data.rifaImage); } catch {}
  }

  const confettiParticles = makeConfetti();
  
  // Set up AudioContext recording stream
  let audioCtx: AudioContext | null = null;
  let audioDest: MediaStreamAudioDestinationNode | null = null;
  try {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioDest = audioCtx.createMediaStreamDestination();
  } catch (e) {
    console.error("AudioContext recording not supported:", e);
  }

  const stream = (canvas as any).captureStream(FPS) as MediaStream;
  let combinedStream = stream;
  if (audioDest) {
    const audioTracks = audioDest.stream.getAudioTracks();
    if (audioTracks.length > 0) {
      combinedStream = new MediaStream([
        ...stream.getVideoTracks(),
        ...audioTracks
      ]);
    }
  }

  const recorder = new MediaRecorder(combinedStream, {
    mimeType: picked.mime,
    videoBitsPerSecond: 8_000_000,
  });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

  const totalFrames = Math.ceil(TL.total * FPS);

  return new Promise<RenderResult | null>((resolve) => {
    recorder.onstop = async () => {
      const rawBlob = new Blob(chunks, { type: picked.mime });
      const ts = new Date().toISOString().replace(/[:.]/g, "-");

      if (audioCtx) {
        try { audioCtx.close(); } catch {}
      }

      // If native MP4 or mobile device: bypass FFmpeg conversion to prevent browser OOM (out of memory) crash on low-ram tablets/phones
      if (picked.isNativeMp4 || isMobileDevice()) {
        onProgress?.(100, "Pronto!");
        const extension = picked.isNativeMp4 ? "mp4" : "webm";
        const mime = picked.isNativeMp4 ? "video/mp4" : "video/webm";
        resolve({
          blob: rawBlob,
          filename: `sorteio-${ts}.${extension}`,
          mimeType: mime,
          format: picked.isNativeMp4 ? "mp4" : "webm",
        });
        return;
      }

      // WebM → try FFmpeg conversion
      onProgress?.(52, "Convertendo para MP4…");
      try {
        const mp4Blob = await convertToMp4(rawBlob, (ffPct) => {
          onProgress?.(52 + Math.round(ffPct * 46), "Convertendo para MP4…");
        });
        onProgress?.(100, "Pronto!");
        resolve({ blob: mp4Blob, filename: `sorteio-${ts}.mp4`, mimeType: "video/mp4", format: "mp4" });
      } catch {
        // FFmpeg failed (likely no SharedArrayBuffer) — deliver WebM
        onProgress?.(100, "Pronto! (formato WebM)");
        resolve({ blob: rawBlob, filename: `sorteio-${ts}.webm`, mimeType: "video/webm", format: "webm" });
      }
    };

    // Pre-schedule synthesized sound effect milestones
    if (audioCtx && audioDest) {
      scheduleAudioForDraw(audioCtx, audioDest);
    }

    recorder.start(200);

    let frame = 0;
    const frameInterval = 1000 / FPS;

    const renderFrame = () => {
      const t = frame / FPS;
      const dt = 1 / FPS; // Constant dt for physics/confetti consistency
      frame++;

      const drawPct = Math.round((frame / totalFrames) * 50);
      onProgress?.(Math.min(drawPct, 50), "Desenhando animação…");

      renderFrameAt(ctx, t, dt, data, rifaImg, confettiParticles);

      if (frame < totalFrames) {
        setTimeout(renderFrame, frameInterval);
      } else {
        recorder.stop();
      }
    };

    setTimeout(renderFrame, frameInterval);
  });
}

// ─── FFmpeg WebM → MP4 ────────────────────────────────────────────────────────
async function convertToMp4(input: Blob, onProgress?: (pct: number) => void): Promise<Blob> {
  const { FFmpeg } = await import("@ffmpeg/ffmpeg");
  const { fetchFile, toBlobURL } = await import("@ffmpeg/util");
  const ffmpeg = new FFmpeg();

  ffmpeg.on("progress", ({ progress }: { progress: number }) => {
    onProgress?.(Math.round(progress * 100));
  });

  // Use the single-threaded core (no SharedArrayBuffer required)
  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd";
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
  });

  await ffmpeg.writeFile("input.webm", await fetchFile(input));
  await ffmpeg.exec(["-i", "input.webm", "-c:v", "libx264", "-preset", "ultrafast", "-pix_fmt", "yuv420p", "-c:a", "aac", "output.mp4"]);
  const data = (await ffmpeg.readFile("output.mp4")) as Uint8Array;
  return new Blob([new Uint8Array(data)], { type: "video/mp4" });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

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

/** Try native share sheet (mobile). Falls back to download. */
export async function shareOrDownload(blob: Blob, filename: string, title?: string) {
  const file = new File([blob], filename, { type: blob.type });
  if (
    typeof navigator !== "undefined" &&
    navigator.share &&
    navigator.canShare({ files: [file] })
  ) {
    try {
      await navigator.share({ files: [file], title: title ?? filename });
      return;
    } catch (e: any) {
      if (e?.name === "AbortError") return; // user cancelled — don't download
    }
  }
  downloadBlob(blob, filename);
}

export function isVideoSupported(): boolean {
  if (typeof MediaRecorder === "undefined") return false;
  const c = document.createElement("canvas");
  if (typeof (c as any).captureStream !== "function") return false;
  return pickRecordingMime() !== null;
}
