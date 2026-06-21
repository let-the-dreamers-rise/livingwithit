import { useState } from "react";
import { commitmentGate, type GateReject } from "../lib/gates";
import { GatePanel } from "./GatePanel";

// A guided, three-movement ritual. Each step asks for one thing and one thing
// only, so naming an irreversible decision feels deliberate and weighty —
// not like filling a form. The cost and the fear are carried into every
// reflection that follows.
export function CommitmentRitual({
  onLock,
}: {
  onLock: (decision: string, cost: string, fear: string, name: string) => void;
}) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [decision, setDecision] = useState("");
  const [cost, setCost] = useState("");
  const [fear, setFear] = useState("");
  const [reject, setReject] = useState<GateReject | null>(null);

  const steps = [
    {
      kicker: "I · The decision",
      title: "What did you already decide?",
      hint: "Not what you're considering. What you already did — or committed to. This is the choice you will live inside.",
      placeholder: "I already decided to…",
      value: decision,
      set: setDecision,
      rows: 4,
    },
    {
      kicker: "II · The cost",
      title: "What did it cost you?",
      hint: "Every real choice takes something. Name what you gave up, or what you lost, when you committed.",
      placeholder: "It cost me…",
      value: cost,
      set: setCost,
      rows: 4,
    },
    {
      kicker: "III · The fear",
      title: "What do you fear about living with it?",
      hint: "The doubt that keeps returning. Not whether it was right — but what frightens you about staying inside it.",
      placeholder: "I'm afraid that…",
      value: fear,
      set: setFear,
      rows: 4,
    },
  ];

  const cur = steps[step];
  const isLast = step === steps.length - 1;

  function advance() {
    if (step === 0) {
      const result = commitmentGate(decision);
      if (!result.ok) {
        setReject(result);
        return;
      }
    }
    if (cur.value.trim().length === 0) return;
    setReject(null);
    if (isLast) {
      onLock(decision.trim(), cost.trim(), fear.trim(), name.trim());
    } else {
      setStep((s) => s + 1);
    }
  }

  return (
    <div
      className="flex min-h-full w-full flex-col items-center px-6 py-16"
      style={{ background: "var(--lwi-void)" }}
    >
      <div key={step} className="lwi-fade mx-auto w-full max-w-[600px]">
        {/* progress dots for the three movements */}
        <div className="mb-10 flex items-center gap-2">
          {steps.map((_, i) => (
            <span
              key={i}
              className="h-1 rounded-full transition-all duration-500"
              style={{
                width: i === step ? 28 : 8,
                background:
                  i <= step ? "var(--lwi-accent)" : "var(--lwi-hairline)",
              }}
            />
          ))}
        </div>

        <p
          className="text-[0.68rem] uppercase tracking-[0.24em]"
          style={{ color: "var(--lwi-accent)" }}
        >
          {cur.kicker}
        </p>
        <h2
          className="lwi-serif mt-4"
          style={{
            color: "var(--lwi-text)",
            fontSize: "clamp(1.7rem, 5vw, 2.3rem)",
            lineHeight: 1.2,
            fontWeight: 500,
          }}
        >
          {cur.title}
        </h2>
        <p
          className="mt-4 text-[0.92rem] leading-relaxed"
          style={{ color: "var(--lwi-muted)" }}
        >
          {cur.hint}
        </p>

        {step === 0 && (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="What should your future self call you?"
            className="mt-6 w-full rounded-md border bg-transparent px-4 py-3 text-[1rem] outline-none placeholder:opacity-50"
            style={{ borderColor: "var(--lwi-hairline)", color: "var(--lwi-text)" }}
          />
        )}

        <textarea
          key={`ta-${step}`}
          value={cur.value}
          onChange={(e) => {
            cur.set(e.target.value);
            if (reject) setReject(null);
          }}
          rows={cur.rows}
          placeholder={cur.placeholder}
          className="mt-7 w-full resize-none rounded-md border bg-transparent px-4 py-3.5 text-[1rem] leading-relaxed outline-none transition-colors placeholder:opacity-50"
          style={{
            borderColor: "var(--lwi-hairline)",
            color: "var(--lwi-text)",
          }}
          autoFocus
        />

        {reject && <GatePanel reject={reject} />}

        <div className="mt-7 flex items-center gap-3">
          {step > 0 && (
            <button
              onClick={() => {
                setReject(null);
                setStep((s) => s - 1);
              }}
              className="min-h-[48px] rounded-md px-5 text-[0.85rem] tracking-wide transition-colors hover:bg-white/[0.03]"
              style={{ color: "var(--lwi-muted)" }}
            >
              Back
            </button>
          )}
          <button
            onClick={advance}
            disabled={cur.value.trim().length === 0}
            className="min-h-[48px] flex-1 rounded-md px-6 py-3.5 text-[0.92rem] font-medium tracking-wide transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-30"
            style={{ background: "var(--lwi-accent)", color: "#0a0a0a" }}
          >
            {isLast ? "Lock this decision" : "Continue"}
          </button>
        </div>

        {isLast && (
          <p
            className="mt-4 text-center text-[0.76rem]"
            style={{ color: "var(--lwi-faint)" }}
          >
            This cannot be reversed. There is no edit button after this.
          </p>
        )}
      </div>
    </div>
  );
}
