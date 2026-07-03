import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useRifas } from "@/context/RifasContext";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { formatDateTime } from "@/lib/format";
import { useCountdown } from "@/lib/useCountdown";
import { Trophy, Sparkles, Presentation, Video, StopCircle, Circle } from "lucide-react";
import { DrawExperienceModal } from "@/components/draw/DrawExperienceModal";
import {
  startScreenRecording,
  downloadBlob,
  type Recorder,
} from "@/lib/screenRecorder";
import { canDraw, eligibleDrawNumbers, isRifaClosed } from "@/lib/rifaStatus";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/sorteios")({
  head: () => ({ meta: [{ title: "Sorteios — Admin" }] }),
  component: Sorteios,
});

function CountdownLine({ target }: { target?: string }) {
  const c = useCountdown(target);
  if (!target) return <span className="text-muted-foreground">Sem data definida</span>;
  if (!c.ready) return <span className="text-muted-foreground">—</span>;
  if (c.expired) return <span className="text-muted-foreground">Rifa Encerrada</span>;
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

function Sorteios() {
  const { rifas, numbers, orders, draws, drawRifa } = useRifas();
  const { users } = useAuth();
  const [openRifa, setOpenRifa] = useState<string | null>(null);
  const [presentation, setPresentation] = useState(false);
  const [recording, setRecording] = useState(false);
  const [converting, setConverting] = useState(false);
  const recorderRef = useRef<Recorder | null>(null);

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

  const startRecording = async () => {
    try {
      const rec = await startScreenRecording();
      recorderRef.current = rec;
      setRecording(true);
      toast.success(
        rec.willConvert
          ? "Gravação iniciada (será convertida para MP4 ao finalizar)."
          : "Gravação iniciada em MP4.",
      );
    } catch (e: any) {
      toast.error(e?.message ?? "Falha ao iniciar gravação.");
    }
  };

  const stopRecording = async () => {
    const rec = recorderRef.current;
    if (!rec) return;
    try {
      const result = await rec.stop({
        onConverting: () => {
          setConverting(true);
          toast.loading("Convertendo para MP4…", { id: "mp4-convert" });
        },
      });
      toast.dismiss("mp4-convert");
      downloadBlob(result.blob, result.filename);
      toast.success("Gravação finalizada — download iniciado.");
    } catch (e: any) {
      toast.dismiss("mp4-convert");
      toast.error(e?.message ?? "Falha ao finalizar gravação.");
    } finally {
      recorderRef.current = null;
      setRecording(false);
      setConverting(false);
    }
  };

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

  return (
    <div className="space-y-6">
      {recording && (
        <div className="fixed right-4 top-4 z-[9999] flex items-center gap-2 rounded-full bg-destructive px-3 py-1.5 text-xs font-bold text-destructive-foreground shadow-elevated">
          <Circle className="h-2.5 w-2.5 animate-pulse fill-current" />
          REC {converting && "· convertendo…"}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Sorteios</h1>
          <p className="text-sm text-muted-foreground">
            Realize sorteios com uma experiência cinematográfica para gravar e compartilhar.
          </p>
        </div>
        {!recording ? (
          <Button onClick={startRecording} variant="outline">
            <Video className="mr-1 h-4 w-4" /> Iniciar Gravação
          </Button>
        ) : (
          <Button onClick={stopRecording} variant="destructive" disabled={converting}>
            <StopCircle className="mr-1 h-4 w-4" />
            {converting ? "Convertendo…" : "Parar Gravação"}
          </Button>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {visible.map((r) => {
          const eligible = eligibleDrawNumbers(numbers, r.id, orders);
          const draw = draws.find((d) => d.rifaId === r.id);
          const closed = isRifaClosed(r);
          const validation = canDraw(r, eligible);
          return (
            <Card key={r.id} className="hover-elevate overflow-hidden p-0 shadow-soft">
              <div className="flex flex-col gap-4 p-4 sm:flex-row">
                <div className="w-full shrink-0 sm:w-40">
                  <AspectRatio ratio={4 / 3} className="overflow-hidden rounded-lg bg-muted">
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
                ) : (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => handleOpenDraw(r.id, false)}
                        disabled={!validation.ok}
                        className="flex-1 bg-gradient-primary text-primary-foreground"
                      >
                        <Sparkles className="mr-1 h-4 w-4" />
                        Realizar Sorteio
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleOpenDraw(r.id, true)}
                        disabled={!validation.ok}
                      >
                        <Presentation className="mr-1 h-4 w-4" /> Apresentação
                      </Button>
                    </div>
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
          onClose={() => setOpenRifa(null)}
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
    </div>
  );
}
