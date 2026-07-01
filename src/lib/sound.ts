// Minimal WebAudio helpers — no external assets.
let ctx: AudioContext | null = null;
let muted = false;

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  return ctx;
}

export function setMuted(v: boolean) {
  muted = v;
}
export function isMuted() {
  return muted;
}

export function tick() {
  if (muted) return;
  const a = ac();
  if (!a) return;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = "sine";
  o.frequency.value = 880;
  g.gain.setValueAtTime(0.001, a.currentTime);
  g.gain.exponentialRampToValueAtTime(0.25, a.currentTime + 0.02);
  g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.25);
  o.connect(g).connect(a.destination);
  o.start();
  o.stop(a.currentTime + 0.28);
}

let suspenseNodes: { osc: OscillatorNode; gain: GainNode }[] = [];
export function suspenseStart() {
  if (muted) return;
  const a = ac();
  if (!a) return;
  suspenseStop();
  [140, 210, 320].forEach((f, i) => {
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = i === 0 ? "sawtooth" : "sine";
    o.frequency.value = f;
    g.gain.setValueAtTime(0, a.currentTime);
    g.gain.linearRampToValueAtTime(0.05, a.currentTime + 0.4);
    o.connect(g).connect(a.destination);
    o.start();
    suspenseNodes.push({ osc: o, gain: g });
  });
}
export function suspenseStop() {
  const a = ac();
  if (!a) return;
  suspenseNodes.forEach(({ osc, gain }) => {
    try {
      gain.gain.linearRampToValueAtTime(0, a.currentTime + 0.2);
      osc.stop(a.currentTime + 0.25);
    } catch {}
  });
  suspenseNodes = [];
}

export function victory() {
  if (muted) return;
  const a = ac();
  if (!a) return;
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((f, i) => {
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = "triangle";
    o.frequency.value = f;
    const start = a.currentTime + i * 0.12;
    g.gain.setValueAtTime(0.001, start);
    g.gain.exponentialRampToValueAtTime(0.3, start + 0.03);
    g.gain.exponentialRampToValueAtTime(0.001, start + 0.5);
    o.connect(g).connect(a.destination);
    o.start(start);
    o.stop(start + 0.55);
  });
}
