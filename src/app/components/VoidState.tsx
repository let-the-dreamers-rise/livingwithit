// The threshold. First impression — composed like the cover of a quiet, serious
// book, not a SaaS hero. A tracked wordmark, an oversized serif vow, a hairline
// rule, and a single deliberate way in.
import { Sigil } from "./Sigil";

export function VoidState({
  onEnter,
  onArchive,
  hasArchive,
}: {
  onEnter: () => void;
  onArchive: () => void;
  hasArchive: boolean;
}) {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center px-6 py-20">
      {/* wordmark */}
      <div className="lwi-fade-slow absolute top-10 left-1/2 -translate-x-1/2">
        <span
          className="text-[0.66rem] uppercase tracking-[0.42em]"
          style={{ color: "var(--lwi-muted)" }}
        >
          Living&nbsp;With&nbsp;It
        </span>
      </div>

      <div className="lwi-fade-slow mx-auto w-full max-w-[620px] text-center">
        <div className="mb-8 flex justify-center">
          <Sigil size={72} />
        </div>
        <p
          className="mb-8 text-[0.64rem] uppercase tracking-[0.4em]"
          style={{ color: "var(--lwi-accent)" }}
        >
          A nine-week instrument
        </p>

        <h1
          className="lwi-serif"
          style={{
            color: "var(--lwi-text)",
            fontSize: "clamp(2.6rem, 9vw, 4.6rem)",
            lineHeight: 1.04,
            fontWeight: 500,
            letterSpacing: "-0.02em",
          }}
        >
          You chose.
          <br />
          <span style={{ fontStyle: "italic", color: "var(--lwi-accent)" }}>
            Now learn to stay.
          </span>
        </h1>

        {/* hairline rule */}
        <div
          className="mx-auto my-10 h-px w-16"
          style={{
            background:
              "linear-gradient(90deg, transparent, var(--lwi-accent), transparent)",
          }}
        />

        <p
          className="mx-auto max-w-[440px] text-[1rem] leading-relaxed"
          style={{ color: "var(--lwi-text)", opacity: 0.82 }}
        >
          Not advice. Not prediction. Not a second opinion. For people who
          already made the decision — and cannot stop reopening it.
        </p>

        <div className="mt-12 flex flex-col items-center gap-5">
          <button
            onClick={onEnter}
            className="group relative min-h-[52px] overflow-hidden rounded-full px-12 text-[0.9rem] tracking-[0.08em] transition-all duration-500"
            style={{
              color: "#0a0a0a",
              background: "var(--lwi-accent)",
              boxShadow: "0 0 0 1px var(--lwi-accent), 0 18px 50px -20px rgba(107,124,110,0.6)",
            }}
          >
            Enter Week 1
          </button>

          <p
            className="text-[0.72rem] tracking-[0.2em]"
            style={{ color: "var(--lwi-faint)" }}
          >
            ONE FUTURE · NO RE-LITIGATION
          </p>
        </div>
      </div>

      {hasArchive && (
        <button
          onClick={onArchive}
          className="absolute bottom-9 left-1/2 -translate-x-1/2 text-[0.72rem] tracking-[0.16em] underline-offset-4 transition-colors hover:underline"
          style={{ color: "var(--lwi-muted)" }}
        >
          The Archive
        </button>
      )}
    </div>
  );
}
