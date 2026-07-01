import { Card, CardContent } from "@/components/ui/card";
import { Users, Ticket, DollarSign, CalendarDays, Trophy } from "lucide-react";
import { formatBRL, formatDate } from "@/lib/format";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface Stat {
  icon: LucideIcon;
  label: string;
  value: string;
}

interface Props {
  buyers: number;
  sold: number;
  raised: number;
  drawDate?: string;
  prizesCount?: number;
}

export function RifaStats({ buyers, sold, raised, drawDate, prizesCount = 1 }: Props) {
  const stats: Stat[] = [
    { icon: Users, label: "Compradores", value: String(buyers) },
    { icon: Ticket, label: "Nº vendidos", value: String(sold) },
    { icon: DollarSign, label: "Arrecadado", value: formatBRL(raised) },
    { icon: CalendarDays, label: "Sorteio", value: formatDate(drawDate) },
    { icon: Trophy, label: "Prêmios", value: String(prizesCount) },
  ];
  return (
    <Card className="shadow-soft">
      <CardContent className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 rounded-lg bg-muted/30 p-3"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <s.icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                {s.label}
              </div>
              <div className="truncate font-display text-sm font-bold">{s.value}</div>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}
