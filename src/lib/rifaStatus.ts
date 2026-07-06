import type { Rifa, RifaNumber, Order } from "./types";

export function isRifaClosed(rifa: Rifa): boolean {
  if (rifa.status !== "ativa") return true;
  if (rifa.drawDate) {
    const t = new Date(rifa.drawDate).getTime();
    if (!Number.isNaN(t) && t <= Date.now()) return true;
  }
  return false;
}

export function canPurchase(rifa: Rifa): boolean {
  return !isRifaClosed(rifa);
}

export function eligibleDrawNumbers(
  numbers: RifaNumber[],
  rifaId: string,
  orders: Order[],
): RifaNumber[] {
  const paidOrderIds = new Set(
    orders.filter((o) => o.rifaId === rifaId && o.status === "pago").map((o) => o.id),
  );
  return numbers.filter(
    (n) =>
      n.rifaId === rifaId &&
      n.status === "vendido" &&
      n.orderId != null &&
      paidOrderIds.has(n.orderId),
  );
}

export interface DrawValidation {
  ok: boolean;
  reason?: string;
}

export function canDraw(rifa: Rifa, eligible: RifaNumber[]): DrawValidation {
  if (!rifa.drawDate) {
    return { ok: false, reason: "Rifa sem data de sorteio definida." };
  }
  if (!isRifaClosed(rifa)) {
    return { ok: false, reason: "Rifa ainda não foi encerrada." };
  }
  if (eligible.length === 0) {
    return {
      ok: false,
      reason: "Não existem números vendidos para realizar o sorteio.",
    };
  }
  return { ok: true };
}
