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
                "group relative min-w-[250px] snap-start rounded-xl border bg-card p-3 text-left transition-all duration-200",
                "hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-elevated",
                isActive &&
                  "border-primary ring-2 ring-primary shadow-elevated scale-[1.02]",
              )}
            >
              {pkg.description && (
                <Badge className="absolute -top-2 left-3 bg-gradient-primary text-primary-foreground text-[9px] px-1.5 py-0">
                  <Flame className="mr-0.5 h-2.5 w-2.5" /> {pkg.description}
                </Badge>
              )}
              <div className="flex justify-between items-start w-full gap-2 mt-1">
                <div>
                  <div className="font-display text-base font-bold">
                    {pkg.quantity} {pkg.quantity === 1 ? "número" : "números"}
                  </div>
                  <div className="mt-0.5 font-display text-lg font-bold text-primary">
                    {formatBRL(pkg.price)}
                  </div>
                  <div className="mt-1.5">
                    {savings > 0 && (
                      <Badge
                        variant="secondary"
                        className="bg-success/15 text-success text-[10px] py-0 px-1.5 font-medium border-0"
                      >
                        Economize {formatBRL(savings)} ({pct}%)
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end text-right justify-between h-full pt-0.5">
                  {savings > 0 && (
                    <div className="text-xs text-muted-foreground line-through">
                      De {formatBRL(normal)}
                    </div>
                  )}
                  <div className="text-[11px] text-muted-foreground mt-2">
                    {formatBRL(unit)} / número
                  </div>
                </div>
              </div>
              {isActive && (
                <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-soft">
                  <Check className="h-3 w-3" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
