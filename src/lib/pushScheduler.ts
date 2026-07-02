import { useEffect } from "react";
import type { Order, Rifa, User } from "@/lib/types";

const SENT_KEY = "rifas_push_sent_v1";

function loadSent(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(SENT_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveSent(map: Record<string, number>) {
  localStorage.setItem(SENT_KEY, JSON.stringify(map));
}

async function ensurePermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  try {
    const p = await Notification.requestPermission();
    return p === "granted";
  } catch {
    return false;
  }
}

function notify(title: string, body: string) {
  try {
    new Notification(title, { body });
  } catch {}
}

export function usePushScheduler(
  user: User | null,
  rifas: Rifa[],
  orders: Order[],
) {
  useEffect(() => {
    if (!user || user.notificationsEnabled === false) return;
    if (typeof window === "undefined" || !("Notification" in window)) return;

    let cancelled = false;
    const timers: number[] = [];

    (async () => {
      const ok = await ensurePermission();
      if (!ok || cancelled) return;

      const boughtRifaIds = new Set(
        orders
          .filter((o) => o.userId === user.id && o.status === "pago")
          .map((o) => o.rifaId),
      );
      const sent = loadSent();

      rifas
        .filter((r) => r.status === "ativa" && r.drawDate && boughtRifaIds.has(r.id))
        .forEach((r) => {
          const key = `${user.id}:${r.id}`;
          const drawTs = new Date(r.drawDate!).getTime();
          const notifyAt = drawTs - 10 * 60 * 1000;
          const delay = notifyAt - Date.now();
          if (delay > 0 && delay < 2 ** 31 - 1) {
            const id = window.setTimeout(() => {
              if (sent[key]) return;
              notify(
                `Sorteio em 10 minutos — ${r.title}`,
                "Sua rifa será sorteada em 10 minutos. Acompanhe ao vivo.",
              );
              sent[key] = Date.now();
              saveSent(sent);
            }, delay);
            timers.push(id);
          }
        });
    })();

    return () => {
      cancelled = true;
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [user, rifas, orders]);
}
