import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useRifas } from "@/context/RifasContext";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/format";
import { Trophy, Sparkles, Presentation } from "lucide-react";
import { DrawExperienceModal } from "@/components/draw/DrawExperienceModal";

export const Route = createFileRoute("/admin/sorteios")({
  head: () => ({ meta: [{ title: "Sorteios — Admin" }] }),
  component: Sorteios,
});

function Sorteios() {
  const { rifas, numbers, draws, drawRifa } = useRifas();
  const { users } = useAuth();
  const [openRifa, setOpenRifa] = useState<string | null>(null);
  const [presentation, setPresentation] = useState(false);

  const activeRifa = rifas.find((r) => r.id === openRifa);
  const soldForOpen = activeRifa
    ? numbers.filter((n) => n.rifaId === activeRifa.id && n.status === "vendido")
    : [];
  const nextRifa = rifas.find((r) => r.status === "ativa" && r.id !== openRifa);
  const nextUrl =
    typeof window !== "undefined" && nextRifa
      ? `${window.location.origin}/rifa/${nextRifa.id}`
      : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Sorteios</h1>
        <p className="text-sm text-muted-foreground">
          Realize sorteios com uma experiência cinematográfica para gravar e compartilhar.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {rifas.map((r) => {
          const sold = numbers.filter(
            (n) => n.rifaId === r.id && n.status === "vendido",
          ).length;
          const draw = draws.find((d) => d.rifaId === r.id);
          return (
            <Card key={r.id} className="hover-elevate overflow-hidden p-0 shadow-soft">
              <div className="flex gap-4 p-4">
                <img
                  src={r.image}
                  alt={r.prize}
                  loading="lazy"
                  className="h-24 w-32 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate font-display font-semibold">{r.title}</h3>
                    {r.status === "encerrada" && (
                      <Badge variant="secondary">Encerrada</Badge>
                    )}
                  </div>
                  <p className="truncate text-sm text-muted-foreground">{r.prize}</p>
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
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => {
                        setPresentation(false);
                        setOpenRifa(r.id);
                      }}
                      disabled={sold === 0}
                      className="flex-1 bg-gradient-primary text-primary-foreground"
                    >
                      <Sparkles className="mr-1 h-4 w-4" />
                      Realizar Sorteio
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setPresentation(true);
                        setOpenRifa(r.id);
                      }}
                      disabled={sold === 0}
                    >
                      <Presentation className="mr-1 h-4 w-4" /> Apresentação
                    </Button>
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
