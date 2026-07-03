export interface RecordingResult {
  blob: Blob;
  filename: string;
  mimeType: string;
  converted: boolean;
}

export interface Recorder {
  stop: (opts?: { onConverting?: () => void }) => Promise<RecordingResult>;
  cancel: () => void;
  mimeType: string;
  willConvert: boolean;
}

const MP4_CANDIDATES = [
  "video/mp4;codecs=h264,aac",
  "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
  "video/mp4",
];
const WEBM_CANDIDATES = [
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/webm",
];

function pickMimeType(): { mimeType: string; isMp4: boolean } {
  for (const m of MP4_CANDIDATES) {
    if (MediaRecorder.isTypeSupported(m)) return { mimeType: m, isMp4: true };
  }
  for (const m of WEBM_CANDIDATES) {
    if (MediaRecorder.isTypeSupported(m)) return { mimeType: m, isMp4: false };
  }
  return { mimeType: "", isMp4: false };
}

export async function startScreenRecording(): Promise<Recorder> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getDisplayMedia) {
    throw new Error("Seu navegador não suporta gravação de tela.");
  }
  if (typeof window === "undefined" || typeof MediaRecorder === "undefined") {
    throw new Error("Seu navegador não suporta gravação de mídia.");
  }

  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getDisplayMedia({
      video: { frameRate: 30 },
      audio: true,
    });
  } catch (err: any) {
    if (err?.name === "NotAllowedError") {
      throw new Error("Permissão de gravação negada.");
    }
    throw new Error("Não foi possível iniciar a captura de tela.");
  }

  const picked = pickMimeType();
  if (!picked.mimeType) {
    stream.getTracks().forEach((t) => t.stop());
    throw new Error("Seu navegador não suporta gravação de vídeo.");
  }

  const recorder = new MediaRecorder(stream, { mimeType: picked.mimeType });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };
  recorder.start(1000);

  const stopTracks = () => stream.getTracks().forEach((t) => t.stop());
  stream.getVideoTracks()[0]?.addEventListener("ended", () => {
    if (recorder.state !== "inactive") recorder.stop();
  });

  const willConvert = !picked.isMp4;

  return {
    mimeType: picked.mimeType,
    willConvert,
    stop: (opts) =>
      new Promise<RecordingResult>((resolve, reject) => {
        recorder.onstop = async () => {
          stopTracks();
          const raw = new Blob(chunks, { type: picked.mimeType });
          const ts = new Date().toISOString().replace(/[:.]/g, "-");
          if (picked.isMp4) {
            resolve({
              blob: raw,
              filename: `sorteio-${ts}.mp4`,
              mimeType: "video/mp4",
              converted: false,
            });
            return;
          }
          try {
            opts?.onConverting?.();
            const mp4 = await convertWebmToMp4(raw);
            resolve({
              blob: mp4,
              filename: `sorteio-${ts}.mp4`,
              mimeType: "video/mp4",
              converted: true,
            });
          } catch (err) {
            // Fallback: entregar webm renomeado se ffmpeg falhar
            reject(err);
          }
        };
        if (recorder.state !== "inactive") recorder.stop();
        else recorder.onstop?.(new Event("stop") as any);
      }),
    cancel: () => {
      if (recorder.state !== "inactive") recorder.stop();
      stopTracks();
    },
  };
}

async function convertWebmToMp4(input: Blob): Promise<Blob> {
  const { FFmpeg } = await import("@ffmpeg/ffmpeg");
  const { fetchFile, toBlobURL } = await import("@ffmpeg/util");
  const ffmpeg = new FFmpeg();
  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd";
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
  });
  await ffmpeg.writeFile("input.webm", await fetchFile(input));
  await ffmpeg.exec([
    "-i",
    "input.webm",
    "-c:v",
    "libx264",
    "-preset",
    "ultrafast",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "output.mp4",
  ]);
  const data = (await ffmpeg.readFile("output.mp4")) as Uint8Array;
  return new Blob([new Uint8Array(data)], { type: "video/mp4" });
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
