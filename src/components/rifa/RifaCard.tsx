import { Link } from "@tanstack/react-router";
import type { Rifa } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { formatBRL } from "@/lib/format";
import { ArrowRight, Ticket, Clock, Trophy } from "lucide-react";
import { useCountdown } from "@/lib/useCountdown";
import { isRifaClosed } from "@/lib/rifaStatus";
import { cn } from "@/lib/utils";

interface Props {
  rifa: Rifa;
  sold: number;
  onOpenResult?: (rifa: Rifa) => void;
}

export function RifaCard({ rifa, sold, onOpenResult }: Props) {
  const pct = Math.round((sold / rifa.totalNumbers) * 100);
  const available = rifa.totalNumbers - sold;
  const c = useCountdown(rifa.drawDate);

  const tone = c.expired
    ? "border-border/60 bg-muted/40 text-muted-foreground"
    : c.totalMs < 60 * 60 * 1000
      ? "border-destructive/40 bg-destructive/10 text-destructive"
      : c.totalMs < 24 * 60 * 60 * 1000
        ? "border-warning/50 bg-warning/15 text-warning-foreground"
        : "border-primary/30 bg-primary/5 text-primary";

  const isEncerrada = isRifaClosed(rifa);

  return (
    <Card className="group overflow-hidden border-border/60 bg-card p-0 shadow-soft transition-all hover:-translate-y-1 hover:shadow-elevated">
      <AspectRatio ratio={4 / 3} className="relative overflow-hidden bg-muted">
        <img
          src={rifa.image}
          alt={rifa.prize}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3">
          {!isEncerrada && rifa.status === "ativa" && (
            <Badge className="bg-success text-success-foreground border-0">Ativa</Badge>
          )}
          {isEncerrada && rifa.status !== "cancelada" && (
            <Badge variant="secondary">Encerrada</Badge>
          )}
          {rifa.status === "cancelada" && (
            <Badge variant="destructive">Cancelada</Badge>
          )}
        </div>
        <div className="absolute right-3 top-3 rounded-full bg-card/95 px-3 py-1 text-xs font-semibold shadow-soft">
          {formatBRL(rifa.pricePerNumber)} / nº
        </div>
      </AspectRatio>
      <CardContent className="space-y-4 p-5">
        <div>
          <h3 className="font-display text-lg font-bold leading-tight">{rifa.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
            🏆 {rifa.prize}
          </p>
        </div>

        <div
          className={cn(
            "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors",
            tone,
          )}
        >
          <Clock className="h-3.5 w-3.5 shrink-0" />
          {!c.ready ? (
            <span className="tabular-nums">--d --h --m --s</span>
          ) : c.expired ? (
            <span>Campanha Encerrada</span>
          ) : (
            <span className="tabular-nums">
              {String(c.days).padStart(2, "0")}d {String(c.hours).padStart(2, "0")}h{" "}
              {String(c.minutes).padStart(2, "0")}m {String(c.seconds).padStart(2, "0")}s
            </span>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              <span className="font-semibold text-foreground">{sold}</span> /{" "}
              {rifa.totalNumbers} vendidos
            </span>
            <span className="font-semibold text-primary">{pct}%</span>
          </div>
          <Progress value={pct} className="h-2" />
          <div className="text-xs text-muted-foreground">
            {available} números disponíveis
          </div>
        </div>

        {isEncerrada && onOpenResult ? (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onOpenResult(rifa)}
          >
            <Trophy className="mr-1 h-4 w-4" /> Ver Resultado
          </Button>
        ) : (
          <Button
            asChild
            className="w-full bg-gradient-primary text-primary-foreground shadow-soft hover:opacity-90"
          >
            <Link to="/rifa/$id" params={{ id: rifa.id }}>
              <Ticket className="mr-1 h-4 w-4" /> Ver Campanha
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
