import { useCountdown } from "@/lib/useCountdown";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface Props {
  target?: string;
  compact?: boolean;
}

export function CountdownTimer({ target, compact }: Props) {
  const c = useCountdown(target);

  const tone =
    c.expired
      ? "border-border bg-muted/30 text-muted-foreground"
      : c.totalMs < 60 * 60 * 1000
        ? "border-destructive/40 bg-destructive/5 text-destructive"
        : c.totalMs < 24 * 60 * 60 * 1000
          ? "border-warning/50 bg-warning/10 text-warning-foreground"
          : "border-primary/30 bg-primary/5 text-primary";

  const cells: Array<[string, number]> = [
    ["Dias", c.days],
    ["Horas", c.hours],
    ["Min", c.minutes],
    ["Seg", c.seconds],
  ];

  return (
    <Card className={cn("border shadow-soft transition-colors", tone)}>
      <CardContent className={cn("flex items-center gap-3 sm:gap-4", compact ? "p-3" : "p-3 sm:p-5")}>
        <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-background/70">
          <Clock className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] sm:text-xs font-medium uppercase tracking-wide opacity-80">
            {c.expired ? "Rifa encerrada" : "Tempo restante para o sorteio"}
          </div>
          {!c.expired && (
            <div className="mt-1 grid grid-cols-4 gap-1 sm:gap-3">
              {cells.map(([label, val]) => (
                <div key={label} className="text-center">
                  <motion.div
                    key={val}
                    initial={{ y: -6, opacity: 0.5 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="font-display text-xl font-bold tabular-nums sm:text-3xl"
                  >
                    {String(val).padStart(2, "0")}
                  </motion.div>
                  <div className="text-[9px] sm:text-[10px] uppercase opacity-70">{label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
