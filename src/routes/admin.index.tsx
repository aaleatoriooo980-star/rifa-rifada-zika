import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useRifas } from "@/context/RifasContext";
import { useAuth } from "@/context/AuthContext";
import { StatCard } from "@/components/admin/StatCard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useCountdown } from "@/lib/useCountdown";
import { formatBRL, formatDate, formatDateTime } from "@/lib/format";
import {
  Ticket,
  CheckCircle2,
  XCircle,
  DollarSign,
  ShoppingBag,
  CalendarClock,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Dashboard — Admin" }] }),
  component: Dashboard,
});

function DrawCountdown({ target }: { target?: string }) {
  const c = useCountdown(target);
  if (!target) return <span className="text-muted-foreground">Sem data definida</span>;
  if (!c.ready) return <span className="text-muted-foreground">—</span>;
  if (c.expired) return <span className="text-muted-foreground text-destructive">Encerrada</span>;
  return (
    <span className="font-semibold tabular-nums text-primary text-xs">
      Sorteio em {c.days}d {String(c.hours).padStart(2, "0")}h {String(c.minutes).padStart(2, "0")}m {String(c.seconds).padStart(2, "0")}s
    </span>
  );
}

function Dashboard() {
  const { rifas, orders, numbers } = useRifas();
  const { users } = useAuth();
  const [rifaFilter, setRifaFilter] = useState<string>("all");
  const [detailOrder, setDetailOrder] = useState<any | null>(null);

  const visible = rifas.filter((r) => !r.archived);
  const totalRifas = visible.length;
  const ativas = visible.filter((r) => r.status === "ativa").length;
  const encerradas = visible.filter((r) => r.status === "encerrada").length;
  const arrecadado = orders
    .filter((o) => o.status === "pago")
    .reduce((s, o) => s + o.total, 0);

  const vendasPorRifa = visible.map((r) => ({
    name: r.title.split(" ").slice(0, 2).join(" "),
    vendidos: numbers.filter((n) => n.rifaId === r.id && n.status === "vendido").length,
  }));

  const arrecadacaoMensal = [
    { mes: "Jan", valor: 1200 },
    { mes: "Fev", valor: 2300 },
    { mes: "Mar", valor: 2800 },
    { mes: "Abr", valor: 3400 },
    { mes: "Mai", valor: 4100 },
    { mes: "Jun", valor: 4800 },
  ];

  const rifaOptions = useMemo(
    () => [
      { value: "all", label: "Todas as rifas" },
      ...visible.map((r) => ({ value: r.id, label: r.title })),
    ],
    [visible],
  );

  const latestOrders = useMemo(() => {
    const list = [...orders].sort((a, b) =>
      b.createdAt > a.createdAt ? 1 : -1,
    );
    return (rifaFilter === "all"
      ? list
      : list.filter((o) => o.rifaId === rifaFilter)
    ).slice(0, 8);
  }, [orders, rifaFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Olá, {users.find((u) => u.role === "admin")?.name}. Aqui está o resumo de hoje.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Ticket} label="Total de Rifas" value={totalRifas} tone="primary" />
        <StatCard icon={CheckCircle2} label="Rifas Ativas" value={ativas} tone="success" />
        <StatCard icon={XCircle} label="Rifas Encerradas" value={encerradas} tone="muted" />
        <StatCard
          icon={DollarSign}
          label="Total Arrecadado"
          value={formatBRL(arrecadado)}
          tone="primary"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-soft">
          <CardContent className="p-5">
            <h3 className="font-display font-semibold">Vendas por rifa</h3>
            <p className="mb-4 text-xs text-muted-foreground">
              Números vendidos por campanha
            </p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={vendasPorRifa}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="vendidos" fill="var(--primary)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-5">
            <h3 className="font-display font-semibold">Arrecadação mensal</h3>
            <p className="mb-4 text-xs text-muted-foreground">Últimos 6 meses (R$)</p>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={arrecadacaoMensal}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="mes" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="valor"
                  stroke="var(--primary)"
                  strokeWidth={3}
                  dot={{ fill: "var(--primary)", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-soft">
          <CardContent className="p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-primary" />
                <h3 className="font-display font-semibold">Últimas compras</h3>
              </div>
              <div className="w-full sm:w-64">
                <SearchableSelect
                  value={rifaFilter}
                  onChange={setRifaFilter}
                  options={rifaOptions}
                  placeholder="Filtrar por rifa"
                  searchPlaceholder="Pesquisar rifa..."
                />
              </div>
            </div>
            <div className="space-y-3">
              {latestOrders.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhuma compra.</p>
              )}
              {latestOrders.map((o) => {
                const buyer = users.find((u) => u.id === o.userId);
                const rifa = rifas.find((r) => r.id === o.rifaId);
                return (
                  <div
                    key={o.id}
                    className="rounded-lg border bg-muted/20 p-3"
                  >
                    {/* Mobile version card */}
                    <div className="flex sm:hidden flex-col gap-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-semibold text-sm">{buyer?.name ?? "Usuário"}</div>
                          <div className="text-xs text-muted-foreground">{buyer?.phone ?? "Sem telefone"}</div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge
                            variant={o.status === "pago" ? "default" : "secondary"}
                            className={o.status === "pago" ? "bg-success text-success-foreground" : ""}
                          >
                            {o.status}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] px-1 py-0 border-primary/20 bg-primary/5 text-primary">
                            {o.origin === "balcao" ? "🏪 Balcão" : "🌐 Online"}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-xs space-y-1 pt-1.5 border-t">
                        <div>Rifa: <span className="font-medium text-foreground">{rifa?.title}</span></div>
                        <div>Números: <span className="font-medium text-foreground">{o.numbers.length} números</span></div>
                        <div>Valor Pago: <span className="font-medium text-foreground">{formatBRL(o.total)}</span></div>
                        <div>Data: <span className="font-medium text-foreground">{formatDateTime(o.createdAt)}</span></div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-1.5"
                        onClick={() => setDetailOrder(o)}
                      >
                        Ver Detalhes
                      </Button>
                    </div>

                    {/* Desktop version row */}
                    <div className="hidden sm:flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium flex items-center gap-2">
                          <span>{buyer?.name ?? "Usuário"} {buyer?.phone ? `(${buyer.phone})` : ""}</span>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/20 bg-primary/5 text-primary">
                            {o.origin === "balcao" ? "🏪 Balcão" : "🌐 Online"}
                          </Badge>
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {rifa?.title} · {o.numbers.length} nº ·{" "}
                          {formatDateTime(o.createdAt)}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <div className="font-semibold text-sm">{formatBRL(o.total)}</div>
                          <Badge
                            variant={o.status === "pago" ? "default" : "secondary"}
                            className={o.status === "pago" ? "bg-success text-success-foreground" : ""}
                          >
                            {o.status}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDetailOrder(o)}
                        >
                          Detalhes
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-primary" />
              <h3 className="font-display font-semibold">Próximos sorteios</h3>
            </div>
            <div className="space-y-4">
              {visible
                .filter((r) => r.status === "ativa")
                .sort((a, b) => (a.drawDate ?? "").localeCompare(b.drawDate ?? ""))
                .slice(0, 6)
                .map((r) => {
                  const soldN = numbers.filter(
                    (n) => n.rifaId === r.id && n.status === "vendido",
                  ).length;
                  const pct = Math.round((soldN / r.totalNumbers) * 100);
                  const drawDateObj = r.drawDate ? new Date(r.drawDate) : null;
                  const drawTimeStr = drawDateObj
                    ? drawDateObj.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
                    : "";

                  return (
                    <div
                      key={r.id}
                      className="flex flex-col gap-3 rounded-lg border bg-muted/20 p-4"
                    >
                      <div className="flex gap-3 items-start">
                        <img
                          src={r.image}
                          alt=""
                          className="h-16 w-20 rounded object-cover shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="truncate text-sm font-semibold">{r.title}</h4>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            Sorteio: {formatDate(r.drawDate)} {drawTimeStr && `às ${drawTimeStr}`}
                          </div>
                          <div className="mt-1 flex items-center">
                            <DrawCountdown target={r.drawDate} />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{soldN} de {r.totalNumbers} vendidos</span>
                          <span className="font-semibold text-primary">{pct}%</span>
                        </div>
                        <Progress value={pct} className="h-1.5" />
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t mt-1">
                        <Button asChild variant="outline" size="sm" className="w-full sm:flex-1">
                          <Link to="/rifa/$id" params={{ id: r.id }}>
                            Ver Rifa
                          </Link>
                        </Button>
                        <Button asChild size="sm" className="w-full sm:flex-1 bg-gradient-primary text-primary-foreground">
                          <Link to="/admin/sorteios">
                            Realizar Sorteio
                          </Link>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              {visible.filter((r) => r.status === "ativa").length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nenhuma rifa ativa no momento.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!detailOrder} onOpenChange={(o) => !o && setDetailOrder(null)}>
        {detailOrder && (() => {
          const buyer = users.find((u) => u.id === detailOrder.userId);
          const rifa = rifas.find((r) => r.id === detailOrder.rifaId);
          return (
            <DialogContent className="w-[95vw] max-w-md rounded-xl">
              <DialogHeader>
                <DialogTitle>Detalhes da Compra</DialogTitle>
                <DialogDescription>
                  Dados completos do pedido e comprador.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5 rounded-lg border bg-muted/20 p-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Comprador</span>
                    <span className="font-medium text-foreground">{buyer?.name ?? "Usuário"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Telefone</span>
                    <span className="font-medium text-foreground">{buyer?.phone ?? "Sem telefone"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rifa</span>
                    <span className="font-medium text-foreground">{rifa?.title ?? "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Origem</span>
                    <span className="font-medium text-foreground">
                      {detailOrder.origin === "balcao" ? "🏪 Balcão" : "🌐 Online"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Forma de Pagamento</span>
                    <span className="font-medium uppercase text-foreground">
                      {detailOrder.paymentMethod || "PIX"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className={`font-semibold ${detailOrder.status === "pago" ? "text-success" : "text-warning"}`}>
                      {detailOrder.status === "pago" ? "Pago" : "Pendente"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Data da compra</span>
                    <span className="font-medium text-foreground">{formatDateTime(detailOrder.createdAt)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 mt-2 font-semibold">
                    <span className="text-muted-foreground">Valor</span>
                    <span className="text-primary">{formatBRL(detailOrder.total)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Números Adquiridos ({detailOrder.numbers.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto rounded-lg border p-3 bg-muted/10">
                    {detailOrder.numbers.map((n: number) => (
                      <Badge key={n} variant="secondary" className="font-mono">
                        {String(n).padStart(2, "0")}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>
          );
        })()}
      </Dialog>
    </div>
  );
}
