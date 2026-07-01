import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

interface Props {
  sold: number;
  total: number;
}

export function ProgressBlock({ sold, total }: Props) {
  const pct = total > 0 ? Math.round((sold / total) * 100) : 0;
  const avail = total - sold;
  return (
    <Card className="shadow-soft">
      <CardContent className="space-y-2 p-4 sm:p-5">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Progresso da rifa
            </div>
            <motion.div
              key={pct}
              initial={{ scale: 0.95, opacity: 0.6 }}
              animate={{ scale: 1, opacity: 1 }}
              className="font-display text-3xl font-bold text-primary"
            >
              {pct}%
            </motion.div>
          </div>
          <div className="text-right text-sm">
            <div>
              <span className="font-semibold">{sold}</span>{" "}
              <span className="text-muted-foreground">vendidos</span>
            </div>
            <div>
              <span className="font-semibold">{avail}</span>{" "}
              <span className="text-muted-foreground">disponíveis</span>
            </div>
          </div>
        </div>
        <Progress value={pct} className="h-3" />
      </CardContent>
    </Card>
  );
}
