import { Link } from "@tanstack/react-router";
import type { Rifa } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatBRL } from "@/lib/format";
import { ArrowRight, Ticket } from "lucide-react";

export function RifaCard({ rifa, sold }: { rifa: Rifa; sold: number }) {
  const pct = Math.round((sold / rifa.totalNumbers) * 100);
  const available = rifa.totalNumbers - sold;
  return (
    <Card className="group overflow-hidden border-border/60 bg-card p-0 shadow-soft transition-all hover:-translate-y-1 hover:shadow-elevated">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={rifa.image}
          alt={rifa.prize}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3">
          {rifa.status === "ativa" && (
            <Badge className="bg-success text-success-foreground border-0">
              Ativa
            </Badge>
          )}
          {rifa.status === "encerrada" && (
            <Badge variant="secondary">Encerrada</Badge>
          )}
          {rifa.status === "cancelada" && (
            <Badge variant="destructive">Cancelada</Badge>
          )}
        </div>
        <div className="absolute right-3 top-3 rounded-full bg-card/95 px-3 py-1 text-xs font-semibold shadow-soft">
          {formatBRL(rifa.pricePerNumber)} / nº
        </div>
      </div>
      <CardContent className="space-y-4 p-5">
        <div>
          <h3 className="font-display text-lg font-bold leading-tight">
            {rifa.title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
            🏆 {rifa.prize}
          </p>
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

        <Button
          asChild
          className="w-full bg-gradient-primary text-primary-foreground shadow-soft hover:opacity-90"
          disabled={rifa.status !== "ativa"}
        >
          <Link to="/rifa/$id" params={{ id: rifa.id }}>
            <Ticket className="mr-1 h-4 w-4" /> Ver Rifa
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
