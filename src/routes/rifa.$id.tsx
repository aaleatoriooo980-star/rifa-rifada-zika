import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import confetti from "canvas-confetti";
import { useRifas } from "@/context/RifasContext";
import { useAuth } from "@/context/AuthContext";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { NumbersGrid } from "@/components/rifa/NumbersGrid";
import { PixModal } from "@/components/rifa/PixModal";
import { CountdownTimer } from "@/components/rifa/CountdownTimer";
import { ProgressBlock } from "@/components/rifa/ProgressBlock";
import { RifaStats } from "@/components/rifa/RifaStats";
import { QuickBuyBar } from "@/components/rifa/QuickBuyBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatBRL } from "@/lib/format";
import { ArrowLeft, Share2, Trophy } from "lucide-react";
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
  const [flashing, setFlashing] = useState<number[]>([]);

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
  const buyers = new Set(
    numbers.filter((n) => n.status === "vendido" && n.userId).map((n) => n.userId),
  ).size;
  const raised = sold * rifa.pricePerNumber;
  const winnerName = rifa.winnerUserId
    ? users.find((u) => u.id === rifa.winnerUserId)?.name
    : undefined;

  const toggle = (n: number) => {
    const num = numbers.find((x) => x.number === n);
    if (!num || num.status === "vendido") return;
    setSelected((s) => (s.includes(n) ? s.filter((x) => x !== n) : [...s, n]));
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
    const bought = [...selected];
    setPixOpen(false);
    setSelected([]);
    setOrderId(null);
    setFlashing(bought);
    setTimeout(() => setFlashing([]), 1600);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.7 },
      colors: ["#10b981", "#34d399", "#065f46"],
    });
    toast.success("Pagamento confirmado! 🎉 Boa sorte!");
  };

  const shareRifa = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const text = `Concorra a ${rifa.prize} na rifa "${rifa.title}"! ${url}`;
    if ((navigator as any).share) {
      try {
        await (navigator as any).share({ title: rifa.title, text, url });
        return;
      } catch {}
    }
    await navigator.clipboard.writeText(text);
    toast.success("Link copiado para compartilhar!");
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
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={shareRifa}
                  className="absolute right-4 top-4 shadow-soft"
                >
                  <Share2 className="mr-1 h-4 w-4" /> Compartilhar
                </Button>
              </div>
              <CardContent className="space-y-3 p-6">
                <h1 className="font-display text-3xl font-bold">{rifa.title}</h1>
                <p className="text-muted-foreground">{rifa.description}</p>
                <div className="pt-1 text-sm">
                  <span className="text-muted-foreground">Valor por número: </span>
                  <span className="font-display text-xl font-bold text-primary">
                    {formatBRL(rifa.pricePerNumber)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {rifa.status === "ativa" && <CountdownTimer target={rifa.drawDate} />}
            <ProgressBlock sold={sold} total={rifa.totalNumbers} />
            <RifaStats
              buyers={buyers}
              sold={sold}
              raised={raised}
              drawDate={rifa.drawDate}
              prizesCount={1}
            />

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
                    <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <Legend color="bg-success/40" label="Disponível" />
                      <Legend color="bg-warning/50" label="Aguardando" />
                      <Legend color="bg-destructive/30" label="Vendido" />
                    </div>
                  </div>
                </div>

                {rifa.status === "ativa" && (
                  <QuickBuyBar
                    numbers={numbers}
                    selected={selected}
                    onChange={setSelected}
                    currentUserId={user?.id}
                  />
                )}

                <NumbersGrid
                  numbers={numbers}
                  selected={selected}
                  onToggle={toggle}
                  currentUserId={user?.id}
                  flashing={flashing}
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

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <span className={`inline-block h-3 w-3 rounded ${color}`} />
      {label}
    </div>
  );
}
