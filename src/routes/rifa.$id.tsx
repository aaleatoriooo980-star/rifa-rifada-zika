import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useRifas } from "@/context/RifasContext";
import { useAuth } from "@/context/AuthContext";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { NumbersGrid } from "@/components/rifa/NumbersGrid";
import { PixModal } from "@/components/rifa/PixModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatBRL, formatDate } from "@/lib/format";
import { ArrowLeft, Shuffle, X, Trophy } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/rifa/$id")({
  component: RifaDetail,
});

function RifaDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { rifas, getNumbersForRifa, reserveNumbers, confirmPayment } = useRifas();
  const { user, users } = useAuth();
  const rifa = rifas.find((r) => r.id === id);
  const [selected, setSelected] = useState<number[]>([]);
  const [pixOpen, setPixOpen] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const numbers = useMemo(
    () => (rifa ? getNumbersForRifa(rifa.id).sort((a, b) => a.number - b.number) : []),
    [rifa, getNumbersForRifa],
  );

  if (!rifa) {
    return (
      <div className="min-h-screen bg-background">
        <PublicHeader />
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <h1 className="font-display text-2xl font-bold">Rifa não encontrada</h1>
          <Link to="/" className="mt-4 inline-block text-primary hover:underline">
            Voltar para o início
          </Link>
        </div>
      </div>
    );
  }

  const sold = numbers.filter((n) => n.status === "vendido").length;
  const available = numbers.filter((n) => n.status === "disponivel");
  const winnerName = rifa.winnerUserId
    ? users.find((u) => u.id === rifa.winnerUserId)?.name
    : undefined;

  const toggle = (n: number) => {
    const num = numbers.find((x) => x.number === n);
    if (!num || num.status === "vendido") return;
    setSelected((s) => (s.includes(n) ? s.filter((x) => x !== n) : [...s, n]));
  };

  const random = (qty = 5) => {
    const pool = available.filter((a) => !selected.includes(a.number));
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    setSelected((s) => [...s, ...shuffled.slice(0, qty).map((n) => n.number)]);
  };

  const buy = () => {
    if (!user) {
      toast.info("Faça login para comprar");
      navigate({ to: "/login" });
      return;
    }
    if (user.role !== "cliente") {
      toast.error("Apenas clientes podem comprar.");
      return;
    }
    if (selected.length === 0) return;
    const order = reserveNumbers(rifa.id, selected, user.id);
    setOrderId(order.id);
    setPixOpen(true);
  };

  const onPaid = () => {
    if (orderId) confirmPayment(orderId);
    setPixOpen(false);
    setSelected([]);
    setOrderId(null);
    toast.success("Pagamento confirmado! 🎉");
    navigate({ to: "/minhas-rifas" });
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate({ to: "/" })}
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <Card className="overflow-hidden p-0 shadow-soft">
              <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                <img
                  src={rifa.image}
                  alt={rifa.prize}
                  className="h-full w-full object-cover"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  {rifa.status === "ativa" && (
                    <Badge className="bg-success text-success-foreground">Ativa</Badge>
                  )}
                  {rifa.status === "encerrada" && (
                    <Badge variant="secondary">Encerrada</Badge>
                  )}
                </div>
              </div>
              <CardContent className="space-y-3 p-6">
                <h1 className="font-display text-3xl font-bold">{rifa.title}</h1>
                <p className="text-muted-foreground">{rifa.description}</p>
                <div className="flex flex-wrap gap-4 pt-2 text-sm">
                  <Stat label="Valor por número" value={formatBRL(rifa.pricePerNumber)} />
                  <Stat label="Total" value={rifa.totalNumbers.toString()} />
                  <Stat label="Vendidos" value={sold.toString()} />
                  <Stat label="Sorteio" value={formatDate(rifa.drawDate)} />
                </div>
              </CardContent>
            </Card>

            {rifa.status === "encerrada" && rifa.winnerNumber && (
              <Card className="border-success/40 bg-success/5 shadow-soft">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success">
                    <Trophy className="h-7 w-7" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Número vencedor</div>
                    <div className="font-display text-2xl font-bold">
                      {String(rifa.winnerNumber).padStart(3, "0")}
                    </div>
                    <div className="text-sm">
                      Ganhador:{" "}
                      <span className="font-medium">{winnerName ?? "—"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="shadow-soft">
              <CardContent className="space-y-4 p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display text-lg font-bold">
                      Escolha seus números
                    </h2>
                    <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
                      <Legend color="bg-success/40" label="Disponível" />
                      <Legend color="bg-warning/50" label="Aguardando" />
                      <Legend color="bg-destructive/30" label="Vendido" />
                    </div>
                  </div>
                  {rifa.status === "ativa" && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => random(5)}>
                        <Shuffle className="mr-1 h-3.5 w-3.5" /> +5 aleatórios
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setSelected([])}>
                        <X className="mr-1 h-3.5 w-3.5" /> Limpar
                      </Button>
                    </div>
                  )}
                </div>
                <NumbersGrid
                  numbers={numbers}
                  selected={selected}
                  onToggle={toggle}
                  currentUserId={user?.id}
                />
              </CardContent>
            </Card>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <Card className="shadow-elevated">
              <CardContent className="space-y-4 p-6">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    Resumo
                  </div>
                  <div className="mt-1 font-display text-3xl font-bold text-primary">
                    {formatBRL(selected.length * rifa.pricePerNumber)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {selected.length} número(s) × {formatBRL(rifa.pricePerNumber)}
                  </div>
                </div>

                {selected.length > 0 && (
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <div className="mb-1 text-xs text-muted-foreground">
                      Seus números:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {selected
                        .sort((a, b) => a - b)
                        .map((n) => (
                          <Badge key={n} variant="secondary" className="font-mono">
                            {String(n).padStart(2, "0")}
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}

                <Button
                  size="lg"
                  className="w-full bg-gradient-primary text-primary-foreground shadow-soft"
                  disabled={selected.length === 0 || rifa.status !== "ativa"}
                  onClick={buy}
                >
                  Comprar Números
                </Button>
                {rifa.status !== "ativa" && (
                  <p className="text-center text-xs text-muted-foreground">
                    Esta rifa não está mais aceitando compras.
                  </p>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>

      <PixModal
        open={pixOpen}
        onClose={() => setPixOpen(false)}
        onConfirm={onPaid}
        numbers={selected}
        pricePerNumber={rifa.pricePerNumber}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/40 px-3 py-2">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <span className={`inline-block h-3 w-3 rounded ${color}`} />
      {label}
    </div>
  );
}
