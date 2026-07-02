import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useRifas } from "@/context/RifasContext";
import { useAuth } from "@/context/AuthContext";
import { StatCard } from "@/components/admin/StatCard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SearchableSelect } from "@/components/common/SearchableSelect";
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

function Dashboard() {
  const { rifas, orders, numbers } = useRifas();
  const { users } = useAuth();
  const [rifaFilter, setRifaFilter] = useState<string>("all");

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
                    className="flex items-center justify-between gap-3 rounded-lg border bg-muted/20 p-3"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">
                        {buyer?.name ?? "Usuário"}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {rifa?.title} · {o.numbers.length} nº ·{" "}
                        {formatDateTime(o.createdAt)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatBRL(o.total)}</div>
                      <Badge
                        variant={o.status === "pago" ? "default" : "secondary"}
                        className={
                          o.status === "pago"
                            ? "bg-success text-success-foreground"
                            : ""
                        }
                      >
                        {o.status}
                      </Badge>
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
            <div className="space-y-3">
              {visible
                .filter((r) => r.status === "ativa")
                .sort((a, b) => (a.drawDate ?? "").localeCompare(b.drawDate ?? ""))
                .slice(0, 6)
                .map((r) => {
                  const soldN = numbers.filter(
                    (n) => n.rifaId === r.id && n.status === "vendido",
                  ).length;
                  return (
                    <div
                      key={r.id}
                      className="flex items-center gap-3 rounded-lg border bg-muted/20 p-3"
                    >
                      <img
                        src={r.image}
                        alt=""
                        className="h-12 w-16 rounded object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{r.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {soldN}/{r.totalNumbers} vendidos · sorteio{" "}
                          {formatDate(r.drawDate)}
                        </div>
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
    </div>
  );
}
