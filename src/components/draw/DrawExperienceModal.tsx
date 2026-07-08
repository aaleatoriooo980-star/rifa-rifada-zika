import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  X,
  Volume2,
  VolumeX,
  Share2,
  Download,
  Presentation,
  MessageCircle,
  Instagram,
  Ticket,
  Video,
  Loader2,
  CheckCircle2,
  Facebook,
  Link,
} from "lucide-react";
import { tick, suspenseStart, suspenseStop, victory, setMuted, isMuted } from "@/lib/sound";
import { nodeToPng, downloadDataUrl, shareOnWhatsApp, shareOnInstagram } from "@/lib/share";
import { ShareResultCard } from "./ShareResultCard";
import { formatDateTime } from "@/lib/format";
import type { Draw, DrawVideo, Rifa, RifaNumber } from "@/lib/types";
import { toast } from "sonner";
import {
  renderDrawVideo,
  generateResultPng,
  downloadBlob,
  shareOrDownload,
  isVideoSupported,
  isIOSSafari,
  type DrawVideoData,
} from "@/lib/canvasVideoRenderer";
import { useRifas } from "@/context/RifasContext";

type Stage = "prepare" | "count3" | "count2" | "count1" | "spin" | "winner";
type VideoState = "idle" | "rendering" | "done" | "failed";

interface Props {
  open: boolean;
  onClose: () => void;
  rifa: Rifa;
  soldNumbers: RifaNumber[];
  runDraw: () => Draw | null;
  nextRifaUrl?: string;
  presentation?: boolean;
  onTogglePresentation?: () => void;
}

export function DrawExperienceModal({
  open,
  onClose,
  rifa,
  soldNumbers,
  runDraw,
  nextRifaUrl,
  presentation,
  onTogglePresentation,
}: Props) {
  const { saveDrawVideo } = useRifas();
  const [stage, setStage] = useState<Stage>("prepare");
  const [reelValue, setReelValue] = useState<number>(0);
  const [draw, setDraw] = useState<Draw | null>(null);
  const [muted, setMutedLocal] = useState(isMuted());

  // Video / image generation state
  const [videoState, setVideoState] = useState<VideoState>("idle");
  const [videoPct, setVideoPct] = useState(0);
  const [videoLabel, setVideoLabel] = useState("");
  const videoBlob = useRef<Blob | null>(null);
  const videoFilename = useRef<string>("");
  const videoFormat = useRef<"mp4" | "webm" | "png">("mp4");
  const canGenVideo = isVideoSupported(); // True on iOS Safari (14.5+) and modern Chrome/Android/Desktop

  const shareRef = useRef<HTMLDivElement>(null);

  const soldList = useMemo(() => soldNumbers.map((n) => n.number), [soldNumbers]);

  useEffect(() => {
    if (!open) return;
    setStage("prepare");
    setDraw(null);
    setReelValue(soldList[0] ?? 0);
    setVideoState("idle");
    setVideoPct(0);
    videoBlob.current = null;
    videoFilename.current = "";
    videoFormat.current = "mp4";

    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => { setStage("count3"); tick(); }, 900));
    timers.push(setTimeout(() => { setStage("count2"); tick(); }, 1900));
    timers.push(setTimeout(() => { setStage("count1"); tick(); }, 2900));
    timers.push(setTimeout(() => {
      setStage("spin");
      suspenseStart();
      const d = runDraw();
      if (!d) {
        suspenseStop();
        toast.error("Sem números vendidos para sortear.");
        onClose();
        return;
      }
      setDraw(d);

      // ── Start rendering in parallel ────────────────────────────────────────
      const videoData: DrawVideoData = {
        rifaTitle: rifa.title,
        rifaImage: rifa.image,
        prize: rifa.prize,
        drawDate: formatDateTime(d.drawnAt),
        participantNumbers: soldList,
        winnerNumber: d.winnerNumber,
        winnerName: d.winnerName ?? "Vencedor",
      };

      if (canGenVideo) {
        setVideoState("rendering");
        setVideoPct(0);
        setVideoLabel("Preparando…");
        renderDrawVideo(videoData, (pct, label) => {
          setVideoPct(pct);
          setVideoLabel(label);
        })
          .then((result) => {
            if (!result) {
              // Video generation failed or returned null (e.g. strict Safari error) -> fallback to PNG
              fallbackToPng(videoData, d);
              return;
            }
            videoBlob.current = result.blob;
            videoFilename.current = result.filename;
            videoFormat.current = result.format as "mp4" | "webm" | "png";
            setVideoState("done");
            setVideoPct(100);
            const videoMeta: DrawVideo = {
              id: `v-${Date.now()}`,
              rifaId: rifa.id,
              drawId: d.id,
              filename: result.filename,
              sizeBytes: result.blob.size,
              createdAt: new Date().toISOString(),
              format: result.format === "png" ? "png" : "mp4",
            };
            saveDrawVideo(rifa.id, videoMeta);
            const label = result.format === "mp4" ? "Vídeo gerado com sucesso! 🎬" : "Arquivo gerado com sucesso!";
            toast.success(label);
          })
          .catch(() => {
            fallbackToPng(videoData, d);
          });
      } else {
        fallbackToPng(videoData, d);
      }

      // ── Spin animation ────────────────────────────────────────────────────
      const duration = 5000;
      const start = Date.now();
      let raf = 0;
      const spin = () => {
        const elapsed = Date.now() - start;
        const t = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        if (t < 1) {
          const idx = Math.floor(Math.random() * soldList.length);
          setReelValue(soldList[idx] ?? 0);
          const nextDelay = 40 + eased * 260;
          raf = window.setTimeout(spin, nextDelay);
        } else {
          setReelValue(d.winnerNumber);
          suspenseStop();
          setStage("winner");
          victory();
          confetti({
            particleCount: 220,
            spread: 100,
            origin: { y: 0.6 },
            colors: ["#10b981", "#f59e0b", "#3b82f6", "#ef4444"],
          });
          setTimeout(
            () =>
              confetti({
                particleCount: 120,
                spread: 120,
                startVelocity: 45,
                origin: { y: 0.5 },
              }),
            600,
          );
        }
      };
      spin();
      timers.push(raf as unknown as ReturnType<typeof setTimeout>);
    }, 3900));

    return () => {
      timers.forEach((t) => clearTimeout(t));
      suspenseStop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const fallbackToPng = (videoData: DrawVideoData, d: Draw) => {
    setVideoState("rendering");
    setVideoPct(20);
    setVideoLabel("Gerando imagem do resultado…");
    generateResultPng(videoData)
      .then((result) => {
        videoBlob.current = result.blob;
        videoFilename.current = result.filename;
        videoFormat.current = "png";
        setVideoState("done");
        setVideoPct(100);
        const videoMeta: DrawVideo = {
          id: `v-${Date.now()}`,
          rifaId: rifa.id,
          drawId: d.id,
          filename: result.filename,
          sizeBytes: result.blob.size,
          createdAt: new Date().toISOString(),
          format: "png",
        };
        saveDrawVideo(rifa.id, videoMeta);
        toast.success("Imagem do sorteio gerada! 📸");
      })
      .catch(() => {
        setVideoState("failed");
        toast.error("Não foi possível gerar a imagem ou o vídeo.");
      });
  };

  const toggleMute = () => {
    const v = !muted;
    setMuted(v);
    setMutedLocal(v);
    if (v) suspenseStop();
  };

  const handleDownloadVideo = async () => {
    if (!videoBlob.current) return;
    const title = `🎉 Resultado: ${rifa.title}`;
    await shareOrDownload(videoBlob.current, videoFilename.current, title);
  };

  const handleDownloadImage = async () => {
    if (!shareRef.current || !draw) return;
    try {
      const url = await nodeToPng(shareRef.current);
      const resp = await fetch(url);
      const blob = await resp.blob();
      const filename = `rifa-${rifa.id}-resultado.png`;
      await shareOrDownload(blob, filename, `🎉 Resultado: ${rifa.title}`);
    } catch {
      toast.error("Não foi possível gerar a imagem.");
    }
  };

  const handleWhats = async () => {
    if (!draw) return;
    // On mobile with video/image ready: use native share
    if (videoBlob.current) {
      await shareOrDownload(
        videoBlob.current,
        videoFilename.current,
        `🎉 Resultado: ${rifa.title}`,
      );
      return;
    }
    // Fallback: open WhatsApp with text
    let imgUrl: string | undefined;
    try {
      if (shareRef.current) imgUrl = await nodeToPng(shareRef.current);
    } catch {}
    const text = `🎉 Resultado da campanha "${rifa.title}"!\nNúmero vencedor: ${String(draw.winnerNumber).padStart(3, "0")}\nGanhador: ${draw.winnerName ?? "—"}`;
    await shareOnWhatsApp(text, imgUrl);
  };

  const handleInsta = async () => {
    if (videoBlob.current) {
      await shareOrDownload(videoBlob.current, videoFilename.current, `🎉 ${rifa.title}`);
      return;
    }
    if (!shareRef.current) return;
    try {
      const url = await nodeToPng(shareRef.current);
      await shareOnInstagram(url);
    } catch {
      toast.error("Falha ao gerar imagem.");
    }
  };

  const handleFacebook = () => {
    const url = encodeURIComponent(window.location.origin);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin);
    toast.success("Link copiado!");
  };

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="draw-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex flex-col bg-[oklch(0.12_0.02_160/0.96)] text-white backdrop-blur-sm overflow-y-auto"
      >
        {/* Top bar */}
        <div className="flex items-center justify-between p-4 sm:p-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
              <Ticket className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-widest opacity-70">
                CampanhaFácil
              </div>
              <div className="truncate font-display text-lg font-bold">{rifa.title}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className="text-white hover:bg-white/10"
              aria-label={muted ? "Ativar som" : "Desativar som"}
            >
              {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
            {onTogglePresentation && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onTogglePresentation}
                className="text-white hover:bg-white/10"
                aria-label="Modo apresentação"
                title="Modo apresentação"
              >
                <Presentation className="h-5 w-5" />
              </Button>
            )}
            {stage === "winner" && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>

        {/* Stage */}
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 text-center">
          <AnimatePresence mode="wait">
            {stage === "prepare" && (
              <motion.div
                key="prepare"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="font-display text-3xl font-bold sm:text-4xl"
              >
                Preparando sorteio…
              </motion.div>
            )}
            {(stage === "count3" || stage === "count2" || stage === "count1") && (
              <motion.div
                key={stage}
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.6, opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="font-display font-black tabular-nums"
                style={{ fontSize: presentation ? "min(50vw,28rem)" : "min(40vw,20rem)" }}
              >
                {stage === "count3" ? 3 : stage === "count2" ? 2 : 1}
              </motion.div>
            )}
            {stage === "spin" && (
              <motion.div
                key="spin"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-6 w-full"
              >
                <div className="text-sm uppercase tracking-widest opacity-70 sm:text-base">
                  Escolhendo o número vencedor…
                </div>
                <motion.div
                  key={reelValue}
                  initial={{ scale: 0.9, opacity: 0.6, filter: "blur(6px)" }}
                  animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                  transition={{ duration: 0.12 }}
                  className="flex items-center justify-center rounded-3xl bg-white/10 px-8 py-6 font-display font-black tabular-nums shadow-2xl backdrop-blur max-w-full"
                  style={{ fontSize: presentation ? "min(35vw,22rem)" : "min(25vw,16rem)" }}
                >
                  {String(reelValue).padStart(3, "0")}
                </motion.div>
              </motion.div>
            )}
            {stage === "winner" && draw && (
              <motion.div
                key="winner"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="flex w-full max-w-2xl flex-col items-center gap-6"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 text-yellow-900 shadow-2xl">
                  <Trophy className="h-10 w-10" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.3em] opacity-80 sm:text-sm">
                    Parabéns!
                  </div>
                  <div className="mt-1 font-display text-4xl font-black sm:text-5xl px-4 break-words max-w-full">
                    {draw.winnerName ?? "Vencedor"}
                  </div>
                </div>
                <div className="rounded-3xl bg-white/10 px-10 py-6 backdrop-blur max-w-full">
                  <div className="text-xs uppercase tracking-widest opacity-70">
                    Número vencedor
                  </div>
                  <div
                    className="font-display font-black tabular-nums leading-none"
                    style={{ fontSize: presentation ? "min(30vw,18rem)" : "min(20vw,12rem)" }}
                  >
                    {String(draw.winnerNumber).padStart(3, "0")}
                  </div>
                </div>
                <div className="grid gap-1 text-center text-sm opacity-90 px-4">
                  <div>🏆 {rifa.prize}</div>
                  <div>Sorteado em {formatDateTime(draw.drawnAt)}</div>
                </div>

                {/* ── Video generation status ──────────────────────────── */}
                {canGenVideo && !presentation && (
                  <div className="w-full max-w-md px-4">
                    {videoState === "rendering" && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl bg-white/10 p-4 space-y-2"
                      >
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          <span>{videoLabel || "Gerando vídeo do sorteio…"}</span>
                        </div>
                        <Progress value={videoPct} className="h-2 bg-white/20" />
                        <div className="text-xs opacity-60 text-right">{videoPct}%</div>
                      </motion.div>
                    )}
                    {videoState === "done" && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-2xl bg-emerald-500/20 border border-emerald-500/40 p-4 flex items-center gap-3"
                      >
                        <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                        <span className="text-sm font-medium text-emerald-200">
                          Vídeo gerado com sucesso!
                        </span>
                      </motion.div>
                    )}
                    {videoState === "failed" && (
                      <div className="rounded-2xl bg-white/5 border border-white/10 p-3 text-xs opacity-60 text-center">
                        Vídeo indisponível neste dispositivo. Baixe a imagem do resultado.
                      </div>
                    )}
                  </div>
                )}

                {!presentation && (
                  <div className="mt-2 flex flex-col sm:flex-row sm:flex-wrap justify-center gap-2 w-full max-w-md px-4">
                    {/* Primary: Download video/image button */}
                    {videoState === "done" && (
                      <Button
                        onClick={handleDownloadVideo}
                        className="w-full sm:w-auto bg-gradient-to-r from-violet-500 to-indigo-600 text-white hover:opacity-90"
                      >
                        {videoFormat.current === "png" ? (
                          <><Download className="mr-1 h-4 w-4" /> Baixar / Compartilhar Imagem</>
                        ) : (
                          <><Video className="mr-1 h-4 w-4" /> Baixar / Compartilhar Vídeo MP4</>
                        )}
                      </Button>
                    )}
                    {(videoState === "failed" || !canGenVideo) && (
                      <Button
                        onClick={handleDownloadImage}
                        variant="outline"
                        className="w-full sm:w-auto border-white/30 bg-white/5 text-white hover:bg-white/10"
                      >
                        <Download className="mr-1 h-4 w-4" /> Baixar Imagem
                      </Button>
                    )}
                    {videoState === "rendering" && (
                      <Button
                        disabled
                        className="w-full sm:w-auto bg-white/10 text-white/50 cursor-not-allowed"
                      >
                        <Loader2 className="mr-1 h-4 w-4 animate-spin" /> Gerando vídeo…
                      </Button>
                    )}
                    {/* Share buttons */}
                    <Button
                      onClick={handleWhats}
                      className="w-full sm:w-auto bg-emerald-500 text-white hover:bg-emerald-500/90"
                    >
                      <MessageCircle className="mr-1 h-4 w-4" /> WhatsApp
                    </Button>
                    <Button
                      onClick={handleInsta}
                      variant="outline"
                      className="w-full sm:w-auto border-white/30 bg-white/5 text-white hover:bg-white/10"
                    >
                      <Instagram className="mr-1 h-4 w-4" /> Instagram
                    </Button>
                    <Button
                      onClick={handleFacebook}
                      variant="outline"
                      className="w-full sm:w-auto border-white/30 bg-white/5 text-white hover:bg-white/10"
                    >
                      <Facebook className="mr-1 h-4 w-4" /> Facebook
                    </Button>
                    <Button
                      onClick={handleCopyLink}
                      variant="outline"
                      className="w-full sm:w-auto border-white/30 bg-white/5 text-white hover:bg-white/10"
                    >
                      <Link className="mr-1 h-4 w-4" /> Copiar Link
                    </Button>
                    <Button
                      onClick={onClose}
                      variant="outline"
                      className="w-full sm:w-auto border-white/30 bg-white/5 text-white hover:bg-white/10"
                    >
                      <Share2 className="mr-1 h-4 w-4" /> Fechar
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {presentation && (
          <div className="pb-6 text-center text-xs uppercase tracking-widest opacity-70">
            Modo apresentação · pressione Esc para sair
          </div>
        )}

        {/* Off-screen shareable card */}
        {draw && (
          <div
            style={{
              position: "fixed",
              left: -99999,
              top: 0,
              pointerEvents: "none",
              opacity: 0,
            }}
            aria-hidden
          >
            <ShareResultCard
              ref={shareRef}
              rifa={rifa}
              winnerNumber={draw.winnerNumber}
              winnerName={draw.winnerName}
              drawnAt={draw.drawnAt}
              nextRifaUrl={nextRifaUrl}
            />
          </div>
        )}
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}
