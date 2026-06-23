import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useRifas } from "@/context/RifasContext";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/format";
import { Trophy, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/sorteios")({
  head: () => ({ meta: [{ title: "Sorteios — Admin" }] }),
  component: Sorteios,
});

function Sorteios() {
  const { rifas, numbers, draws, drawRifa } = useRifas();
  const { users } = useAuth();
  const [drawingId, setDrawingId] = useState<string | null>(null);

  const handleDraw = (rifaId: string) => {
    setDrawingId(rifaId);
    setTimeout(() => {
      const d = drawRifa(
        rifaId,
        users.map((u) => ({ id: u.id, name: u.name })),
      );
      setDrawingId(null);
      if (!d) {
        toast.error("Esta rifa não possui números vendidos.");
        return;
      }
      toast.success(
        `Parabéns ao ganhador! Número ${String(d.winnerNumber).padStart(3, "0")} — ${d.winnerName ?? "Vencedor"}`,
      );
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Sorteios</h1>
        <p className="text-sm text-muted-foreground">
          Realize sorteios entre os números vendidos de cada rifa.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {rifas.map((r) => {
          const sold = numbers.filter(
            (n) => n.rifaId === r.id && n.status === "vendido",
          ).length;
          const draw = draws.find((d) => d.rifaId === r.id);
          return (
            <Card key={r.id} className="shadow-soft overflow-hidden p-0">
              <div className="flex gap-4 p-4">
                <img
                  src={r.image}
                  alt={r.prize}
                  loading="lazy"
                  className="h-24 w-32 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-semibold">{r.title}</h3>
                    {r.status === "encerrada" && (
                      <Badge variant="secondary">Encerrada</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{r.prize}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {sold} números vendidos
                  </p>
                </div>
              </div>

              <div className="border-t bg-muted/20 p-4">
                {draw ? (
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/15 text-success">
                      <Trophy className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground">
                        Número vencedor
                      </div>
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
                  <Button
                    onClick={() => handleDraw(r.id)}
                    disabled={sold === 0 || drawingId === r.id}
                    className="w-full bg-gradient-primary text-primary-foreground"
                  >
                    {drawingId === r.id ? (
                      <>
                        <Sparkles className="mr-1 h-4 w-4 animate-spin" />
                        Sorteando...
                      </>
                    ) : (
                      <>
                        <Trophy className="mr-1 h-4 w-4" />
                        Realizar Sorteio
                      </>
                    )}
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
