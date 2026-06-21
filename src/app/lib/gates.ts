// ─────────────────────────────────────────────────────────────────────────────
// GATES — the product moat. These enforce LIVING WITH IT's philosophy in code,
// not in a system prompt. A request that fails a gate never reaches the reflection
// engine. This is what makes the instrument refuse to behave like a chatbot.
// ─────────────────────────────────────────────────────────────────────────────

export interface GateReject {
  ok: false;
  label: string;
  reason: string;
  hint: string;
}
export interface GatePass {
  ok: true;
}
export type GateResult = GatePass | GateReject;

const PASS: GatePass = { ok: true };

const norm = (s: string) => s.trim().toLowerCase();
const has = (hay: string, needles: string[]) => needles.some((n) => hay.includes(n));

// ── COMMITMENT GATE (Week 1) ────────────────────────────────────────────────
const HYPOTHETICAL = [
  "thinking about",
  "considering",
  "might",
  "maybe i will",
  "maybe i'll",
  "trying to decide",
  "not sure if",
  "should i",
  "deciding whether",
  "weighing",
  "tempted to",
];
const TRIVIAL = [
  "lunch",
  "movie",
  "netflix",
  "game",
  "restaurant",
  "pizza",
  "coffee",
  "what to eat",
  "dinner",
  "snack",
];

export function commitmentGate(input: string): GateResult {
  const text = norm(input);
  if (text.length < 25) {
    return {
      ok: false,
      label: "COMMITMENT GATE — not accepted",
      reason: "This is too brief to lock a life inside.",
      hint:
        "LIVING WITH IT is for decisions already made. State what you did — not what you're weighing. Example: 'I already resigned from my job.'",
    };
  }
  if (has(text, HYPOTHETICAL)) {
    return {
      ok: false,
      label: "COMMITMENT GATE — not accepted",
      reason: "This still sounds like a decision in motion, not one already made.",
      hint:
        "LIVING WITH IT is for decisions already made. State what you did — not what you're weighing. Example: 'I already resigned from my job.'",
    };
  }
  if (has(text, TRIVIAL)) {
    return {
      ok: false,
      label: "COMMITMENT GATE — not accepted",
      reason: "This instrument is for irreversible choices you must live inside.",
      hint:
        "Name a decision that reshaped your life — a move, a leaving, an ending, a beginning. Not a passing preference.",
    };
  }
  return PASS;
}

// ── RE-LITIGATION GATE (Weeks 2–9) — THE KEY MOAT ───────────────────────────
const RELITIGATE = [
  "did i make a mistake",
  "was i wrong",
  "should i have",
  "regret",
  "undo",
  "go back",
  "reverse",
  "take it back",
  "made the wrong",
  "bad decision",
  "mistake to",
  "if i hadn't",
  "if i hadnt",
  "wish i hadn't",
  "wish i hadnt",
  "was it worth it",
  "did i mess up",
  "second guess",
  "second-guess",
  "am i crazy for",
  "talk me out of",
  "convince me",
  "change my mind",
  "right decision",
  "right choice",
  "wrong choice",
];

export function reLitigationGate(input: string): GateResult {
  if (has(norm(input), RELITIGATE)) {
    return {
      ok: false,
      label: "RE-LITIGATION GATE — closed",
      reason: "This question reopens a door that Week 1 closed.",
      hint:
        "Ask about your inner life INSIDE the choice — not whether you should have chosen differently. Example: 'What part of me went quiet after I committed?'",
    };
  }
  return PASS;
}

// ── DEPTH GATE (Weeks 2–9) ──────────────────────────────────────────────────
const ADVICE = [
  "should i",
  "recommend",
  "what do you think i should",
  "tell me what to do",
  "what to do",
  "help me decide",
  "what would you do",
];
const PREDICTION = [
  "will i",
  "what will happen",
  "is it going to work out",
  "going to work out",
  "will it work",
  "what happens next",
];

export function depthGate(input: string): GateResult {
  const text = norm(input);
  if (text.length < 15) {
    return {
      ok: false,
      label: "DEPTH GATE — reframing required",
      reason: "Too thin to stand inside. Go further in.",
      hint:
        "Probe internal experience, not outcomes. Example: 'What am I grieving that I didn't expect to grieve?'",
    };
  }
  if (has(text, ADVICE)) {
    return {
      ok: false,
      label: "DEPTH GATE — reframing required",
      reason: "This asks for guidance. The instrument gives none.",
      hint:
        "Probe internal experience, not outcomes. Example: 'What am I grieving that I didn't expect to grieve?'",
    };
  }
  if (has(text, PREDICTION)) {
    return {
      ok: false,
      label: "DEPTH GATE — reframing required",
      reason: "This asks for a forecast. There are no predictions here.",
      hint:
        "Probe internal experience, not outcomes. Example: 'What steadiness have I found that I can't yet name?'",
    };
  }
  // Yes/no under 30 chars ending in ?
  if (text.length < 30 && text.endsWith("?")) {
    return {
      ok: false,
      label: "DEPTH GATE — reframing required",
      reason: "A question this small invites a yes or a no. You deserve more.",
      hint:
        "Open it wider. Ask what the choice is doing to you from the inside. Example: 'What part of me has gone quiet?'",
    };
  }
  return PASS;
}

// ── ANTI-COMPARE GATE (Weeks 2–9) ───────────────────────────────────────────
const COMPARE = [
  " or ",
  " vs ",
  "versus",
  "instead of",
  "other option",
  "other path",
  "if i had stayed",
  "what if i",
  "compared to",
  "the other job",
  "stayed instead",
  "the other life",
  "alternate",
  "alternative path",
];

export function antiCompareGate(input: string): GateResult {
  // pad so leading/trailing " or " style tokens still match
  const text = " " + norm(input) + " ";
  if (has(text, COMPARE)) {
    return {
      ok: false,
      label: "ONE FUTURE ONLY",
      reason: "There is no other path to weigh. There is only this one.",
      hint:
        "You are living in the future where you made this choice. Interrogate that life only.",
    };
  }
  return PASS;
}

// Run the three weekly gates in order. Returns the first rejection, or pass.
export function weeklyGates(input: string): GateResult {
  for (const gate of [reLitigationGate, depthGate, antiCompareGate]) {
    const r = gate(input);
    if (!r.ok) return r;
  }
  return PASS;
}
