import type { RifaNumber } from "@/lib/types";
import { mockRifas, mockSeedSold } from "./mockRifas";
import { mockOrders } from "./mockOrders";

/**
 * Builds the initial numbers state for all mocked rifas, applying the
 * seeded "sold" counts and assigning the João orders to the right numbers.
 */
export function buildInitialNumbers(): RifaNumber[] {
  const all: RifaNumber[] = [];
  for (const rifa of mockRifas) {
    const soldCount = mockSeedSold[rifa.id] ?? 0;
    // pick deterministic-ish set of sold numbers
    const sold = new Set<number>();
    // ensure João's numbers from mockOrders are sold for their rifas
    const joaoNums = mockOrders
      .filter((o) => o.rifaId === rifa.id)
      .flatMap((o) => o.numbers);
    joaoNums.forEach((n) => sold.add(n));

    let i = 1;
    while (sold.size < soldCount && i <= rifa.totalNumbers) {
      sold.add(i);
      i++;
    }

    const ownerMap = new Map<number, string>();
    for (const o of mockOrders.filter((o) => o.rifaId === rifa.id)) {
      o.numbers.forEach((n) => ownerMap.set(n, o.userId));
    }

    for (let n = 1; n <= rifa.totalNumbers; n++) {
      all.push({
        rifaId: rifa.id,
        number: n,
        status: sold.has(n) ? "vendido" : "disponivel",
        userId: ownerMap.get(n),
        orderId: mockOrders.find(
          (o) => o.rifaId === rifa.id && o.numbers.includes(n),
        )?.id,
      });
    }
  }
  return all;
}
