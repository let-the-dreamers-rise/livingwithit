import { useState } from "react";
import { Lock } from "lucide-react";

// Immutable. There is no edit button — by design. The decision is closed.
export function LockedDecisionBanner({ decision }: { decision: string }) {
  const isLong = decision.length > 120;
  const [expanded, setExpanded] = useState(false);
  const shown = !isLong || expanded ? decision : decision.slice(0, 120).trimEnd() + "…";

  return (
    <div
      className="rounded-md border px-4 py-3"
      style={{
        borderColor: "var(--lwi-hairline)",
        background: "rgba(255,255,255,0.015)",
      }}
    >
      <div className="flex items-center gap-2">
        <Lock size={11} style={{ color: "var(--lwi-accent)" }} />
        <span
          className="text-[0.62rem] uppercase tracking-[0.24em]"
          style={{ color: "var(--lwi-accent)" }}
        >
          Decision locked
        </span>
      </div>
      <p
        className="mt-2 text-[0.92rem] leading-relaxed"
        style={{ color: "var(--lwi-text)" }}
      >
        {shown}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="mt-1 text-[0.72rem] underline-offset-2 hover:underline"
          style={{ color: "var(--lwi-muted)" }}
        >
          {expanded ? "Show less" : "Show full decision"}
        </button>
      )}
    </div>
  );
}
