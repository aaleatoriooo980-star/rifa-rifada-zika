import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useRifas } from "@/context/RifasContext";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatBRL } from "@/lib/format";
import { Edit, Plus, Users, Lock, X, Share2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";


export const Route = createFileRoute("/admin/rifas/")({
  head: () => ({ meta: [{ title: "Rifas — Admin" }] }),
  component: AdminRifas,
});

function AdminRifas() {
  const { rifas, numbers, closeRifa, cancelRifa, getBuyersForRifa } = useRifas();
  const { users } = useAuth();
  const [buyersOf, setBuyersOf] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<
    { kind: "close" | "cancel"; id: string; title: string } | null
  >(null);

  const buyers = buyersOf ? getBuyersForRifa(buyersOf) : [];

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


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Gerenciar Rifas</h1>
          <p className="text-sm text-muted-foreground">
            {rifas.length} rifa(s) cadastrada(s).
          </p>
        </div>
        <Button asChild className="bg-gradient-primary text-primary-foreground">
          <Link to="/admin/rifas/nova">
            <Plus className="mr-1 h-4 w-4" /> Nova rifa
          </Link>
        </Button>
      </div>

      <Card className="shadow-soft">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Prêmio</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Vendidos</TableHead>
                  <TableHead>Disponíveis</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rifas.map((r) => {
                  const sold = numbers.filter(
                    (n) => n.rifaId === r.id && n.status === "vendido",
                  ).length;
                  const avail = r.totalNumbers - sold;
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.title}</TableCell>
                      <TableCell className="text-muted-foreground">{r.prize}</TableCell>
                      <TableCell>{formatBRL(r.pricePerNumber)}</TableCell>
                      <TableCell>{sold}</TableCell>
                      <TableCell>{avail}</TableCell>
                      <TableCell>
                        {r.status === "ativa" && (
                          <Badge className="bg-success text-success-foreground">Ativa</Badge>
                        )}
                        {r.status === "encerrada" && (
                          <Badge variant="secondary">Encerrada</Badge>
                        )}
                        {r.status === "cancelada" && (
                          <Badge variant="destructive">Cancelada</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="ghost" asChild>
                            <Link to="/admin/rifas/$id" params={{ id: r.id }}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setBuyersOf(r.id)}
                          >
                            <Users className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => shareRifa(r.id, r.title)}
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                          {r.status === "ativa" && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  setConfirm({ kind: "close", id: r.id, title: r.title })
                                }
                              >
                                <Lock className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  setConfirm({ kind: "cancel", id: r.id, title: r.title })
                                }
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}

                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!buyersOf} onOpenChange={(o) => !o && setBuyersOf(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Compradores</DialogTitle>
            <DialogDescription>
              Lista de usuários com números pagos nesta rifa.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {buyers.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nenhum comprador ainda.
              </p>
            )}
            {buyers.map((b) => {
              const u = users.find((x) => x.id === b.userId);
              return (
                <div
                  key={b.userId}
                  className="rounded-lg border bg-muted/30 p-3"
                >
                  <div className="font-medium">{u?.name ?? "Usuário"}</div>
                  <div className="text-xs text-muted-foreground">{u?.email}</div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {b.numbers.map((n) => (
                      <Badge key={n} variant="secondary" className="font-mono">
                        {String(n).padStart(2, "0")}
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={
          confirm?.kind === "close"
            ? `Encerrar "${confirm.title}"?`
            : `Cancelar "${confirm?.title}"?`
        }
        description={
          confirm?.kind === "close"
            ? "A rifa deixará de aceitar novas compras. Você poderá realizar o sorteio."
            : "A rifa será marcada como cancelada. Esta ação não pode ser desfeita."
        }
        destructive={confirm?.kind === "cancel"}
        confirmLabel={confirm?.kind === "close" ? "Encerrar" : "Cancelar rifa"}
        onConfirm={() => {
          if (!confirm) return;
          if (confirm.kind === "close") {
            closeRifa(confirm.id);
            toast.success("Rifa encerrada");
          } else {
            cancelRifa(confirm.id);
            toast.success("Rifa cancelada");
          }
          setConfirm(null);
        }}
      />
    </div>
  );
}

