import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import type { Arc } from "../lib/archive";
import { downloadRecord } from "../lib/export";
import { DISCLAIMER } from "../lib/reflection";

// Read-only tombstones of past arcs. Cannot edit. Cannot continue. Repeat use
// across a lifetime, for new decisions — not daily use.
export function LivingArchive({
  arcs,
  onBack,
}: {
  arcs: Arc[];
  onBack: () => void;
}) {
  const [open, setOpen] = useState<Arc | null>(null);

  return (
    <div
      className="flex min-h-full w-full flex-col items-center px-6 py-12"
      style={{ background: "var(--lwi-void)" }}
    >
      <div className="lwi-fade mx-auto w-full max-w-[680px]">
        <button
          onClick={() => (open ? setOpen(null) : onBack())}
          className="flex items-center gap-1 text-[0.8rem] transition-colors hover:opacity-80"
          style={{ color: "var(--lwi-muted)" }}
        >
          <ChevronLeft size={14} />
          {open ? "Back to archive" : "Back"}
        </button>

        {!open ? (
          <>
            <h2
              className="lwi-serif mt-8"
              style={{
                color: "var(--lwi-text)",
                fontSize: "clamp(1.6rem, 5vw, 2.1rem)",
                fontWeight: 500,
              }}
            >
              The archive
            </h2>
            <p
              className="mt-3 text-[0.9rem]"
              style={{ color: "var(--lwi-muted)" }}
            >
              Closed arcs. Read-only. The doubt loops you have already left behind.
            </p>

            <div className="mt-9 space-y-px">
              {arcs.map((arc) => (
                <button
                  key={arc.id}
                  onClick={() => setOpen(arc)}
                  className="block w-full rounded-md border-b px-1 py-5 text-left transition-colors hover:bg-white/[0.02]"
                  style={{ borderColor: "var(--lwi-hairline)" }}
                >
                  <span
                    className="text-[0.7rem] uppercase tracking-[0.18em]"
                    style={{ color: "var(--lwi-faint)" }}
                  >
                    {arc.date}
                  </span>
                  <span
                    className="mt-1.5 block text-[0.98rem]"
                    style={{ color: "var(--lwi-text)" }}
                  >
                    {arc.decision.slice(0, 60)}
                    {arc.decision.length > 60 ? "…" : ""}
                  </span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="mt-8">
            <span
              className="text-[0.7rem] uppercase tracking-[0.18em]"
              style={{ color: "var(--lwi-faint)" }}
            >
              {open.date} · closed
            </span>
            <p
              className="lwi-serif mt-3 text-[1.15rem]"
              style={{ color: "var(--lwi-text)", lineHeight: 1.5 }}
            >
              {open.decision}
            </p>

            <div className="mt-10 space-y-10">
              {open.weeks.map((w) => {
                const body = w.reflection.includes(DISCLAIMER)
                  ? w.reflection.replace(DISCLAIMER, "").trim()
                  : w.reflection.trim();
                return (
                  <div key={w.week}>
                    <p
                      className="text-[0.66rem] uppercase tracking-[0.22em]"
                      style={{ color: "var(--lwi-accent)" }}
                    >
                      Week {w.week} · {w.label}
                    </p>
                    {w.question && (
                      <p
                        className="lwi-serif mt-2 text-[0.9rem] italic"
                        style={{ color: "var(--lwi-muted)" }}
                      >
                        “{w.question}”
                      </p>
                    )}
                    <div className="mt-3 space-y-4">
                      {body.split(/\n{2,}/).map((p, i) => (
                        <p
                          key={i}
                          className="lwi-serif"
                          style={{
                            color: "var(--lwi-text)",
                            lineHeight: 1.8,
                            fontSize: "0.98rem",
                          }}
                        >
                          {p}
                        </p>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => downloadRecord(open)}
              className="mt-12 min-h-[44px] w-full rounded-md border px-6 py-3 text-[0.88rem] tracking-wide transition-colors hover:bg-white/[0.03]"
              style={{ borderColor: "var(--lwi-accent)", color: "var(--lwi-text)" }}
            >
              Export Living Record
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
