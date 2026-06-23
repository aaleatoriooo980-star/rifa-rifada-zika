import type { Rifa } from "@/lib/types";
import iphone from "@/assets/iphone.jpg";
import moto from "@/assets/moto.jpg";
import ps from "@/assets/ps.jpg";

export const rifaImages = { iphone, moto, ps };

export const mockRifas: Rifa[] = [
  {
    id: "r-iphone",
    title: "iPhone 17 Pro Max 512GB",
    description:
      "Concorra ao novíssimo iPhone 17 Pro Max 512GB lacrado, com 1 ano de garantia Apple. Sorteio pela Loteria Federal.",
    prize: "iPhone 17 Pro Max",
    pricePerNumber: 5,
    totalNumbers: 100,
    image: iphone,
    status: "ativa",
    createdAt: "2026-06-01T10:00:00.000Z",
    drawDate: "2026-07-30T20:00:00.000Z",
  },
  {
    id: "r-moto",
    title: "Honda CG 160",
    description:
      "Moto Honda CG 160 0km, emplacada e com documentação grátis. Entrega em todo Brasil.",
    prize: "Moto Honda CG 160",
    pricePerNumber: 10,
    totalNumbers: 500,
    image: moto,
    status: "ativa",
    createdAt: "2026-05-15T10:00:00.000Z",
    drawDate: "2026-08-15T20:00:00.000Z",
  },
  {
    id: "r-ps",
    title: "PlayStation 6",
    description:
      "Console PlayStation 6 + 2 controles + 3 jogos. Sorteio realizado.",
    prize: "Console PlayStation 6",
    pricePerNumber: 2.5,
    totalNumbers: 1000,
    image: ps,
    status: "encerrada",
    createdAt: "2026-03-01T10:00:00.000Z",
    drawDate: "2026-06-01T20:00:00.000Z",
    winnerNumber: 777,
    winnerUserId: "u-joao",
  },
];

export const mockSeedSold: Record<string, number> = {
  "r-iphone": 42,
  "r-moto": 215,
  "r-ps": 1000,
};
