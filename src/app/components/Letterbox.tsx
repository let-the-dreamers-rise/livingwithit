import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import type { WeekEntry } from "../lib/archive";
import { TOTAL_WEEKS, frameFor } from "../lib/weeks";
import { DISCLAIMER } from "../lib/reflection";
import { ReflectionBlock } from "./ReflectionBlock";
import { Sigil } from "./Sigil";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import envelopeImg from "../../imports/image-2.png";

// The Letterbox — nine letters from your future self, arriving one at a time.
// The newest arrives SEALED (a real wax-sealed envelope); breaking the seal
// unfolds the letter and it writes itself live. Read letters reopen at rest;
// letters from horizons you haven't reached stay sealed in the dark. This is the
// lifetime arc made tangible: one week, to a lifetime, as correspondence.
export function Letterbox({ weeks }: { weeks: WeekEntry[] }) {
  const delivered = weeks.length;
  // Nothing auto-opens — the newest letter waits, sealed, for you to break it.
  const [open, setOpen] = useState<number>(-1);
  const [breaking, setBreaking] = useState<number>(-1);

  // When a brand-new letter arrives, collapse back to the sealed state for it.
  useEffect(() => {
    setOpen(-1);
    setBreaking(-1);
  }, [delivered]);

  // Breaking the seal is a held, physical moment before the letter rises.
  function breakSeal(i: number) {
    setBreaking(i);
    window.setTimeout(() => {
      setOpen(i);
      setBreaking(-1);
    }, 1100);
  }

  return (
    <div className="mx-auto flex w-full max-w-[640px] flex-col gap-3">
      {Array.from({ length: TOTAL_WEEKS }).map((_, i) => {
        const frame = frameFor(i + 1);
        const entry = weeks[i];
        const isDelivered = i < delivered;
        const isOpen = isDelivered && open === i;
        const isNewest = i === delivered - 1;

        if (!isDelivered) {
          return <SealedEnvelope key={i} label={frame.label} />;
        }

        // The newest letter, still sealed: the cinematic "it has arrived" moment.
        if (isNewest && !isOpen) {
          const isBreaking = breaking === i;
          return (
            <button
              key={i}
              onClick={() => !isBreaking && breakSeal(i)}
              disabled={isBreaking}
              className="group flex flex-col items-center rounded-lg border px-6 py-8 text-center transition-colors hover:bg-white/[0.02]"
              style={{ borderColor: "var(--lwi-accent)", background: "rgba(107,124,110,0.05)" }}
            >
              <div className="relative w-[180px] max-w-full">
                <div className={isBreaking ? "lwi-seal-break" : "lwi-fade"}>
                  <ImageWithFallback
                    src={envelopeImg}
                    alt="A sealed letter from your future self"
                    className="w-full rounded-md object-contain transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                {/* the wax seal cracking, centered over the envelope */}
                {isBreaking && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="lwi-wax-crack flex h-10 w-10 items-center justify-center rounded-full" style={{ background: "var(--lwi-accent)" }}>
                      <Sigil size={26} />
                    </div>
                  </div>
                )}
              </div>
              <p
                className="mt-6 text-[0.62rem] uppercase tracking-[0.24em]"
                style={{ color: "var(--lwi-accent)" }}
              >
                {isBreaking ? "Breaking the seal…" : `A letter has arrived — ${frame.label.toLowerCase()}`}
              </p>
              {!isBreaking && (
                <p className="lwi-serif mt-2 text-[1.05rem] italic" style={{ color: "var(--lwi-text)" }}>
                  Break the seal
                </p>
              )}
            </button>
          );
        }

        return (
          <div
            key={i}
            className="overflow-hidden rounded-lg border transition-colors"
            style={{
              borderColor: isOpen ? "var(--lwi-accent)" : "var(--lwi-hairline)",
              background: isOpen ? "rgba(107,124,110,0.05)" : "rgba(232,228,223,0.02)",
            }}
          >
            <button
              onClick={() => setOpen(isOpen ? -1 : i)}
              className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-white/[0.02]"
            >
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center">
                <div className="absolute inset-0 rounded-full" style={{ background: "var(--lwi-accent-soft)" }} />
                <Sigil size={26} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[0.62rem] uppercase tracking-[0.22em]" style={{ color: "var(--lwi-accent)" }}>
                  A letter from {frame.label.toLowerCase()}
                </p>
                <p className="lwi-serif mt-0.5 truncate text-[0.95rem] italic" style={{ color: "var(--lwi-muted)" }}>
                  {entry.question ? `“${entry.question}”` : "On beginning to live with it"}
                </p>
              </div>
              <span className="shrink-0 text-[0.7rem] tracking-wide" style={{ color: "var(--lwi-faint)" }}>
                {isOpen ? "Close" : "Open"}
              </span>
            </button>

            {isOpen && (
              <div className="lwi-letter-rise border-t px-5 pb-8 pt-6" style={{ borderColor: "var(--lwi-hairline)" }}>
                {isNewest ? (
                  <ReflectionBlock key={`live-${i}`} text={entry.reflection} />
                ) : (
                  <StaticLetter text={entry.reflection} />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// A previously-read letter, shown at rest (no re-animation).
function StaticLetter({ text }: { text: string }) {
  const body = text.includes(DISCLAIMER) ? text.replace(DISCLAIMER, "").trim() : text.trim();
  const paragraphs = body.split(/\n{2,}/).filter(Boolean);
  return (
    <div className="mx-auto" style={{ maxWidth: 600 }}>
      <div className="space-y-5">
        {paragraphs.map((p, i) => (
          <p key={i} className="lwi-serif" style={{ color: "var(--lwi-text)", lineHeight: 1.85, fontSize: "1.06rem" }}>
            {p}
          </p>
        ))}
      </div>
      <div className="mx-auto mt-8 mb-4 h-px w-10" style={{ background: "var(--lwi-hairline)" }} />
      <p className="text-[0.72rem] italic" style={{ color: "var(--lwi-faint)" }}>
        {DISCLAIMER}
      </p>
    </div>
  );
}

// A letter from a horizon not yet reached. Sealed, in the dark.
function SealedEnvelope({ label }: { label: string }) {
  return (
    <div
      className="flex items-center gap-4 rounded-lg border border-dashed px-5 py-4 opacity-50"
      style={{ borderColor: "var(--lwi-hairline)" }}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center">
        <Lock size={14} style={{ color: "var(--lwi-faint)" }} />
      </div>
      <div className="flex-1">
        <p className="text-[0.62rem] uppercase tracking-[0.22em]" style={{ color: "var(--lwi-faint)" }}>
          {label}
        </p>
        <p className="mt-0.5 text-[0.85rem]" style={{ color: "var(--lwi-faint)" }}>
          Sealed until you arrive.
        </p>
      </div>
    </div>
  );
}
