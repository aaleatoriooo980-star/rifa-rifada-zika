import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useRifas } from "@/context/RifasContext";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { formatDateTime } from "@/lib/format";
import { useCountdown } from "@/lib/useCountdown";
import {
  Trophy,
  Sparkles,
  Presentation,
  Video,
  Download,
  Lock,
  Film,
} from "lucide-react";
import { DrawExperienceModal } from "@/components/draw/DrawExperienceModal";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { canDraw, eligibleDrawNumbers, isRifaClosed } from "@/lib/rifaStatus";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  renderDrawVideo,
  downloadBlob,
  isVideoSupported,
  type DrawVideoData,
} from "@/lib/canvasVideoRenderer";
import type { DrawVideo } from "@/lib/types";

export const Route = createFileRoute("/admin/sorteios")({
  head: () => ({ meta: [{ title: "Sorteios — Admin" }] }),
  component: Sorteios,
});

function CountdownLine({ target }: { target?: string }) {
  const c = useCountdown(target);
  if (!target) return <span className="text-muted-foreground">Sem data definida</span>;
  if (!c.ready) return <span className="text-muted-foreground">—</span>;
  if (c.expired) return <span className="text-muted-foreground">Campanha Encerrada</span>;
  const tone =
    c.totalMs < 60 * 60 * 1000
      ? "text-destructive"
      : c.totalMs < 24 * 60 * 60 * 1000
        ? "text-warning-foreground"
        : "text-primary";
  return (
    <span className={cn("font-semibold tabular-nums", tone)}>
      Sorteio em {c.days} dia(s) · {String(c.hours).padStart(2, "0")}h{" "}
      {String(c.minutes).padStart(2, "0")}m {String(c.seconds).padStart(2, "0")}s
    </span>
  );
}

function VideoHistorySection({
  videos,
  rifa,
  draw,
  soldList,
  saveDrawVideo,
}: {
  videos: DrawVideo[];
  rifa: import("@/lib/types").Rifa;
  draw: import("@/lib/types").Draw;
  soldList: number[];
  saveDrawVideo: (rifaId: string, v: DrawVideo) => void;
}) {
  const [regenerating, setRegenerating] = useState(false);

  const handleRegenerate = async () => {
    if (!isVideoSupported()) {
      toast.error("Seu dispositivo não suporta geração de vídeo. Use Chrome no Desktop ou Android.");
      return;
    }
    setRegenerating(true);
    toast.loading("Gerando vídeo…", { id: "regen" });
    try {
      const videoData: DrawVideoData = {
        rifaTitle: rifa.title,
        rifaImage: rifa.image,
        prize: rifa.prize,
        drawDate: formatDateTime(draw.drawnAt),
        participantNumbers: soldList,
        winnerNumber: draw.winnerNumber,
        winnerName: draw.winnerName ?? "Vencedor",
      };
      const result = await renderDrawVideo(videoData, (pct, label) => {
        toast.loading(`${label} ${pct}%`, { id: "regen" });
      });
      toast.dismiss("regen");
      if (!result) {
        toast.error("Não foi possível gerar o vídeo neste dispositivo.");
        return;
      }
      downloadBlob(result.blob, result.filename);
      const videoMeta: DrawVideo = {
        id: `v-${Date.now()}`,
        rifaId: rifa.id,
        drawId: draw.id,
        filename: result.filename,
        sizeBytes: result.blob.size,
        createdAt: new Date().toISOString(),
        format: result.format === "png" ? "png" : "mp4",
      };
      saveDrawVideo(rifa.id, videoMeta);
      toast.success("Vídeo gerado e download iniciado!");
    } catch (e: any) {
      toast.dismiss("regen");
      toast.error(e?.message ?? "Falha ao gerar vídeo.");
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <div className="mt-4 border-t pt-4 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Film className="h-4 w-4" />
          Vídeos do Sorteio
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleRegenerate}
          disabled={regenerating}
          className="text-xs"
        >
          <Video className="mr-1 h-3.5 w-3.5" />
          {regenerating ? "Gerando…" : "Gerar / Baixar Vídeo"}
        </Button>
      </div>

      {videos.length === 0 ? (
        <p className="text-xs text-muted-foreground">Nenhum vídeo gerado ainda.</p>
      ) : (
        <div className="space-y-2">
          {videos.map((v) => (
            <div
              key={v.id}
              className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-xs"
            >
              <div className="min-w-0">
                <div className="font-medium truncate">{v.filename}</div>
                <div className="text-muted-foreground">
                  {formatDateTime(v.createdAt)} · {(v.sizeBytes / 1024 / 1024).toFixed(1)} MB ·{" "}
                  <span className="uppercase">{v.format}</span>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="ml-2 shrink-0"
                onClick={handleRegenerate}
                disabled={regenerating}
                title="Gerar novamente e baixar"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Sorteios() {
  const { rifas, numbers, orders, draws, drawRifa, closeRifa, saveDrawVideo } = useRifas();
  const { users } = useAuth();
  const [openRifa, setOpenRifa] = useState<string | null>(null);
  const [confirmCloseId, setConfirmCloseId] = useState<string | null>(null);
  const [presentation, setPresentation] = useState(false);
  const [, setTick] = useState(0);

  // Force re-render every second so the 'Realizar Sorteio' button becomes active exactly when target time passes
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const visible = rifas.filter((r) => !r.archived);
  const activeRifa = visible.find((r) => r.id === openRifa);
  const soldForOpen = activeRifa
    ? numbers.filter((n) => n.rifaId === activeRifa.id && n.status === "vendido")
    : [];
  const nextRifa = visible.find((r) => r.status === "ativa" && r.id !== openRifa);
  const nextUrl =
    typeof window !== "undefined" && nextRifa
      ? `${window.location.origin}/rifa/${nextRifa.id}`
      : undefined;

  const handleOpenDraw = (rifaId: string, presentationMode: boolean) => {
    const rifa = visible.find((r) => r.id === rifaId);
    if (!rifa) return;
    const eligible = eligibleDrawNumbers(numbers, rifaId, orders);
    const v = canDraw(rifa, eligible);
    if (!v.ok) {
      toast.error(v.reason ?? "Não é possível realizar o sorteio.");
      return;
    }
    setPresentation(presentationMode);
    setOpenRifa(rifaId);
  };

  const handleCloseDraw = () => {
    setOpenRifa(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Sorteios</h1>
          <p className="text-sm text-muted-foreground">
            Realize sorteios e baixe o vídeo MP4 para compartilhar nas redes sociais.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {visible.map((r) => {
          const eligible = eligibleDrawNumbers(numbers, r.id, orders);
          const draw = draws.find((d) => d.rifaId === r.id);
          const closed = isRifaClosed(r);
          const validation = canDraw(r, eligible);
          const soldNums = numbers
            .filter((n) => n.rifaId === r.id && n.status === "vendido")
            .map((n) => n.number);

          return (
            <Card key={r.id} className="hover-elevate overflow-hidden p-0 shadow-soft">
              <div className="flex flex-col gap-4 p-4 sm:flex-row">
                <div className="w-full shrink-0 sm:w-40">
                  <AspectRatio ratio={1} className="overflow-hidden rounded-lg bg-muted">
                    <img
                      src={r.image}
                      alt={r.prize}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-contain"
                    />
                  </AspectRatio>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate font-display font-semibold">{r.title}</h3>
                    {closed && <Badge variant="secondary">Encerrada</Badge>}
                  </div>
                  <p className="truncate text-sm text-muted-foreground">{r.prize}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {eligible.length} números elegíveis · sorteio {formatDateTime(r.drawDate)}
                  </p>
                  <div className="mt-1 text-xs">
                    <CountdownLine target={r.drawDate} />
                  </div>
                </div>
              </div>

              <div className="border-t bg-muted/20 p-4">
                {draw ? (
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/15 text-success">
                        <Trophy className="h-6 w-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs text-muted-foreground">Número vencedor</div>
                        <div className="font-display text-xl font-bold">
                          {String(draw.winnerNumber).padStart(3, "0")} —{" "}
                          {draw.winnerName ?? "—"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Sorteado em {formatDateTime(draw.drawnAt)}
                        </div>
                      </div>
                    </div>

                    {/* Video history section */}
                    <VideoHistorySection
                      videos={r.drawVideos ?? []}
                      rifa={r}
                      draw={draw}
                      soldList={soldNums}
                      saveDrawVideo={saveDrawVideo}
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        onClick={() => handleOpenDraw(r.id, false)}
                        disabled={!validation.ok}
                        className="w-full bg-gradient-primary text-primary-foreground"
                      >
                        <Sparkles className="mr-1 h-4 w-4" />
                        Realizar Sorteio
                      </Button>
                    </div>
                    {r.status === "ativa" && (
                      <Button
                        variant="secondary"
                        onClick={() => setConfirmCloseId(r.id)}
                        className="w-full mt-2"
                      >
                        <Lock className="mr-1 h-3.5 w-3.5" /> Encerrar Campanha
                      </Button>
                    )}
                    {!validation.ok && (
                      <p className="text-xs text-muted-foreground">{validation.reason}</p>
                    )}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {activeRifa && (
        <DrawExperienceModal
          open={!!openRifa}
          onClose={handleCloseDraw}
          rifa={activeRifa}
          soldNumbers={soldForOpen}
          runDraw={() =>
            drawRifa(
              activeRifa.id,
              users.map((u) => ({ id: u.id, name: u.name })),
            )
          }
          nextRifaUrl={nextUrl}
          presentation={presentation}
          onTogglePresentation={() => setPresentation((p) => !p)}
        />
      )}

      <ConfirmDialog
        open={!!confirmCloseId}
        onOpenChange={(o) => !o && setConfirmCloseId(null)}
        title="Encerrar Campanha?"
        description="Tem certeza que deseja encerrar esta campanha? Após o encerramento não será mais possível realizar compras."
        confirmLabel="Confirmar Encerramento"
        cancelLabel="Cancelar"
        onConfirm={() => {
          if (confirmCloseId) {
            closeRifa(confirmCloseId);
            toast.success("Campanha encerrada com sucesso.");
          }
          setConfirmCloseId(null);
        }}
        destructive
      />
    </div>
  );
}
