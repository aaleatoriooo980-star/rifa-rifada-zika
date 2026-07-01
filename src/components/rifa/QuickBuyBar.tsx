import { Button } from "@/components/ui/button";
import { Shuffle, X, Plus } from "lucide-react";
import type { RifaNumber } from "@/lib/types";

interface Props {
  numbers: RifaNumber[];
  selected: number[];
  onChange: (next: number[]) => void;
  currentUserId?: string;
  disabled?: boolean;
}

export function QuickBuyBar({ numbers, selected, onChange, currentUserId, disabled }: Props) {
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
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    onChange([...selected, ...shuffled.slice(0, Math.min(qty, pool.length))]);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {[1, 5, 10, 20].map((q) => (
        <Button
          key={q}
          size="sm"
          variant="outline"
          disabled={disabled}
          onClick={() => addRandom(q)}
          className="hover-scale"
        >
          <Plus className="mr-1 h-3.5 w-3.5" />
          {q}
        </Button>
      ))}
      <Button
        size="sm"
        variant="outline"
        disabled={disabled}
        onClick={() => addRandom(50)}
        className="hover-scale"
      >
        <Shuffle className="mr-1 h-3.5 w-3.5" /> Aleatório
      </Button>
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
