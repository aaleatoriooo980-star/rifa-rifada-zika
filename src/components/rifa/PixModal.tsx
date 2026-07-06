import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatBRL } from "@/lib/format";
import { Copy, Check, QrCode } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  numbers: number[];
  pricePerNumber: number;
  total?: number;
  appliedPackageLabel?: string;
  savings?: number;
  discountPct?: number;
}

const PIX_CODE = "000201010212MOCKPIX123456789BR.GOV.BCB.PIX5204000053039865802BR";

export function PixModal({
  open,
  onClose,
  onConfirm,
  numbers,
  pricePerNumber,
  total: totalProp,
  appliedPackageLabel,
  savings = 0,
  discountPct = 0,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [paying, setPaying] = useState(false);
  const unitTotal = numbers.length * pricePerNumber;
  const total = totalProp ?? unitTotal;

  const copy = async () => {
    await navigator.clipboard.writeText(PIX_CODE);
    setCopied(true);
    toast.success("Código PIX copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  const confirm = () => {
    setPaying(true);
    setTimeout(() => {
      setPaying(false);
      onConfirm();
    }, 900);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Finalizar pagamento</DialogTitle>
          <DialogDescription>
            Escaneie o QR code ou copie o código PIX para pagar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl border bg-muted/30 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Números</span>
              <span className="font-medium">{numbers.length}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {numbers.slice(0, 12).map((n) => (
                <Badge key={n} variant="secondary" className="font-mono">
                  {String(n).padStart(2, "0")}
                </Badge>
              ))}
              {numbers.length > 12 && (
                <Badge variant="outline">+{numbers.length - 12}</Badge>
              )}
            </div>
            <div className="mt-3 space-y-1.5 border-t pt-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Valor unitário</span>
                <span>
                  {numbers.length} × {formatBRL(pricePerNumber)} ={" "}
                  <span className={savings > 0 ? "line-through text-muted-foreground" : "font-medium"}>
                    {formatBRL(unitTotal)}
                  </span>
                </span>
              </div>
              {appliedPackageLabel && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Pacote aplicado</span>
                  <Badge className="bg-gradient-primary text-primary-foreground">
                    {appliedPackageLabel}
                  </Badge>
                </div>
              )}
              {savings > 0 && (
                <div className="flex items-center justify-between text-success">
                  <span>Desconto</span>
                  <span className="font-medium">
                    − {formatBRL(savings)} ({discountPct}%)
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between border-t pt-2">
                <span className="text-muted-foreground">Total</span>
                <span className="font-display text-xl font-bold text-primary">
                  {formatBRL(total)}
                </span>
              </div>
            </div>
          </div>


          <div className="flex flex-col items-center gap-3 rounded-xl border bg-gradient-to-br from-primary/5 to-primary/10 p-6">
            <div className="rounded-2xl bg-white p-3 shadow-soft">
              <div className="grid h-40 w-40 grid-cols-12 grid-rows-12 gap-px">
                {Array.from({ length: 144 }).map((_, i) => {
                  const filled =
                    (i * 7919 + 13) % 3 === 0 ||
                    i < 12 ||
                    i > 131 ||
                    i % 12 === 0 ||
                    i % 12 === 11;
                  return (
                    <div
                      key={i}
                      className={filled ? "bg-foreground" : "bg-transparent"}
                    />
                  );
                })}
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <QrCode className="h-4 w-4" /> QR Code PIX (demonstrativo)
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Código PIX (copia e cola)
            </label>
            <div className="mt-1 flex gap-2">
              <code className="flex-1 truncate rounded-md bg-muted px-3 py-2 text-xs">
                {PIX_CODE}
              </code>
              <Button variant="outline" size="icon" onClick={copy}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <Badge variant="outline" className="w-full justify-center border-warning/40 bg-warning/10 py-2 text-warning-foreground">
            Aguardando pagamento
          </Badge>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={confirm}
            disabled={paying}
            className="bg-gradient-primary text-primary-foreground"
          >
            {paying ? "Confirmando..." : "Simular pagamento aprovado"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
