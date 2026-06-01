import { cn } from "@/lib/utils";

// Deterministic stylized QR — looks like a QR but not scannable.
// Good enough for a clickable prototype.
function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function QRCode({ value, size = 220, className }: { value: string; size?: number; className?: string }) {
  const N = 25;
  const cell = size / N;
  const seed = hash(value);
  const cells: boolean[] = [];
  let s = seed;
  for (let i = 0; i < N * N; i++) {
    s = (s * 1664525 + 1013904223) >>> 0;
    cells.push((s & 1) === 1);
  }
  // Force finder patterns at 3 corners
  function setFinder(ox: number, oy: number) {
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        const on = x === 0 || x === 6 || y === 0 || y === 6 || (x >= 2 && x <= 4 && y >= 2 && y <= 4);
        cells[(oy + y) * N + (ox + x)] = on;
      }
    }
  }
  setFinder(0, 0);
  setFinder(N - 7, 0);
  setFinder(0, N - 7);

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      className={cn("rounded-xl bg-white p-3", className)}
      aria-label="QR code"
    >
      {cells.map((on, i) => {
        if (!on) return null;
        const x = (i % N) * cell;
        const y = Math.floor(i / N) * cell;
        return <rect key={i} x={x} y={y} width={cell} height={cell} fill="#000" rx={cell * 0.15} />;
      })}
    </svg>
  );
}
