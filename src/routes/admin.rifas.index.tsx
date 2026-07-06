import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useRifas } from "@/context/RifasContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DataTable, type Column } from "@/components/common/DataTable";
import { EditRifaModal } from "@/components/admin/EditRifaModal";
import { BuyersSearch } from "@/components/admin/BuyersSearch";
import { formatBRL, formatDateTime } from "@/lib/format";
import { Edit, Plus, Users, Lock, X, Share2, Archive, ArchiveRestore } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import type { Rifa } from "@/lib/types";

export const Route = createFileRoute("/admin/rifas/")({
  head: () => ({ meta: [{ title: "Rifas — Admin" }] }),
  component: AdminRifas,
});

type Filter = "ativas" | "encerradas" | "arquivadas";

function AdminRifas() {
  const {
    rifas,
    numbers,
    closeRifa,
    cancelRifa,
    archiveRifa,
    unarchiveRifa,
  } = useRifas();
  const [filter, setFilter] = useState<Filter>("ativas");
  const [buyersOf, setBuyersOf] = useState<string | null>(null);
  const [editRifa, setEditRifa] = useState<Rifa | null>(null);
  const [confirm, setConfirm] = useState<
    { kind: "close" | "cancel" | "archive" | "unarchive"; id: string; title: string } | null
  >(null);

  const filtered = useMemo(() => {
    if (filter === "arquivadas") return rifas.filter((r) => r.archived);
    if (filter === "encerradas")
      return rifas.filter((r) => !r.archived && (r.status === "encerrada" || r.status === "cancelada"));
    return rifas.filter((r) => !r.archived && r.status === "ativa");
  }, [rifas, filter]);

  const shareRifa = async (id: string, title: string) => {
    const url = `${window.location.origin}/rifa/${id}`;
    if ((navigator as any).share) {
      try {
        await (navigator as any).share({ title, url });
        return;
      } catch {}
    }
    await navigator.clipboard.writeText(url);
    toast.success("Link da rifa copiado!");
  };

  const columns: Column<Rifa>[] = [
    {
      key: "title",
      header: "Título",
      sortable: true,
      accessor: (r) => r.title,
      cell: (r) => <span className="font-medium">{r.title}</span>,
    },
    {
      key: "prize",
      header: "Prêmio",
      sortable: true,
      accessor: (r) => r.prize,
      cell: (r) => <span className="text-muted-foreground">{r.prize}</span>,
    },
    {
      key: "price",
      header: "Valor",
      sortable: true,
      accessor: (r) => r.pricePerNumber,
      cell: (r) => formatBRL(r.pricePerNumber),
    },
    {
      key: "sold",
      header: "Vendidos",
      sortable: true,
      accessor: (r) =>
        numbers.filter((n) => n.rifaId === r.id && n.status === "vendido").length,
      cell: (r) =>
        numbers.filter((n) => n.rifaId === r.id && n.status === "vendido").length,
    },
    {
      key: "draw",
      header: "Sorteio",
      sortable: true,
      accessor: (r) => r.drawDate ?? "",
      cell: (r) => (
        <span className="whitespace-nowrap text-xs text-muted-foreground">
          {formatDateTime(r.drawDate)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      accessor: (r) => r.status,
      cell: (r) => (
        <>
          {r.status === "ativa" && (
            <Badge className="bg-success text-success-foreground">Ativa</Badge>
          )}
          {r.status === "encerrada" && <Badge variant="secondary">Encerrada</Badge>}
          {r.status === "cancelada" && <Badge variant="destructive">Cancelada</Badge>}
          {r.archived && (
            <Badge variant="outline" className="ml-1">
              Arquivada
            </Badge>
          )}
        </>
      ),
    },
    {
      key: "actions",
      header: "Ações",
      className: "text-right",
      cell: (r) => (
        <div className="flex justify-end gap-1">
          <Button size="sm" variant="ghost" onClick={() => setEditRifa(r)} title="Editar">
            <Edit className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setBuyersOf(r.id)} title="Compradores">
            <Users className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => shareRifa(r.id, r.title)} title="Compartilhar">
            <Share2 className="h-4 w-4" />
          </Button>
          {r.status === "ativa" && !r.archived && (
            <>
              <Button
                size="sm"
                variant="ghost"
                title="Encerrar"
                onClick={() => setConfirm({ kind: "close", id: r.id, title: r.title })}
              >
                <Lock className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                title="Cancelar"
                onClick={() => setConfirm({ kind: "cancel", id: r.id, title: r.title })}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
          {r.status !== "ativa" && !r.archived && (
            <Button
              size="sm"
              variant="ghost"
              title="Arquivar"
              onClick={() => setConfirm({ kind: "archive", id: r.id, title: r.title })}
            >
              <Archive className="h-4 w-4" />
            </Button>
          )}
          {r.archived && (
            <Button
              size="sm"
              variant="ghost"
              title="Desarquivar"
              onClick={() => setConfirm({ kind: "unarchive", id: r.id, title: r.title })}
            >
              <ArchiveRestore className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Gerenciar Rifas</h1>
          <p className="text-sm text-muted-foreground">
            {rifas.length} rifa(s) cadastrada(s).
          </p>
        </div>
        <Button asChild className="bg-gradient-primary text-primary-foreground w-full sm:w-auto">
          <Link to="/admin/rifas/nova">
            <Plus className="mr-1 h-4 w-4" /> Nova rifa
          </Link>
        </Button>
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="ativas">Ativas</TabsTrigger>
          <TabsTrigger value="encerradas">Encerradas</TabsTrigger>
          <TabsTrigger value="arquivadas">Arquivadas</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="shadow-soft">
        <CardContent className="p-4">
          <DataTable
            data={filtered}
            columns={columns}
            rowKey={(r) => r.id}
            searchable={(r) => `${r.title} ${r.prize}`}
            searchPlaceholder="Pesquisar rifa..."
            pageSize={10}
            empty="Nenhuma rifa nesta categoria."
          />
        </CardContent>
      </Card>

      <Dialog open={!!buyersOf} onOpenChange={(o) => !o && setBuyersOf(null)}>
        <DialogContent className="w-[95vw] sm:max-w-lg rounded-xl">
          <DialogHeader>
            <DialogTitle>Compradores</DialogTitle>
            <DialogDescription>
              Pesquise por nome ou telefone e veja os números adquiridos.
            </DialogDescription>
          </DialogHeader>
          {buyersOf && <BuyersSearch rifaId={buyersOf} />}
        </DialogContent>
      </Dialog>

      <EditRifaModal rifa={editRifa} onClose={() => setEditRifa(null)} />

      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={
          confirm?.kind === "close"
            ? `Encerrar "${confirm.title}"?`
            : confirm?.kind === "cancel"
              ? `Cancelar "${confirm.title}"?`
              : confirm?.kind === "archive"
                ? `Arquivar "${confirm.title}"?`
                : `Desarquivar "${confirm?.title}"?`
        }
        description={
          confirm?.kind === "close"
            ? "A rifa deixará de aceitar novas compras. Você poderá realizar o sorteio."
            : confirm?.kind === "cancel"
              ? "A rifa será marcada como cancelada."
              : confirm?.kind === "archive"
                ? "A rifa deixará de aparecer nas listas principais, mas não será excluída."
                : "A rifa voltará a aparecer nas listas principais."
        }
        destructive={confirm?.kind === "cancel"}
        confirmLabel={
          confirm?.kind === "close"
            ? "Encerrar"
            : confirm?.kind === "cancel"
              ? "Cancelar rifa"
              : confirm?.kind === "archive"
                ? "Arquivar"
                : "Desarquivar"
        }
        onConfirm={() => {
          if (!confirm) return;
          if (confirm.kind === "close") {
            closeRifa(confirm.id);
            toast.success("Rifa encerrada");
          } else if (confirm.kind === "cancel") {
            cancelRifa(confirm.id);
            toast.success("Rifa cancelada");
          } else if (confirm.kind === "archive") {
            archiveRifa(confirm.id);
            toast.success("Rifa arquivada");
          } else {
            unarchiveRifa(confirm.id);
            toast.success("Rifa desarquivada");
          }
          setConfirm(null);
        }}
      />
    </div>
  );
}
