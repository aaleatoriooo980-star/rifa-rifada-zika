import { forwardRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { formatDateTime } from "@/lib/format";
import { Trophy, Ticket } from "lucide-react";
import type { Rifa } from "@/lib/types";

interface Props {
  rifa: Rifa;
  winnerNumber: number;
  winnerName?: string;
  drawnAt: string;
  nextRifaUrl?: string;
}

export const ShareResultCard = forwardRef<HTMLDivElement, Props>(function ShareResultCard(
  { rifa, winnerNumber, winnerName, drawnAt, nextRifaUrl },
  ref,
) {
  return (
    <div
      ref={ref}
      style={{ width: 1080, height: 1350 }}
      className="relative flex flex-col overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 p-16 text-white"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
          <Ticket className="h-8 w-8" />
        </div>
        <div className="text-3xl font-black tracking-tight">CampanhaFácil</div>
      </div>

      <div className="mt-12 flex-1">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold uppercase tracking-widest backdrop-blur">
          <Trophy className="h-4 w-4" /> Resultado do sorteio
        </div>
        <h2 className="mt-6 text-6xl font-black leading-tight">{rifa.title}</h2>
        <p className="mt-3 text-2xl text-white/90">🏆 {rifa.prize}</p>

        <div className="mt-10 overflow-hidden rounded-3xl bg-white/15 backdrop-blur">
          <img
            src={rifa.image}
            alt={rifa.prize}
            crossOrigin="anonymous"
            style={{ width: "100%", height: 380, objectFit: "cover" }}
          />
        </div>

        <div className="mt-10 rounded-3xl bg-white p-10 text-emerald-700 shadow-2xl">
          <div className="text-sm font-bold uppercase tracking-widest text-emerald-500">
            Número vencedor
          </div>
          <div className="mt-2 font-black leading-none" style={{ fontSize: 160 }}>
            {String(winnerNumber).padStart(3, "0")}
          </div>
          <div className="mt-4 border-t border-emerald-100 pt-4">
            <div className="text-sm uppercase tracking-widest text-emerald-500">
              Ganhador
            </div>
            <div className="text-4xl font-black text-emerald-900">
              {winnerName ?? "—"}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 flex items-end justify-between">
        <div>
          <div className="text-sm uppercase tracking-widest text-white/70">Sorteado em</div>
          <div className="text-2xl font-bold">{formatDateTime(drawnAt)}</div>
        </div>
        {nextRifaUrl && (
          <div className="flex flex-col items-center gap-2 rounded-2xl bg-white p-4">
            <QRCodeSVG value={nextRifaUrl} size={140} />
            <div className="text-xs font-bold uppercase text-emerald-700">
              Próxima campanha
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
