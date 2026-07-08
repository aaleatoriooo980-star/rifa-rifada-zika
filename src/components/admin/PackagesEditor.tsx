import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Sparkles } from "lucide-react";
import { formatBRL } from "@/lib/format";
import type { RifaPackage } from "@/lib/types";

interface Props {
  packages: RifaPackage[];
  onChange: (next: RifaPackage[]) => void;
  totalNumbers: number;
  pricePerNumber: number;
}

function makeId() {
  return `pkg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function PackagesEditor({
  packages,
  onChange,
  totalNumbers,
  pricePerNumber,
}: Props) {
  const update = (id: string, patch: Partial<RifaPackage>) => {
    onChange(packages.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };
  const remove = (id: string) => onChange(packages.filter((p) => p.id !== id));
  const add = () =>
    onChange([...packages, { id: makeId(), quantity: 1, price: pricePerNumber }]);

  const sorted = [...packages].sort((a, b) => a.quantity - b.quantity);
  const dupIds = new Set<string>();
  const seen = new Map<number, string>();
  for (const p of sorted) {
    const prev = seen.get(p.quantity);
    if (prev) {
      dupIds.add(prev);
      dupIds.add(p.id);
    } else {
      seen.set(p.quantity, p.id);
    }
  }

  return (
    <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="font-display font-semibold">Pacotes Promocionais</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Ofereça descontos para quem compra mais números. O comprador continua escolhendo os números manualmente.
          </p>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={add} className="shrink-0 self-start">
          <Plus className="mr-1 h-3.5 w-3.5" /> Adicionar Pacote
        </Button>
      </div>

      {packages.length === 0 && (
        <p className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
          Nenhum pacote cadastrado. Esta rifa usará apenas o valor unitário.
        </p>
      )}

      {packages.length > 0 && (
        <div className="space-y-2">
          {packages.map((p) => {
            const invalidQty =
              p.quantity <= 0 ||
              (totalNumbers > 0 && p.quantity > totalNumbers);
            const invalidPrice = p.price <= 0;
            const isDup = dupIds.has(p.id);
            const normal = p.quantity * pricePerNumber;
            const savings = Math.max(0, normal - p.price);
            const pct = normal > 0 ? Math.round((savings / normal) * 100) : 0;
            return (
              <div
                key={p.id}
                className="grid gap-2 rounded-md border bg-background p-3 sm:grid-cols-[110px_130px_1fr_auto]"
              >
                <div>
                  <Label className="text-xs">Quantidade</Label>
                  <Input
                    type="number"
                    min={1}
                    max={totalNumbers || undefined}
                    value={p.quantity}
                    onChange={(e) =>
                      update(p.id, { quantity: Number(e.target.value) })
                    }
                    className={invalidQty || isDup ? "border-destructive" : ""}
                  />
                </div>
                <div>
                  <Label className="text-xs">Valor (R$)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    min={0.5}
                    value={p.price}
                    onChange={(e) =>
                      update(p.id, { price: Number(e.target.value) })
                    }
                    className={invalidPrice ? "border-destructive" : ""}
                  />
                </div>
                <div>
                  <Label className="text-xs">Descrição (opcional)</Label>
                  <Input
                    value={p.description ?? ""}
                    onChange={(e) =>
                      update(p.id, { description: e.target.value })
                    }
                    placeholder="Ex.: Mais Vendido"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(p.id)}
                    aria-label="Remover pacote"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <div className="sm:col-span-4 flex flex-wrap items-center gap-2 text-xs">
                  {savings > 0 && (
                    <Badge className="bg-success/15 text-success">
                      Economia {formatBRL(savings)} ({pct}%)
                    </Badge>
                  )}
                  {isDup && (
                    <Badge variant="destructive">Quantidade duplicada</Badge>
                  )}
                  {invalidQty && (
                    <Badge variant="destructive">
                      Quantidade inválida (1–{totalNumbers || "…"})
                    </Badge>
                  )}
                  {invalidPrice && (
                    <Badge variant="destructive">Valor inválido</Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Validate a package list. Returns null if OK, or an error message.
 */
export function validatePackages(
  packages: RifaPackage[],
  totalNumbers: number,
): string | null {
  const qtys = new Set<number>();
  for (const p of packages) {
    if (p.quantity <= 0) return "Quantidade dos pacotes deve ser maior que zero.";
    if (p.price <= 0) return "Valor dos pacotes deve ser maior que zero.";
    if (totalNumbers > 0 && p.quantity > totalNumbers)
      return "Quantidade do pacote não pode ser maior que o total de números.";
    if (qtys.has(p.quantity))
      return "Há pacotes com a mesma quantidade. Remova as duplicidades.";
    qtys.add(p.quantity);
  }
  return null;
}
