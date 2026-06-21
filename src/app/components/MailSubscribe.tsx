import { useState } from "react";
import { subscribeToLetters, getSubscriberId, sendNextLetterNow } from "../lib/mail";

// "Have the letters delivered." Capture an email so sealed letters arrive weekly.
// Only what's needed to write the next letter is stored, and it's erased at the
// end of the nine weeks — by design.
export function MailSubscribe({
  decision,
  cost,
  fear,
  name,
  firstLetter,
}: {
  decision: string;
  cost: string;
  fear: string;
  name: string;
  firstLetter: string;
}) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">(
    getSubscriberId() ? "done" : "idle",
  );
  const [message, setMessage] = useState<string>("");
  const [demoState, setDemoState] = useState<string>("");

  async function subscribe() {
    if (!email.trim()) return;
    setState("sending");
    setMessage("");
    try {
      await subscribeToLetters({ email: email.trim(), decision, cost, fear, name, firstLetter });
      setState("done");
    } catch (err) {
      console.error("Failed to subscribe to mailed letters:", err);
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
      setState("error");
    }
  }

  async function sendNext() {
    const id = getSubscriberId();
    if (!id) return;
    setDemoState("sending");
    try {
      const result = await sendNextLetterNow(id);
      setDemoState(`Sent — ${result}. Check your inbox.`);
    } catch (err) {
      console.error("Failed to send next letter (demo):", err);
      setDemoState(err instanceof Error ? err.message : "Failed to send.");
    }
  }

  if (state === "done") {
    return (
      <div
        className="mx-auto max-w-[640px] rounded-lg border px-5 py-5 text-center"
        style={{ borderColor: "var(--lwi-hairline)", background: "rgba(107,124,110,0.04)" }}
      >
        <p className="text-[0.62rem] uppercase tracking-[0.24em]" style={{ color: "var(--lwi-accent)" }}>
          The letters are sealed
        </p>
        <p className="lwi-serif mt-2 text-[1.05rem] italic" style={{ color: "var(--lwi-text)" }}>
          One will arrive each week. You cannot rush them.
        </p>
        <button
          onClick={sendNext}
          className="mt-4 text-[0.72rem] tracking-wide underline-offset-4 hover:underline"
          style={{ color: "var(--lwi-muted)" }}
        >
          {demoState === "sending" ? "Sending…" : "Demo: deliver my next letter now"}
        </button>
        {demoState && demoState !== "sending" && (
          <p className="mt-2 text-[0.72rem]" style={{ color: "var(--lwi-faint)" }}>
            {demoState}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[640px] rounded-lg border px-5 py-5" style={{ borderColor: "var(--lwi-hairline)" }}>
      <p className="text-[0.62rem] uppercase tracking-[0.24em]" style={{ color: "var(--lwi-accent)" }}>
        Have the letters delivered
      </p>
      <p className="mt-2 text-[0.9rem] leading-relaxed" style={{ color: "var(--lwi-muted)" }}>
        A sealed letter from your future self, mailed once a week. We keep only your
        arc, and erase it the moment the nine weeks end.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className="min-h-[44px] flex-1 rounded-md border bg-transparent px-4 text-[0.95rem] outline-none placeholder:opacity-50"
          style={{ borderColor: "var(--lwi-hairline)", color: "var(--lwi-text)" }}
        />
        <button
          onClick={subscribe}
          disabled={state === "sending" || !email.trim()}
          className="min-h-[44px] rounded-md px-6 text-[0.88rem] font-medium tracking-wide transition-all disabled:cursor-not-allowed disabled:opacity-30"
          style={{ background: "var(--lwi-accent)", color: "#0a0a0a" }}
        >
          {state === "sending" ? "Sealing…" : "Mail my letters"}
        </button>
      </div>
      {state === "error" && (
        <p className="mt-3 text-[0.78rem]" style={{ color: "#9a6b6b" }}>
          {message}
        </p>
      )}
    </div>
  );
}
