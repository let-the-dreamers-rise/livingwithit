import { DISCLAIMER } from "../lib/reflection";

// A letter from your future self — already written, sealed, and waiting. When
// you break the seal it does NOT type out like a machine; it settles onto the
// page like ink that has long since dried, paragraph by paragraph, the way you'd
// take in a letter you're reading for the first time. No cursor, no "AI is
// thinking" — just correspondence, arriving.
export function ReflectionBlock({ text }: { text: string }) {
  const hasDisc = text.includes(DISCLAIMER);
  const body = hasDisc ? text.replace(DISCLAIMER, "").trim() : text.trim();
  const paragraphs = body.split(/\n{2,}/).filter(Boolean);

  // Each paragraph fades in after the one before it, slowly.
  const stagger = 0.5; // seconds between paragraphs
  const total = paragraphs.length * stagger + 1.2;

  return (
    <div className="mx-auto" style={{ maxWidth: 600 }}>
      <div className="space-y-6">
        {paragraphs.map((p, i) => (
          <p
            key={i}
            className="lwi-serif"
            style={{
              color: "var(--lwi-text)",
              lineHeight: 1.85,
              fontSize: "1.12rem",
              fontWeight: 400,
              opacity: 0,
              animation: `lwi-fade-up 1100ms cubic-bezier(0.2,0.6,0.2,1) ${i * stagger}s both`,
            }}
          >
            {i === 0 ? <DropCap text={p} /> : p}
          </p>
        ))}
      </div>

      <div
        className="mx-auto mt-9 mb-5 h-px w-10"
        style={{
          background: "var(--lwi-hairline)",
          opacity: 0,
          animation: `lwi-fade-up 1100ms ease ${total - 0.6}s both`,
        }}
      />
      <p
        className="text-[0.74rem] italic tracking-wide"
        style={{
          color: "var(--lwi-faint)",
          opacity: 0,
          animation: `lwi-fade-up 1100ms ease ${total - 0.4}s both`,
        }}
      >
        {DISCLAIMER}
      </p>
    </div>
  );
}

function DropCap({ text }: { text: string }) {
  if (!text) return null;
  const first = text.charAt(0);
  const rest = text.slice(1);
  return (
    <>
      <span
        className="lwi-serif float-left mr-2"
        style={{
          color: "var(--lwi-accent)",
          fontSize: "3.2rem",
          lineHeight: 0.82,
          fontWeight: 500,
          paddingTop: "0.25rem",
        }}
      >
        {first}
      </span>
      {rest}
    </>
  );
}
