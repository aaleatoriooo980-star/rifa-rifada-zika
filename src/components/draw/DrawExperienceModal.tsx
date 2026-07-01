import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import { tick, suspenseStart, suspenseStop, victory, setMuted, isMuted } from "@/lib/sound";
import { nodeToPng, downloadDataUrl, shareOnWhatsApp, shareOnInstagram } from "@/lib/share";
import { ShareResultCard } from "./ShareResultCard";
import { formatDateTime } from "@/lib/format";
import type { Draw, Rifa, RifaNumber } from "@/lib/types";
import { toast } from "sonner";

type Stage = "prepare" | "count3" | "count2" | "count1" | "spin" | "winner";

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
  const [stage, setStage] = useState<Stage>("prepare");
  const [reelValue, setReelValue] = useState<number>(0);
  const [draw, setDraw] = useState<Draw | null>(null);
  const [muted, setMutedLocal] = useState(isMuted());
  const shareRef = useRef<HTMLDivElement>(null);

  const soldList = useMemo(() => soldNumbers.map((n) => n.number), [soldNumbers]);

  useEffect(() => {
    if (!open) return;
    setStage("prepare");
    setDraw(null);
    setReelValue(soldList[0] ?? 0);

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

  const toggleMute = () => {
    const v = !muted;
    setMuted(v);
    setMutedLocal(v);
    if (v) suspenseStop();
  };

  const handleGenerate = async () => {
    if (!shareRef.current || !draw) return;
    try {
      const url = await nodeToPng(shareRef.current);
      downloadDataUrl(url, `rifa-${rifa.id}-resultado.png`);
      toast.success("Imagem gerada!");
    } catch {
      toast.error("Não foi possível gerar a imagem.");
    }
  };

  const handleWhats = async () => {
    if (!draw) return;
    let url: string | undefined;
    try {
      if (shareRef.current) url = await nodeToPng(shareRef.current);
    } catch {}
    const text = `🎉 Resultado da rifa "${rifa.title}"!\nNúmero vencedor: ${String(draw.winnerNumber).padStart(3, "0")}\nGanhador: ${draw.winnerName ?? "—"}`;
    await shareOnWhatsApp(text, url);
  };

  const handleInsta = async () => {
    if (!shareRef.current) return;
    try {
      const url = await nodeToPng(shareRef.current);
      await shareOnInstagram(url);
    } catch {
      toast.error("Falha ao gerar imagem.");
    }
  };

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="draw-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex flex-col bg-[oklch(0.12_0.02_160/0.96)] text-white backdrop-blur-sm"
      >
        {/* Top bar */}
        <div className="flex items-center justify-between p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
              <Ticket className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-widest opacity-70">
                RifasOnline
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
        <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
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
                className="flex flex-col items-center gap-6"
              >
                <div className="text-sm uppercase tracking-widest opacity-70 sm:text-base">
                  Escolhendo o número vencedor…
                </div>
                <motion.div
                  key={reelValue}
                  initial={{ scale: 0.9, opacity: 0.6, filter: "blur(6px)" }}
                  animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                  transition={{ duration: 0.12 }}
                  className="flex items-center justify-center rounded-3xl bg-white/10 px-10 py-6 font-display font-black tabular-nums shadow-2xl backdrop-blur"
                  style={{ fontSize: presentation ? "min(40vw,22rem)" : "min(30vw,16rem)" }}
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
                  <div className="mt-1 font-display text-4xl font-black sm:text-5xl">
                    {draw.winnerName ?? "Vencedor"}
                  </div>
                </div>
                <div className="rounded-3xl bg-white/10 px-10 py-6 backdrop-blur">
                  <div className="text-xs uppercase tracking-widest opacity-70">
                    Número vencedor
                  </div>
                  <div
                    className="font-display font-black tabular-nums leading-none"
                    style={{ fontSize: presentation ? "min(35vw,18rem)" : "min(25vw,12rem)" }}
                  >
                    {String(draw.winnerNumber).padStart(3, "0")}
                  </div>
                </div>
                <div className="grid gap-1 text-center text-sm opacity-90">
                  <div>🏆 {rifa.prize}</div>
                  <div>Sorteado em {formatDateTime(draw.drawnAt)}</div>
                </div>

                {!presentation && (
                  <div className="mt-2 flex flex-wrap justify-center gap-2">
                    <Button
                      onClick={handleWhats}
                      className="bg-emerald-500 text-white hover:bg-emerald-500/90"
                    >
                      <MessageCircle className="mr-1 h-4 w-4" /> WhatsApp
                    </Button>
                    <Button
                      onClick={handleInsta}
                      variant="outline"
                      className="border-white/30 bg-white/5 text-white hover:bg-white/10"
                    >
                      <Instagram className="mr-1 h-4 w-4" /> Instagram
                    </Button>
                    <Button
                      onClick={handleGenerate}
                      variant="outline"
                      className="border-white/30 bg-white/5 text-white hover:bg-white/10"
                    >
                      <Download className="mr-1 h-4 w-4" /> Baixar imagem
                    </Button>
                    <Button
                      onClick={onClose}
                      variant="outline"
                      className="border-white/30 bg-white/5 text-white hover:bg-white/10"
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
