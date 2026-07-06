import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { RifaNumber } from "@/lib/types";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  numbers: RifaNumber[];
  selected: number[];
  onChange: (next: number[]) => void;
  currentUserId?: string;
  maxSelectable?: number;
}

export function ChooseNumbersModal({
  open,
  onOpenChange,
  numbers,
  selected,
  onChange,
  currentUserId,
  maxSelectable,
}: Props) {
  const [text, setText] = useState("");

  const apply = () => {
    const raw = text
      .split(/[,\s;]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (raw.length === 0) {
      toast.error("Digite ao menos um número.");
      return;
    }

    const notNumbers: string[] = [];
    const notExist: number[] = [];
    const sold: number[] = [];
    const unavailable: number[] = [];
    const valid = new Set<number>(selected);

    for (const token of raw) {
      const n = Number(token);
      if (!Number.isInteger(n) || n <= 0) {
        notNumbers.push(token);
        continue;
      }
      const found = numbers.find((x) => x.number === n);
      if (!found) {
        notExist.push(n);
        continue;
      }
      if (found.status === "vendido") {
        sold.push(n);
        continue;
      }
      if (found.status === "aguardando" && found.userId !== currentUserId) {
        unavailable.push(n);
        continue;
      }
      valid.add(n);
    }

    let finalSet = valid;
    let overflowed = 0;
    if (maxSelectable != null && valid.size > maxSelectable) {
      overflowed = valid.size - maxSelectable;
      const kept = Array.from(valid)
        .sort((a, b) => a - b)
        .slice(0, maxSelectable);
      finalSet = new Set(kept);
    }

    const added = finalSet.size - selected.length;
    if (added > 0) {
      onChange(Array.from(finalSet).sort((a, b) => a - b));
      toast.success(`${added} número(s) adicionado(s) à seleção.`);
    }
    if (overflowed > 0)
      toast.error(
        `Quantidade máxima do pacote atingida. ${overflowed} número(s) ignorado(s).`,
      );
    if (notNumbers.length)
      toast.error(`Valor inválido: ${notNumbers.join(", ")}`);
    if (notExist.length)
      toast.error(`Não existe(m): ${notExist.join(", ")}`);
    if (sold.length) toast.error(`Já vendido(s): ${sold.join(", ")}`);
    if (unavailable.length)
      toast.error(`Reservado(s): ${unavailable.join(", ")}`);

    if (added > 0) {
      setText("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Escolher Número</DialogTitle>
          <DialogDescription>
            Digite os números separados por vírgula. Ex.: 10, 25, 36, 48
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="numbers">Números</Label>
          <Input
            id="numbers"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="10, 25, 36, 48"
            autoFocus
          />
          <p className="text-xs text-muted-foreground">
            Validamos automaticamente disponibilidade.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={apply}
            className="bg-gradient-primary text-primary-foreground"
          >
            Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
