import type { GateReject } from "../lib/gates";

// The refusal made visible. Not angry red — dark, serious, a closed door.
export function GatePanel({ reject }: { reject: GateReject }) {
  return (
    <div
      role="alert"
      className="lwi-fade mt-5 rounded-md border px-5 py-4"
      style={{
        borderColor: "var(--lwi-gate-border)",
        background: "var(--lwi-gate-bg)",
      }}
    >
      <p
        className="text-[0.7rem] uppercase tracking-[0.22em]"
        style={{ color: "#9a6b6b" }}
      >
        {reject.label}
      </p>
      <p className="mt-2 text-[0.95rem]" style={{ color: "var(--lwi-text)" }}>
        {reject.reason}
      </p>
      <p
        className="mt-3 text-[0.85rem] leading-relaxed"
        style={{ color: "var(--lwi-muted)" }}
      >
        {reject.hint}
      </p>
    </div>
  );
}
