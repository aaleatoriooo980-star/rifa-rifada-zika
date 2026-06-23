import { createFileRoute, Link } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { useAuth } from "@/context/AuthContext";
import { useRifas } from "@/context/RifasContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatBRL, formatDateTime } from "@/lib/format";
import { Trophy, Ticket } from "lucide-react";

export const Route = createFileRoute("/minhas-rifas")({
  head: () => ({ meta: [{ title: "Minhas Rifas — RifasOnline" }] }),
  component: () => (
    <ProtectedRoute role="cliente">
      <MinhasRifas />
    </ProtectedRoute>
  ),
});

function MinhasRifas() {
  const { user } = useAuth();
  const { orders, rifas } = useRifas();
  const myOrders = orders
    .filter((o) => o.userId === user?.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-bold">Minhas Rifas</h1>
        <p className="mt-1 text-muted-foreground">
          Acompanhe seus pedidos e resultados.
        </p>

        {myOrders.length === 0 ? (
          <Card className="mt-8 shadow-soft">
            <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
              <Ticket className="h-12 w-12 text-muted-foreground" />
              <h2 className="font-display text-xl font-semibold">
                Você ainda não comprou números
              </h2>
              <p className="max-w-md text-muted-foreground">
                Explore as rifas ativas e escolha seus números da sorte.
              </p>
              <Button asChild className="bg-gradient-primary text-primary-foreground">
                <Link to="/">Ver rifas</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-8 space-y-4">
            {myOrders.map((o) => {
              const rifa = rifas.find((r) => r.id === o.rifaId)!;
              const isWinner =
                rifa?.winnerNumber !== undefined &&
                o.numbers.includes(rifa.winnerNumber);
              return (
                <Card key={o.id} className="shadow-soft overflow-hidden p-0">
                  <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                    <img
                      src={rifa.image}
                      alt={rifa.prize}
                      loading="lazy"
                      className="h-20 w-28 rounded-lg object-cover"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-semibold">{rifa.title}</h3>
                        {o.status === "pago" ? (
                          <Badge className="bg-success text-success-foreground">Pago</Badge>
                        ) : o.status === "pendente" ? (
                          <Badge variant="outline" className="border-warning/40 bg-warning/10">
                            Pendente
                          </Badge>
                        ) : (
                          <Badge variant="destructive">Cancelado</Badge>
                        )}
                        {isWinner && (
                          <Badge className="gap-1 bg-warning text-warning-foreground">
                            <Trophy className="h-3 w-3" /> Vencedor!
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDateTime(o.createdAt)} · {formatBRL(o.total)}
                      </div>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {o.numbers.map((n) => (
                          <Badge
                            key={n}
                            variant={
                              rifa.winnerNumber === n ? "default" : "secondary"
                            }
                            className="font-mono"
                          >
                            {String(n).padStart(2, "0")}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button variant="outline" asChild>
                      <Link to="/rifa/$id" params={{ id: rifa.id }}>Ver rifa</Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
