import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { useAuth } from "@/context/AuthContext";
import { useRifas } from "@/context/RifasContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { ResultModal } from "@/components/rifa/ResultModal";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { formatDateTime } from "@/lib/format";
import { useCountdown } from "@/lib/useCountdown";
import { Trophy, Ticket, Clock, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Rifa } from "@/lib/types";

export const Route = createFileRoute("/minhas-rifas")({
  head: () => ({ meta: [{ title: "Minhas Campanhas — CampanhaFácil" }] }),
  component: () => (
    <ProtectedRoute role="cliente">
      <MinhasRifas />
    </ProtectedRoute>
  ),
});

function CountBadge({ target }: { target?: string }) {
  const c = useCountdown(target);
  if (!target) return null;
  if (c.expired)
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" /> Campanha Encerrada
      </span>
    );
  const tone =
    c.totalMs < 60 * 60 * 1000
      ? "bg-destructive/10 text-destructive"
      : c.totalMs < 24 * 60 * 60 * 1000
        ? "bg-warning/15 text-warning-foreground"
        : "bg-primary/10 text-primary";
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold tabular-nums", tone)}>
      <Clock className="h-3 w-3" />
      {String(c.days).padStart(2, "0")}d {String(c.hours).padStart(2, "0")}h{" "}
      {String(c.minutes).padStart(2, "0")}m {String(c.seconds).padStart(2, "0")}s
    </span>
  );
}

function MinhasRifas() {
  const { user } = useAuth();
  const { orders, rifas, draws } = useRifas();
  const [statusFilter, setStatusFilter] = useState("all");
  const [rifaFilter, setRifaFilter] = useState("all");
  const [detail, setDetail] = useState<Rifa | null>(null);
  const [result, setResult] = useState<Rifa | null>(null);

  const myOrders = useMemo(
    () =>
      orders
        .filter((o) => o.userId === user?.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [orders, user],
  );

  // Aggregate: one line per rifa
  const myRifas = useMemo(() => {
    const map = new Map<string, { rifa: Rifa; qty: number; totalPago: number }>();
    for (const o of myOrders) {
      const rifa = rifas.find((r) => r.id === o.rifaId);
      if (!rifa) continue;
      const prev = map.get(rifa.id) ?? { rifa, qty: 0, totalPago: 0 };
      prev.qty += o.numbers.length;
      prev.totalPago += o.status === "pago" ? o.total : 0;
      map.set(rifa.id, prev);
    }
    return Array.from(map.values());
  }, [myOrders, rifas]);

  const filtered = useMemo(() => {
    let list = myRifas;
    if (statusFilter === "abertas") list = list.filter((x) => x.rifa.status === "ativa");
    if (statusFilter === "encerradas")
      list = list.filter((x) => x.rifa.status !== "ativa");
    if (rifaFilter !== "all") list = list.filter((x) => x.rifa.id === rifaFilter);
    return list;
  }, [myRifas, statusFilter, rifaFilter]);

  const statusOptions = [
    { value: "all", label: "Todas" },
    { value: "abertas", label: "Campanhas Ativas" },
    { value: "encerradas", label: "Campanhas Encerradas" },
  ];
  const rifaOptions = [
    { value: "all", label: "Todas minhas campanhas" },
    ...myRifas.map((x) => ({ value: x.rifa.id, label: x.rifa.title })),
  ];

  const detailOrders = detail
    ? myOrders.filter((o) => o.rifaId === detail.id)
    : [];
  const detailNumbers = detailOrders.flatMap((o) => o.numbers).sort((a, b) => a - b);

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-bold">Minhas Campanhas</h1>
        <p className="mt-1 text-muted-foreground">
          Acompanhe seus pedidos e resultados.
        </p>

        {myRifas.length > 0 && (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <SearchableSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={statusOptions}
              placeholder="Filtrar por status"
            />
            <SearchableSelect
              value={rifaFilter}
              onChange={setRifaFilter}
              options={rifaOptions}
              placeholder="Minhas Campanhas"
              searchPlaceholder="Pesquisar campanha..."
            />
          </div>
        )}

        {myRifas.length === 0 ? (
          <Card className="mt-8 shadow-soft">
            <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
              <Ticket className="h-12 w-12 text-muted-foreground" />
              <h2 className="font-display text-xl font-semibold">
                Você ainda não comprou números
              </h2>
              <p className="max-w-md text-muted-foreground">
                Explore as campanhas ativas e escolha seus números da sorte.
              </p>
              <Button asChild className="bg-gradient-primary text-primary-foreground">
                <Link to="/">Ver campanhas</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-6 space-y-3">
            {filtered.map(({ rifa, qty }) => {
              const isWinner =
                rifa.winnerNumber != null &&
                myOrders
                  .filter((o) => o.rifaId === rifa.id)
                  .some((o) => o.numbers.includes(rifa.winnerNumber!));
              return (
                <Card key={rifa.id} className="shadow-soft overflow-hidden p-0">
                  <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                    <img
                      src={rifa.image}
                      alt={rifa.prize}
                      loading="lazy"
                      className="w-full sm:w-28 h-40 sm:h-20 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate font-display font-semibold">
                          {rifa.title}
                        </h3>
                        {rifa.status === "ativa" ? (
                          <Badge className="bg-success text-success-foreground">Ativa</Badge>
                        ) : rifa.status === "encerrada" ? (
                          <Badge variant="secondary">Encerrada</Badge>
                        ) : (
                          <Badge variant="destructive">Cancelada</Badge>
                        )}
                        {isWinner && (
                          <Badge className="gap-1 bg-warning text-warning-foreground">
                            <Trophy className="h-3 w-3" /> Vencedor!
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Sorteio: {formatDateTime(rifa.drawDate)} · {qty} número(s) comprado(s)
                      </div>
                      <div className="pt-1">
                        <CountBadge target={rifa.drawDate} />
                      </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                      {rifa.status !== "ativa" && (
                        <Button variant="outline" onClick={() => setResult(rifa)} className="flex-1 sm:flex-initial justify-center">
                          <Trophy className="mr-1 h-4 w-4" /> Resultado
                        </Button>
                      )}
                      <Button onClick={() => setDetail(rifa)} className={cn("justify-center", rifa.status !== "ativa" ? "flex-1 sm:flex-initial" : "w-full sm:w-auto")}>
                        <Eye className="mr-1 h-4 w-4" /> Ver
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {filtered.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nenhuma campanha nesse filtro.
              </p>
            )}
          </div>
        )}
      </div>

      <Sheet open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{detail?.title}</SheetTitle>
            <SheetDescription>
              {detailNumbers.length} número(s) desta campanha.
            </SheetDescription>
          </SheetHeader>
          {detail && (
            <div className="mt-4 space-y-4">
              <img
                src={detail.image}
                alt={detail.prize}
                className="h-40 w-full rounded-lg object-cover"
              />
              <div className="text-sm">
                <div className="text-muted-foreground">Sorteio</div>
                <div className="font-medium">{formatDateTime(detail.drawDate)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Seus números</div>
                <div className="flex flex-wrap gap-1">
                  {detailNumbers.map((n) => (
                    <Badge
                      key={n}
                      variant={detail.winnerNumber === n ? "default" : "secondary"}
                      className={cn(
                        "font-mono",
                        detail.winnerNumber === n && "bg-success text-success-foreground",
                      )}
                    >
                      {String(n).padStart(2, "0")}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button asChild className="w-full">
                <Link to="/rifa/$id" params={{ id: detail.id }}>
                  Abrir página da campanha
                </Link>
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {result && (
        <ResultModal
          open={!!result}
          onOpenChange={(o) => !o && setResult(null)}
          rifa={result}
          draw={draws.find((d) => d.rifaId === result.id)}
        />
      )}
    </div>
  );
}
