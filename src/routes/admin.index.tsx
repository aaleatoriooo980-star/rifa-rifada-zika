import { createFileRoute } from "@tanstack/react-router";
import { useRifas } from "@/context/RifasContext";
import { useAuth } from "@/context/AuthContext";
import { StatCard } from "@/components/admin/StatCard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatBRL, formatDate, formatDateTime } from "@/lib/format";
import {
  Ticket,
  CheckCircle2,
  XCircle,
  DollarSign,
  Users,
  Clock,
  CheckCheck,
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
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";


export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Dashboard — Admin" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { rifas, orders, numbers } = useRifas();
  const { users } = useAuth();

  const totalRifas = rifas.length;
  const ativas = rifas.filter((r) => r.status === "ativa").length;
  const encerradas = rifas.filter((r) => r.status === "encerrada").length;
  const arrecadado = orders
    .filter((o) => o.status === "pago")
    .reduce((s, o) => s + o.total, 0);
  const participantes = new Set(orders.map((o) => o.userId)).size;
  const pendentes = orders.filter((o) => o.status === "pendente").length;
  const aprovados = orders.filter((o) => o.status === "pago").length;

  const vendasPorRifa = rifas.map((r) => ({
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

  const participantesMes = [
    { mes: "Jan", users: 18 },
    { mes: "Fev", users: 34 },
    { mes: "Mar", users: 52 },
    { mes: "Abr", users: 71 },
    { mes: "Mai", users: 96 },
    { mes: "Jun", users: participantes + 120 },
  ];

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
        <StatCard icon={Users} label="Participantes" value={participantes} tone="primary" />
        <StatCard icon={Clock} label="Pag. Pendentes" value={pendentes} tone="warning" />
        <StatCard icon={CheckCheck} label="Pag. Aprovados" value={aprovados} tone="success" />
        <StatCard
          icon={Ticket}
          label="Números vendidos"
          value={numbers.filter((n) => n.status === "vendido").length}
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

        <Card className="shadow-soft lg:col-span-2">
          <CardContent className="p-5">
            <h3 className="font-display font-semibold">Novos participantes por mês</h3>
            <p className="mb-4 text-xs text-muted-foreground">Crescimento da base</p>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={participantesMes}>
                <defs>
                  <linearGradient id="cUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  fill="url(#cUsers)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-soft">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-primary" />
              <h3 className="font-display font-semibold">Últimas compras</h3>
            </div>
            <div className="space-y-3">
              {orders.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhuma compra ainda.</p>
              )}
              {[...orders]
                .sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1))
                .slice(0, 6)
                .map((o) => {
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
              {rifas
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
              {rifas.filter((r) => r.status === "ativa").length === 0 && (
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

