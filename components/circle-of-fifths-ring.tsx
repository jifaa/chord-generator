/**
 * Signature visual dari seluruh produk: cincin Circle-of-Fifths.
 * Dipakai dalam ukuran besar sebagai hero di homepage, dan versi kecil
 * sebagai logo mark di navbar. Murni dekoratif (aria-hidden) & SVG statis
 * supaya ringan — animasi hanya lewat CSS (kelas animate-orbit-slow/er).
 */

const CIRCLE_NOTES = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'];

// Numeral pola pop-canon (I-V-vi-IV) yang ditonjolkan sebagai "jejak" di cincin —
// referensi halus ke progression paling terkenal, tanpa perlu teks penjelas.
const HIGHLIGHT_NOTES = new Set(['C', 'G', 'A', 'F']);

interface CircleOfFifthsRingProps {
  size?: number;
  className?: string;
  showLabels?: boolean;
}

export function CircleOfFifthsRing({ size = 420, className = '', showLabels = true }: CircleOfFifthsRingProps) {
  const center = size / 2;
  const radius = size * 0.38;
  const tickRadius = size * 0.44;

  const points = CIRCLE_NOTES.map((note, i) => {
    const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
    return {
      note,
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
      tx: center + tickRadius * Math.cos(angle),
      ty: center + tickRadius * Math.sin(angle),
    };
  });

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="ring-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7c5cfc" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#7c5cfc" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ring-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7c5cfc" />
          <stop offset="50%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#f5a524" />
        </linearGradient>
      </defs>

      <circle cx={center} cy={center} r={radius * 1.05} fill="url(#ring-core)" />

      {/* Outer dashed orbit, animated rotation from parent's CSS class */}
      <g className="[transform-origin:50%_50%] animate-orbit-slow">
        <circle
          cx={center}
          cy={center}
          r={radius + 26}
          fill="none"
          stroke="url(#ring-stroke)"
          strokeWidth="1"
          strokeDasharray="2 10"
          opacity="0.5"
        />
      </g>

      {/* Base ring */}
      <circle cx={center} cy={center} r={radius} fill="none" stroke="#2a2440" strokeWidth="1.5" />

      {/* Edges connecting the pop-canon trail (I-V-vi-IV) */}
      <g stroke="#7c5cfc" strokeWidth="1.5" opacity="0.55">
        {points
          .filter((p) => HIGHLIGHT_NOTES.has(p.note))
          .map((p, i, arr) => {
            const next = arr[(i + 1) % arr.length];
            return <line key={p.note} x1={p.x} y1={p.y} x2={next.x} y2={next.y} strokeDasharray="4 5" />;
          })}
      </g>

      {/* Nodes */}
      {points.map((p) => {
        const active = HIGHLIGHT_NOTES.has(p.note);
        return (
          <g key={p.note}>
            <circle
              cx={p.x}
              cy={p.y}
              r={active ? 6 : 4}
              fill={active ? '#22d3ee' : '#4b4470'}
              className={active ? 'animate-pulse-glow' : ''}
            />
            {showLabels && (
              <text
                x={p.tx}
                y={p.ty}
                textAnchor="middle"
                dominantBaseline="middle"
                fontFamily="var(--font-mono)"
                fontSize={size * 0.032}
                fill={active ? '#f4f2fb' : '#8c85ad'}
              >
                {p.note}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
