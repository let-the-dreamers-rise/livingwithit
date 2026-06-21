import { TOTAL_WEEKS } from "../lib/weeks";

export function WeekCounter({ week, label }: { week: number; label: string }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <span
          className="text-[0.7rem] uppercase tracking-[0.24em]"
          style={{ color: "var(--lwi-muted)" }}
        >
          Week {week} of {TOTAL_WEEKS}
        </span>
        <span
          className="lwi-serif text-[0.95rem] italic"
          style={{ color: "var(--lwi-accent)" }}
        >
          {label}
        </span>
      </div>
      <div className="flex gap-1.5" aria-hidden>
        {Array.from({ length: TOTAL_WEEKS }).map((_, i) => (
          <span
            key={i}
            className="h-px flex-1 rounded-full transition-colors duration-700"
            style={{
              background:
                i < week ? "var(--lwi-accent)" : "var(--lwi-hairline)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
