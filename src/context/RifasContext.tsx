import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { mockRifas } from "@/mocks/mockRifas";
import { mockOrders, mockDraws } from "@/mocks/mockOrders";
import { buildInitialNumbers } from "@/mocks/buildNumbers";
import type { Draw, Order, Rifa, RifaNumber } from "@/lib/types";
import { canDraw, eligibleDrawNumbers, isRifaClosed } from "@/lib/rifaStatus";

interface State {
  rifas: Rifa[];
  numbers: RifaNumber[];
  orders: Order[];
  draws: Draw[];
}

interface RifasContextValue extends State {
  createRifa: (data: Omit<Rifa, "id" | "createdAt" | "status">) => Rifa;
  updateRifa: (id: string, patch: Partial<Rifa>) => void;
  closeRifa: (id: string) => void;
  cancelRifa: (id: string) => void;
  archiveRifa: (id: string) => void;
  unarchiveRifa: (id: string) => void;
  reserveNumbers: (
    rifaId: string,
    nums: number[],
    userId: string,
  ) => Order;
  confirmPayment: (orderId: string) => void;
  getNumbersForRifa: (rifaId: string) => RifaNumber[];
  getBuyersForRifa: (rifaId: string) => { userId: string; numbers: number[] }[];
  drawRifa: (
    rifaId: string,
    users: { id: string; name: string }[],
  ) => Draw | null;
}

const RifasContext = createContext<RifasContextValue | null>(null);
const STATE_KEY = "rifas_state_v1";

function loadState(): State {
  if (typeof window === "undefined") {
    return {
      rifas: mockRifas,
      numbers: buildInitialNumbers(),
      orders: mockOrders,
      draws: mockDraws,
    };
  }
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    rifas: mockRifas,
    numbers: buildInitialNumbers(),
    orders: mockOrders,
    draws: mockDraws,
  };
}

export function RifasProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(() => ({
    rifas: mockRifas,
    numbers: buildInitialNumbers(),
    orders: mockOrders,
    draws: mockDraws,
  }));
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      try {
        localStorage.setItem(STATE_KEY, JSON.stringify(state));
      } catch {}
    }
  }, [state, hydrated]);

  const createRifa: RifasContextValue["createRifa"] = useCallback((data) => {
    const rifa: Rifa = {
      ...data,
      id: `r-${Date.now()}`,
      status: "ativa",
      createdAt: new Date().toISOString(),
    };
    const newNumbers: RifaNumber[] = Array.from(
      { length: rifa.totalNumbers },
      (_, i) => ({
        rifaId: rifa.id,
        number: i + 1,
        status: "disponivel" as const,
      }),
    );
    setState((s) => ({
      ...s,
      rifas: [...s.rifas, rifa],
      numbers: [...s.numbers, ...newNumbers],
    }));
    return rifa;
  }, []);

  const updateRifa: RifasContextValue["updateRifa"] = useCallback((id, patch) => {
    setState((s) => ({
      ...s,
      rifas: s.rifas.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    }));
  }, []);

  const closeRifa = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      rifas: s.rifas.map((r) => (r.id === id ? { ...r, status: "encerrada" } : r)),
    }));
  }, []);

  const cancelRifa = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      rifas: s.rifas.map((r) => (r.id === id ? { ...r, status: "cancelada" } : r)),
    }));
  }, []);

  const archiveRifa = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      rifas: s.rifas.map((r) => (r.id === id ? { ...r, archived: true } : r)),
    }));
  }, []);

  const unarchiveRifa = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      rifas: s.rifas.map((r) => (r.id === id ? { ...r, archived: false } : r)),
    }));
  }, []);

  const reserveNumbers: RifasContextValue["reserveNumbers"] = useCallback(
    (rifaId, nums, userId) => {
      const rifa = state.rifas.find((r) => r.id === rifaId);
      if (!rifa) throw new Error("Rifa não encontrada.");
      if (isRifaClosed(rifa)) {
        throw new Error("Esta rifa foi encerrada. Não é mais possível realizar compras.");
      }
      const order: Order = {
        id: `o-${Date.now()}`,
        rifaId,
        userId,
        numbers: nums,
        total: nums.length * rifa.pricePerNumber,
        status: "pendente",
        createdAt: new Date().toISOString(),
      };
      setState((s) => ({
        ...s,
        orders: [...s.orders, order],
        numbers: s.numbers.map((n) =>
          n.rifaId === rifaId && nums.includes(n.number)
            ? { ...n, status: "aguardando", userId, orderId: order.id }
            : n,
        ),
      }));
      return order;
    },
    [state.rifas],
  );

  const confirmPayment = useCallback((orderId: string) => {
    setState((s) => {
      const order = s.orders.find((o) => o.id === orderId);
      if (!order) return s;
      return {
        ...s,
        orders: s.orders.map((o) =>
          o.id === orderId
            ? { ...o, status: "pago", paidAt: new Date().toISOString() }
            : o,
        ),
        numbers: s.numbers.map((n) =>
          n.orderId === orderId ? { ...n, status: "vendido" } : n,
        ),
      };
    });
  }, []);

  const getNumbersForRifa = useCallback(
    (rifaId: string) => state.numbers.filter((n) => n.rifaId === rifaId),
    [state.numbers],
  );

  const getBuyersForRifa = useCallback(
    (rifaId: string) => {
      const map = new Map<string, number[]>();
      state.numbers
        .filter((n) => n.rifaId === rifaId && n.userId && n.status === "vendido")
        .forEach((n) => {
          const arr = map.get(n.userId!) ?? [];
          arr.push(n.number);
          map.set(n.userId!, arr);
        });
      return Array.from(map.entries()).map(([userId, numbers]) => ({
        userId,
        numbers: numbers.sort((a, b) => a - b),
      }));
    },
    [state.numbers],
  );

  const drawRifa: RifasContextValue["drawRifa"] = useCallback(
    (rifaId, users) => {
      const rifa = state.rifas.find((r) => r.id === rifaId);
      if (!rifa) return null;
      const eligible = eligibleDrawNumbers(state.numbers, rifaId, state.orders);
      const v = canDraw(rifa, eligible);
      if (!v.ok) return null;
      const winner = eligible[Math.floor(Math.random() * eligible.length)];
      const winnerUser = users.find((u) => u.id === winner.userId);
      const draw: Draw = {
        id: `d-${Date.now()}`,
        rifaId,
        winnerNumber: winner.number,
        winnerUserId: winner.userId,
        winnerName: winnerUser?.name,
        drawnAt: new Date().toISOString(),
      };
      setState((s) => ({
        ...s,
        draws: [...s.draws, draw],
        rifas: s.rifas.map((r) =>
          r.id === rifaId
            ? {
                ...r,
                status: "encerrada",
                winnerNumber: winner.number,
                winnerUserId: winner.userId,
              }
            : r,
        ),
      }));
      return draw;
    },
    [state.numbers, state.orders, state.rifas],
  );

  const value = useMemo<RifasContextValue>(
    () => ({
      ...state,
      createRifa,
      updateRifa,
      closeRifa,
      cancelRifa,
      archiveRifa,
      unarchiveRifa,
      reserveNumbers,
      confirmPayment,
      getNumbersForRifa,
      getBuyersForRifa,
      drawRifa,
    }),
    [
      state,
      createRifa,
      updateRifa,
      closeRifa,
      cancelRifa,
      archiveRifa,
      unarchiveRifa,
      reserveNumbers,
      confirmPayment,
      getNumbersForRifa,
      getBuyersForRifa,
      drawRifa,
    ],
  );

  return <RifasContext.Provider value={value}>{children}</RifasContext.Provider>;
}

export function useRifas() {
  const ctx = useContext(RifasContext);
  if (!ctx) throw new Error("useRifas must be used inside RifasProvider");
  return ctx;
}
