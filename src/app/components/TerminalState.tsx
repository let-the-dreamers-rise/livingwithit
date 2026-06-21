import type { Arc } from "../lib/archive";
import { downloadRecord } from "../lib/export";
import { LockedDecisionBanner } from "./LockedDecisionBanner";
import { DISCLAIMER } from "../lib/reflection";

// The hard stop. No input fields exist in the DOM here — removed, not disabled.
// No continue. No Week 10. No back.
export function TerminalState({
  arc,
  onNewArc,
}: {
  arc: Arc;
  onNewArc: () => void;
}) {
  return (
    <div
      className="flex min-h-full w-full flex-col items-center px-6 py-16"
      style={{ background: "var(--lwi-terminal)" }}
    >
      <div className="lwi-fade-slow mx-auto w-full max-w-[720px]">
        <div className="text-center">
          <div
            className="mx-auto mb-9 h-px w-12"
            style={{ background: "var(--lwi-faint)" }}
          />
          <h2
            className="lwi-serif"
            style={{
              color: "var(--lwi-text)",
              fontSize: "clamp(1.8rem, 5vw, 2.4rem)",
              lineHeight: 1.2,
              fontWeight: 500,
            }}
          >
            Nine weeks. The arc is closed.
          </h2>
          <p
            className="mx-auto mt-5 max-w-[460px] text-[0.95rem] leading-relaxed"
            style={{ color: "var(--lwi-muted)" }}
          >
            You explored living inside one decision. The doubt loop ends here.
          </p>
        </div>

        <div className="mt-12">
          <LockedDecisionBanner decision={arc.decision} />
        </div>

        {(arc.cost || arc.fear) && (
          <div className="mt-6 grid gap-px sm:grid-cols-2">
            {arc.cost && (
              <div
                className="rounded-md border px-4 py-3"
                style={{ borderColor: "var(--lwi-hairline)" }}
              >
                <p
                  className="text-[0.6rem] uppercase tracking-[0.24em]"
                  style={{ color: "var(--lwi-muted)" }}
                >
                  What it cost
                </p>
                <p className="mt-1.5 text-[0.9rem] leading-relaxed" style={{ color: "var(--lwi-text)" }}>
                  {arc.cost}
                </p>
              </div>
            )}
            {arc.fear && (
              <div
                className="rounded-md border px-4 py-3"
                style={{ borderColor: "var(--lwi-hairline)" }}
              >
                <p
                  className="text-[0.6rem] uppercase tracking-[0.24em]"
                  style={{ color: "var(--lwi-muted)" }}
                >
                  What I feared
                </p>
                <p className="mt-1.5 text-[0.9rem] leading-relaxed" style={{ color: "var(--lwi-text)" }}>
                  {arc.fear}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mt-10 space-y-12">
          {arc.weeks.map((w) => {
            const body = w.reflection.includes(DISCLAIMER)
              ? w.reflection.replace(DISCLAIMER, "").trim()
              : w.reflection.trim();
            return (
              <div key={w.week}>
                <p
                  className="text-[0.66rem] uppercase tracking-[0.24em]"
                  style={{ color: "var(--lwi-accent)" }}
                >
                  Week {w.week} · {w.label}
                </p>
                {w.question && (
                  <p
                    className="lwi-serif mt-3 text-[0.92rem] italic"
                    style={{ color: "var(--lwi-muted)" }}
                  >
                    “{w.question}”
                  </p>
                )}
                <div className="mt-4 space-y-4">
                  {body.split(/\n{2,}/).map((p, i) => (
                    <p
                      key={i}
                      className="lwi-serif"
                      style={{
                        color: "var(--lwi-text)",
                        lineHeight: 1.8,
                        fontSize: "1rem",
                      }}
                    >
                      {p}
                    </p>
                  ))}
                </div>
                <p
                  className="mt-4 text-[0.72rem] italic"
                  style={{ color: "var(--lwi-faint)" }}
                >
                  {DISCLAIMER}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-16 flex flex-col gap-4 sm:flex-row">
          <button
            onClick={() => downloadRecord(arc)}
            className="min-h-[48px] flex-1 rounded-md border px-6 py-3.5 text-[0.9rem] tracking-wide transition-colors hover:bg-white/[0.03]"
            style={{ borderColor: "var(--lwi-accent)", color: "var(--lwi-text)" }}
          >
            Export Living Record
          </button>
          <button
            onClick={onNewArc}
            className="min-h-[48px] flex-1 rounded-md px-6 py-3.5 text-[0.9rem] tracking-wide transition-colors"
            style={{ background: "var(--lwi-accent)", color: "#0a0a0a" }}
          >
            Begin new arc
          </button>
        </div>
      </div>
    </div>
  );
}
