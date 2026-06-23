import { cn } from "@/lib/utils";
import type { RifaNumber } from "@/lib/types";

interface Props {
  numbers: RifaNumber[];
  selected: number[];
  onToggle: (n: number) => void;
  currentUserId?: string;
}

export function NumbersGrid({ numbers, selected, onToggle, currentUserId }: Props) {
  return (
    <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12">
      {numbers.map((n) => {
        const isSel = selected.includes(n.number);
        const isMine = n.userId === currentUserId;
        const disabled =
          n.status === "vendido" || (n.status === "aguardando" && !isMine);
        return (
          <button
            key={n.number}
            type="button"
            disabled={disabled}
            onClick={() => onToggle(n.number)}
            className={cn(
              "aspect-square rounded-md text-xs font-semibold transition-all",
              "disabled:cursor-not-allowed",
              n.status === "disponivel" &&
                !isSel &&
                "bg-success/15 text-success hover:bg-success/25",
              isSel &&
                "bg-primary text-primary-foreground shadow-glow scale-105",
              n.status === "aguardando" &&
                !isSel &&
                "bg-warning/25 text-warning-foreground",
              n.status === "vendido" &&
                "bg-destructive/15 text-destructive/70 line-through",
            )}
          >
            {String(n.number).padStart(2, "0")}
          </button>
        );
      })}
    </div>
  );
}
