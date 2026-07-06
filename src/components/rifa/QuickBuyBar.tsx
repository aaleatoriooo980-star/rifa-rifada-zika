import { Button } from "@/components/ui/button";
import { Edit3, X, Plus } from "lucide-react";
import { toast } from "sonner";
import type { RifaNumber } from "@/lib/types";

interface Props {
  numbers: RifaNumber[];
  selected: number[];
  onChange: (next: number[]) => void;
  currentUserId?: string;
  disabled?: boolean;
  onOpenChoose?: () => void;
  maxSelectable?: number;
}

export function QuickBuyBar({
  numbers,
  selected,
  onChange,
  currentUserId,
  disabled,
  onOpenChoose,
  maxSelectable,
}: Props) {
  const availablePool = numbers.filter(
    (n) =>
      n.status === "disponivel" ||
      (n.status === "aguardando" && n.userId === currentUserId),
  );

  const addRandom = (qty: number) => {
    const pool = availablePool
      .map((n) => n.number)
      .filter((n) => !selected.includes(n));
    if (pool.length === 0) return;
    let take = Math.min(qty, pool.length);
    if (maxSelectable != null) {
      const room = maxSelectable - selected.length;
      if (room <= 0) {
        toast.error("Quantidade máxima do pacote atingida.");
        return;
      }
      take = Math.min(take, room);
    }
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    onChange([...selected, ...shuffled.slice(0, take)]);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {[1, 5, 10, 20].map((q) => (
        <Button
          key={q}
          size="sm"
          variant="outline"
          disabled={
            disabled ||
            (maxSelectable != null && selected.length >= maxSelectable)
          }
          onClick={() => addRandom(q)}
          className="hover-scale"
        >
          <Plus className="mr-1 h-3.5 w-3.5" />
          {q}
        </Button>
      ))}
      {onOpenChoose && (
        <Button
          size="sm"
          variant="outline"
          disabled={disabled}
          onClick={onOpenChoose}
          className="hover-scale"
        >
          <Edit3 className="mr-1 h-3.5 w-3.5" /> Escolher Número
        </Button>
      )}
      <Button
        size="sm"
        variant="ghost"
        disabled={disabled || selected.length === 0}
        onClick={() => onChange([])}
      >
        <X className="mr-1 h-3.5 w-3.5" /> Limpar
      </Button>
    </div>
  );
}

