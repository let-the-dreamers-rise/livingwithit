import { useEffect, useRef, useState } from "react";
import { weeklyGates, type GateReject } from "../lib/gates";
import type { WeekEntry } from "../lib/archive";
import { TOTAL_WEEKS, frameFor } from "../lib/weeks";
import { LockedDecisionBanner } from "./LockedDecisionBanner";
import { WeekCounter } from "./WeekCounter";
import { Letterbox } from "./Letterbox";
import { GatePanel } from "./GatePanel";
import { DemoNote } from "./DemoNote";
import { MailSubscribe } from "./MailSubscribe";

export function WeeklyChamber({
  decision,
  cost = "",
  fear = "",
  name = "",
  weeks,
  pending,
  onCheckIn,
}: {
  decision: string;
  cost?: string;
  fear?: string;
  name?: string;
  weeks: WeekEntry[];
  pending: boolean;
  onCheckIn: (question: string) => void;
}) {
  const [value, setValue] = useState("");
  const [reject, setReject] = useState<GateReject | null>(null);
  const reflectionTopRef = useRef<HTMLDivElement>(null);

  const latest = weeks[weeks.length - 1];
  const nextWeek = weeks.length + 1;
  const arcComplete = weeks.length >= TOTAL_WEEKS;

  // When a new reflection arrives, draw the eye to it.
  useEffect(() => {
    reflectionTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [weeks.length]);

  function submit() {
    const result = weeklyGates(value);
    if (!result.ok) {
      setReject(result);
      return;
    }
    setReject(null);
    onCheckIn(value.trim());
    setValue("");
  }

  return (
    <div
      className="flex min-h-full w-full flex-col items-center px-6 py-10"
      style={{ background: "var(--lwi-chamber)" }}
    >
      <div className="mx-auto w-full max-w-[720px]">
        <LockedDecisionBanner decision={decision} />

        <div className="mt-8">
          <WeekCounter week={latest.week} label={latest.label} />
        </div>

        <div ref={reflectionTopRef} className="mt-10">
          <Letterbox weeks={weeks} />
        </div>

        {!arcComplete && (
          <div className="mx-auto mt-14 max-w-[640px]">
            <div
              className="mb-8 h-px w-full"
              style={{ background: "var(--lwi-hairline)" }}
            />
            <p
              className="text-[0.68rem] uppercase tracking-[0.24em]"
              style={{ color: "var(--lwi-accent)" }}
            >
              Week {nextWeek} · {frameFor(nextWeek).label}
            </p>

            {pending ? (
              <div className="mt-8 flex flex-col items-center py-8">
                <div
                  className="h-px w-16 lwi-pulse"
                  style={{ background: "var(--lwi-accent)" }}
                />
                <p
                  className="mt-5 text-[0.8rem] italic"
                  style={{ color: "var(--lwi-faint)" }}
                >
                  The week is settling…
                </p>
              </div>
            ) : (
              <>
                <textarea
                  value={value}
                  onChange={(e) => {
                    setValue(e.target.value);
                    if (reject) setReject(null);
                  }}
                  rows={3}
                  placeholder="Ask your future self one question about living with this…"
                  className="mt-5 w-full resize-none rounded-md border bg-transparent px-4 py-3.5 text-[1rem] leading-relaxed outline-none placeholder:opacity-50"
                  style={{
                    borderColor: "var(--lwi-hairline)",
                    color: "var(--lwi-text)",
                  }}
                />
                {reject && <GatePanel reject={reject} />}
                <button
                  onClick={submit}
                  disabled={value.trim().length === 0}
                  className="mt-6 min-h-[48px] w-full rounded-md px-6 py-3.5 text-[0.92rem] font-medium tracking-wide transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-30"
                  style={{ background: "var(--lwi-accent)", color: "#0a0a0a" }}
                >
                  Check in
                </button>
              </>
            )}
          </div>
        )}

        <div className="mt-16">
          <MailSubscribe
            decision={decision}
            cost={cost}
            fear={fear}
            name={name}
            firstLetter={weeks[0]?.reflection ?? ""}
          />
        </div>

        <div className="mt-10">
          <DemoNote />
        </div>
      </div>
    </div>
  );
}
