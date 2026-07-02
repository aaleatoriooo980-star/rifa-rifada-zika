import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Trophy, CalendarClock, Gift } from "lucide-react";
import { formatDateTime } from "@/lib/format";
import type { Draw, Rifa } from "@/lib/types";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  rifa: Rifa;
  draw?: Draw;
}

export function ResultModal({ open, onOpenChange, rifa, draw }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{rifa.title}</DialogTitle>
          <DialogDescription>
            {draw ? "Resultado oficial do sorteio." : "Detalhes do sorteio desta rifa."}
          </DialogDescription>
        </DialogHeader>

        {draw ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-xl border border-success/40 bg-success/5 p-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success">
                <Trophy className="h-7 w-7" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Número vencedor
                </div>
                <div className="font-display text-3xl font-bold text-success">
                  {String(draw.winnerNumber).padStart(3, "0")}
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Ganhador: </span>
                  <span className="font-medium">{draw.winnerName ?? "—"}</span>
                </div>
              </div>
            </div>

            <div className="grid gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Prêmio:</span>
                <span className="font-medium">{rifa.prize}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Sorteado em:</span>
                <span className="font-medium">{formatDateTime(draw.drawnAt)}</span>
              </div>
            </div>

            <Badge className="w-full justify-center bg-success text-success-foreground py-2">
              Sorteio Finalizado
            </Badge>
          </div>
        ) : (
          <div className="rounded-lg border bg-muted/30 p-6 text-center">
            <p className="text-sm text-muted-foreground">Sorteio ainda não realizado.</p>
            {rifa.drawDate && (
              <p className="mt-2 text-sm">
                Previsto para{" "}
                <span className="font-medium">{formatDateTime(rifa.drawDate)}</span>
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
