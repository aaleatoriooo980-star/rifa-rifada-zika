import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatBRL } from "@/lib/format";
import { Flame, Check, X } from "lucide-react";
import type { RifaPackage } from "@/lib/types";

interface Props {
  packages: RifaPackage[];
  activeId: string | null;
  onPick: (pkg: RifaPackage) => void;
  onClear: () => void;
  pricePerNumber: number;
}

export function PackagesPicker({
  packages,
  activeId,
  onPick,
  onClear,
  pricePerNumber,
}: Props) {
  if (!packages || packages.length === 0) return null;
  const sorted = [...packages].sort((a, b) => a.quantity - b.quantity);

  return (
    <div className="rounded-xl border bg-gradient-to-br from-primary/5 to-transparent p-4 shadow-soft">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-display text-lg font-bold">Escolha sua oferta</h3>
          <p className="text-xs text-muted-foreground">
            Selecione um pacote para desbloquear preço promocional. Você escolhe os números manualmente.
          </p>
        </div>
        {activeId && (
          <Button size="sm" variant="ghost" onClick={onClear}>
            <X className="mr-1 h-3.5 w-3.5" /> Remover pacote
          </Button>
        )}
      </div>

      <div className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible md:grid-cols-3 lg:grid-cols-4">
        {sorted.map((pkg) => {
          const normal = pkg.quantity * pricePerNumber;
          const savings = Math.max(0, normal - pkg.price);
          const pct = normal > 0 ? Math.round((savings / normal) * 100) : 0;
          const isActive = activeId === pkg.id;
          const unit = pkg.price / pkg.quantity;
          return (
            <button
              key={pkg.id}
              type="button"
              onClick={() => onPick(pkg)}
              className={cn(
                "group relative min-w-[200px] snap-start rounded-xl border bg-card p-4 text-left transition-all duration-200",
                "hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-elevated",
                isActive &&
                  "border-primary ring-2 ring-primary shadow-elevated scale-[1.02]",
              )}
            >
              {pkg.description && (
                <Badge className="mb-2 bg-gradient-primary text-primary-foreground">
                  <Flame className="mr-1 h-3 w-3" /> {pkg.description}
                </Badge>
              )}
              <div className="font-display text-2xl font-bold">
                {pkg.quantity} {pkg.quantity === 1 ? "número" : "números"}
              </div>
              {savings > 0 && (
                <div className="mt-1 text-xs text-muted-foreground line-through">
                  De {formatBRL(normal)}
                </div>
              )}
              <div className="mt-0.5 font-display text-xl font-bold text-primary">
                {formatBRL(pkg.price)}
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">
                {formatBRL(unit)} / número
              </div>
              {savings > 0 && (
                <Badge
                  variant="secondary"
                  className="mt-2 bg-success/15 text-success"
                >
                  Economize {formatBRL(savings)} ({pct}%)
                </Badge>
              )}
              {isActive && (
                <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-soft">
                  <Check className="h-3.5 w-3.5" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
