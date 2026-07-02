import { cn } from "@/lib/utils";
import type { RifaNumber } from "@/lib/types";

interface Props {
  numbers: RifaNumber[];
  selected: number[];
  onToggle: (n: number) => void;
  currentUserId?: string;
  flashing?: number[];
  winnerNumber?: number;
  finished?: boolean;
}

export function NumbersGrid({
  numbers,
  selected,
  onToggle,
  currentUserId,
  flashing,
  winnerNumber,
  finished,
}: Props) {
  return (
    <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12">
      {numbers.map((n) => {
        const isSel = selected.includes(n.number);
        const isMine = n.userId === currentUserId;
        const isFlash = flashing?.includes(n.number);
        const isWinner = finished && winnerNumber === n.number;
        const disabled =
          finished || n.status === "vendido" || (n.status === "aguardando" && !isMine);
        return (
          <button
            key={n.number}
            type="button"
            disabled={disabled}
            onClick={() => onToggle(n.number)}
            className={cn(
              "aspect-square rounded-md text-xs font-semibold transition-all duration-200",
              "disabled:cursor-not-allowed",
              !finished && n.status === "disponivel" && !isSel &&
                "bg-success/15 text-success hover:bg-success/25 hover:scale-105",
              !finished && isSel &&
                "bg-primary text-primary-foreground shadow-glow scale-105 animate-ripple-pop",
              !finished && n.status === "aguardando" && !isSel &&
                "bg-warning/25 text-warning-foreground",
              !finished && n.status === "vendido" && !isFlash &&
                "bg-destructive/15 text-destructive/70 line-through",
              !finished && isFlash && "animate-pulse-win bg-success text-success-foreground",
              finished && n.status === "vendido" && !isWinner &&
                "bg-destructive/20 text-destructive line-through",
              finished && !isWinner && n.status !== "vendido" &&
                "bg-muted text-muted-foreground/60",
              isWinner &&
                "bg-success text-success-foreground ring-2 ring-success shadow-glow scale-110 animate-pulse-win",
            )}
          >
            {String(n.number).padStart(2, "0")}
          </button>
        );
      })}
    </div>
  );
}
