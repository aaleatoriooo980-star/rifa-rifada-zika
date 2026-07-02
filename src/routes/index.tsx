import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { RifaCard } from "@/components/rifa/RifaCard";
import { ResultModal } from "@/components/rifa/ResultModal";
import { useRifas } from "@/context/RifasContext";
import { Sparkles, ShieldCheck, Zap } from "lucide-react";
import type { Rifa } from "@/lib/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Rifas Online — Prêmios incríveis, pagamento via PIX" },
      {
        name: "description",
        content:
          "Concorra a iPhones, motos, consoles e muito mais em rifas 100% online com sorteios transparentes.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { rifas, numbers, draws } = useRifas();
  const [resultRifa, setResultRifa] = useState<Rifa | null>(null);

  const visible = rifas.filter((r) => !r.archived);
  const soldCount = (rifaId: string) =>
    numbers.filter((n) => n.rifaId === rifaId && n.status === "vendido").length;
  const currentDraw = resultRifa ? draws.find((d) => d.rifaId === resultRifa.id) : undefined;

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      <section className="relative overflow-hidden bg-gradient-hero text-primary-foreground">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,oklch(1_0_0/0.18),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> Sorteios da Loteria Federal
            </div>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
              Concorra a prêmios incríveis a partir de R$ 2,50
            </h1>
            <p className="mt-4 text-lg text-white/90">
              Escolha seus números, pague via PIX e torça pelo seu prêmio.
              Simples, rápido e seguro.
            </p>
            <div className="mt-8 flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" /> Sorteios transparentes
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5" /> Pagamento instantâneo
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold sm:text-3xl">
              Rifas em destaque
            </h2>
            <p className="mt-1 text-muted-foreground">
              {visible.filter((r) => r.status === "ativa").length} rifas ativas no momento
            </p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((r) => (
            <RifaCard
              key={r.id}
              rifa={r}
              sold={soldCount(r.id)}
              onOpenResult={setResultRifa}
            />
          ))}
        </div>
      </section>

      {resultRifa && (
        <ResultModal
          open={!!resultRifa}
          onOpenChange={(o) => !o && setResultRifa(null)}
          rifa={resultRifa}
          draw={currentDraw}
        />
      )}

      <footer className="border-t bg-muted/30 py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
          © 2026 RifasOnline · Demonstração MVP · Pagamentos PIX simulados
        </div>
      </footer>
    </div>
  );
}
