// How the Reppo score moved across runs of the same case. Real scores only.
type Point = { score: number; at: string };

export default function Trend({ points }: { points: Point[] }) {
  if (points.length < 2) return null;
  const W = 560, H = 128, PX = 34, TOP = 34, BOTTOM = 18;
  const lo = Math.max(0, Math.min(...points.map((p) => p.score)) - 6);
  const hi = Math.min(100, Math.max(...points.map((p) => p.score)) + 6);
  const x = (i: number) => PX + (i * (W - PX * 2)) / (points.length - 1);
  const y = (s: number) => TOP + (1 - (s - lo) / Math.max(1, hi - lo)) * (H - TOP - BOTTOM);
  const line = points.map((p, i) => `${x(i)},${y(p.score)}`).join(" ");
  const first = points[0].score;
  const last = points[points.length - 1].score;
  const diff = last - first;

  return (
    <section className="card rise">
      <header className="card-head tight">
        <div>
          <h2>Score across runs</h2>
          <p className="sub">The same case, scored each time it ran.</p>
        </div>
        <span className={`pill ${diff > 0 ? "pass" : diff < 0 ? "warn" : "info"}`}>
          {diff === 0 ? `Steady at ${last}` : `${first} → ${last}`}
        </span>
      </header>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`Scores: ${points.map((p) => p.score).join(", ")}`}>
        <polyline points={line} fill="none" stroke="#c7cdfb" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => {
          const isLast = i === points.length - 1;
          return (
            <g key={p.at}>
              <circle cx={x(i)} cy={y(p.score)} r={isLast ? 8 : 6} fill={isLast ? "#4338ca" : "#fff"} stroke="#4338ca" strokeWidth="3" />
              <text x={x(i)} y={y(p.score) - 16} textAnchor="middle" fontSize="16" fontWeight="700" fill="#25304a">{p.score}</text>
            </g>
          );
        })}
      </svg>
    </section>
  );
}
