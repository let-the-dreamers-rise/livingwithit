// The brand mark for LIVING WITH IT: one ring — the single future you committed
// to — with a point held at its center. You, staying inside the choice. A faint
// open notch in the ring marks the door that Week 1 closed.
export function Sigil({ size = 64 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      role="img"
      aria-label="Living With It"
    >
      {/* the one future — a near-complete ring, with a small closed door notch */}
      <circle
        cx="32"
        cy="32"
        r="24"
        stroke="var(--lwi-accent)"
        strokeWidth="1"
        strokeLinecap="round"
        strokeDasharray="142 8"
        strokeDashoffset="71"
        opacity="0.85"
      />
      {/* the slow orbit of doubt, fading */}
      <circle
        cx="32"
        cy="32"
        r="14"
        stroke="var(--lwi-text)"
        strokeWidth="0.5"
        opacity="0.18"
      />
      {/* you — held at the center, staying */}
      <circle cx="32" cy="32" r="2.4" fill="var(--lwi-accent)" className="lwi-pulse" />
    </svg>
  );
}
