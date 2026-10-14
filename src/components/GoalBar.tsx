/** Barra «te faltan X»: dónde estás (azul) y dónde está tu meta (marca verde), en la escala de 0 a 500. */
export default function GoalBar({ from, target, className = "mt-4" }: { from: number; target: number; className?: string }) {
  const pct = (n: number) => Math.max(0, Math.min(100, (n / 500) * 100));
  return (
    <div className={`relative h-2.5 rounded-full bg-muted ${className}`} aria-hidden="true">
      <div className="progress-fill h-full rounded-full bg-navy" style={{ width: `${pct(from)}%` }} />
      <span className="absolute -top-1.5 h-5 w-1 rounded-full bg-brand" style={{ left: `calc(${pct(target)}% - 2px)` }} />
    </div>
  );
}
