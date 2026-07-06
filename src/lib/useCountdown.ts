import { useEffect, useState } from "react";

export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
  expired: boolean;
  ready: boolean;
}

const ZERO: Countdown = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  totalMs: 0,
  expired: false,
  ready: false,
};

function compute(target?: string): Countdown {
  if (!target) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0, expired: true, ready: true };
  }
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0, expired: true, ready: true };
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds, totalMs: diff, expired: false, ready: true };
}

export function useCountdown(target?: string): Countdown {
  // Start with a deterministic value so SSR and first client render match.
  const [state, setState] = useState<Countdown>(ZERO);
  useEffect(() => {
    setState(compute(target));
    const id = setInterval(() => setState(compute(target)), 1000);
    return () => clearInterval(id);
  }, [target]);
  return state;
}
