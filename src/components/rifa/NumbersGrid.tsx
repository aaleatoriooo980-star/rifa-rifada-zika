import { cn } from "@/lib/utils";
import type { RifaNumber } from "@/lib/types";

interface Props {
  numbers: RifaNumber[];
  selected: number[];
  onToggle: (n: number) => void;
  currentUserId?: string;
  flashing?: number[];
}

export function NumbersGrid({ numbers, selected, onToggle, currentUserId, flashing }: Props) {
  return (
    <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12">
      {numbers.map((n) => {
        const isSel = selected.includes(n.number);
        const isMine = n.userId === currentUserId;
        const isFlash = flashing?.includes(n.number);
        const disabled =
          n.status === "vendido" || (n.status === "aguardando" && !isMine);
        return (
          <button
            key={n.number}
            type="button"
            disabled={disabled}
            onClick={() => onToggle(n.number)}
            className={cn(
              "aspect-square rounded-md text-xs font-semibold transition-all duration-200",
              "disabled:cursor-not-allowed",
              n.status === "disponivel" &&
                !isSel &&
                "bg-success/15 text-success hover:bg-success/25 hover:scale-105",
              isSel &&
                "bg-primary text-primary-foreground shadow-glow scale-105 animate-ripple-pop",
              n.status === "aguardando" &&
                !isSel &&
                "bg-warning/25 text-warning-foreground",
              n.status === "vendido" &&
                !isFlash &&
                "bg-destructive/15 text-destructive/70 line-through",
              isFlash && "animate-pulse-win bg-success text-success-foreground",
            )}
          >
            {String(n.number).padStart(2, "0")}
          </button>
        );
      })}
    </div>
  );
}
