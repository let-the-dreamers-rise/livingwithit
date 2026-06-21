import { useState } from "react";

// Before the future self answers, the user writes a letter FORWARD — to whoever
// they are becoming. This is what makes the reply land: the future self is
// answering a letter you actually wrote. A short sealing beat plays on send.
export function WriteToFuture({
  name,
  onSeal,
}: {
  name: string;
  onSeal: (letter: string) => void;
}) {
  const [value, setValue] = useState("");
  const [sealing, setSealing] = useState(false);

  function seal() {
    if (value.trim().length < 10 || sealing) return;
    setSealing(true);
    // a held beat — the letter folding, the seal pressed — then it is sent
    window.setTimeout(() => onSeal(value.trim()), 1400);
  }

  if (sealing) {
    return (
      <div
        className="flex min-h-screen w-full flex-col items-center justify-center px-6"
        style={{ background: "var(--lwi-void)" }}
      >
        <div className="lwi-seal-break" style={{ width: 64 }}>
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full"
            style={{ background: "var(--lwi-accent-soft)" }}
          >
            <div className="h-9 w-9 rounded-full" style={{ background: "var(--lwi-accent)" }} />
          </div>
        </div>
        <p className="mt-8 lwi-serif text-[1.1rem] italic" style={{ color: "var(--lwi-text)" }}>
          Your letter is sealed and sent forward.
        </p>
        <p className="mt-2 text-[0.8rem]" style={{ color: "var(--lwi-faint)" }}>
          Your future self has begun to answer…
        </p>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-full w-full flex-col items-center px-6 py-16"
      style={{ background: "var(--lwi-void)" }}
    >
      <div className="lwi-fade mx-auto w-full max-w-[600px]">
        <p className="text-[0.68rem] uppercase tracking-[0.24em]" style={{ color: "var(--lwi-accent)" }}>
          Before the first letter
        </p>
        <h2
          className="lwi-serif mt-4"
          style={{ color: "var(--lwi-text)", fontSize: "clamp(1.7rem, 5vw, 2.3rem)", lineHeight: 1.2, fontWeight: 500 }}
        >
          Write to the one you're becoming.
        </h2>
        <p className="mt-4 text-[0.92rem] leading-relaxed" style={{ color: "var(--lwi-muted)" }}>
          A letter to your future self, the one already living inside this choice.
          Tell them what you're carrying right now. They will write back —
          across one week, one year, a lifetime.
        </p>

        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={8}
          placeholder={name ? `Dear future ${name},` : "Dear future me,"}
          className="mt-7 w-full resize-none rounded-md border bg-transparent px-4 py-3.5 text-[1rem] leading-relaxed outline-none placeholder:opacity-50"
          style={{ borderColor: "var(--lwi-hairline)", color: "var(--lwi-text)" }}
          autoFocus
        />

        <button
          onClick={seal}
          disabled={value.trim().length < 10}
          className="mt-7 min-h-[48px] w-full rounded-md px-6 py-3.5 text-[0.92rem] font-medium tracking-wide transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-30"
          style={{ background: "var(--lwi-accent)", color: "#0a0a0a" }}
        >
          Seal and send it forward
        </button>
        <p className="mt-4 text-center text-[0.76rem]" style={{ color: "var(--lwi-faint)" }}>
          You will not be able to edit this letter once it is sent.
        </p>
      </div>
    </div>
  );
}
