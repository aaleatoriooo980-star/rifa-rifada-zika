import type { Order, Draw } from "@/lib/types";

export const mockOrders: Order[] = [
  {
    id: "o-1",
    rifaId: "r-ps",
    userId: "u-joao",
    numbers: [777, 123, 456],
    total: 7.5,
    status: "pago",
    createdAt: "2026-05-20T14:00:00.000Z",
    paidAt: "2026-05-20T14:05:00.000Z",
  },
  {
    id: "o-2",
    rifaId: "r-iphone",
    userId: "u-joao",
    numbers: [7, 13, 21],
    total: 15,
    status: "pago",
    createdAt: "2026-06-10T11:00:00.000Z",
    paidAt: "2026-06-10T11:02:00.000Z",
  },
];

export const mockDraws: Draw[] = [
  {
    id: "d-1",
    rifaId: "r-ps",
    winnerNumber: 777,
    winnerUserId: "u-joao",
    winnerName: "João Silva",
    drawnAt: "2026-06-01T20:00:00.000Z",
  },
];
