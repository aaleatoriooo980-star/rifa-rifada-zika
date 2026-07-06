import type { RifaPackage } from "./types";

export interface PriceResult {
  total: number;
  unitTotal: number;
  appliedPackage?: RifaPackage;
  savings: number;
  discountPct: number;
}

/**
 * Computes the price for a raffle selection.
 *
 * Rules:
 * - If activePackageId is provided, its quantity matches the selected count and the pkg exists → use pkg price.
 * - Else if selectedCount matches exactly some pkg.quantity → automatically apply cheapest matching pkg.
 * - Otherwise → unit price × selectedCount.
 */
export function computePrice(
  selectedCount: number,
  unitPrice: number,
  packages: RifaPackage[] | undefined,
  activePackageId?: string | null,
): PriceResult {
  const unitTotal = selectedCount * unitPrice;
  const pkgs = packages ?? [];

  let applied: RifaPackage | undefined;

  if (activePackageId) {
    const active = pkgs.find((p) => p.id === activePackageId);
    if (active && active.quantity === selectedCount) {
      applied = active;
    }
  }

  if (!applied) {
    const matching = pkgs.filter((p) => p.quantity === selectedCount);
    if (matching.length) {
      applied = matching.reduce((a, b) => (a.price <= b.price ? a : b));
    }
  }

  const total = applied ? applied.price : unitTotal;
  const savings = Math.max(0, unitTotal - total);
  const discountPct = unitTotal > 0 ? Math.round((savings / unitTotal) * 100) : 0;

  return { total, unitTotal, appliedPackage: applied, savings, discountPct };
}
