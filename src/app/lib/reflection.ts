import { projectId, publicAnonKey } from "../../../utils/supabase/info";
import { frameFor } from "./weeks";

// ─────────────────────────────────────────────────────────────────────────────
// REFLECTION ENGINE
// Primary path: a Supabase edge function relays the request to Claude. The server
// stores nothing — it is a pure ephemeral relay, preserving the "no cloud
// profiling" philosophy. If the network or function fails, we fall back silently
// to a local template engine so the instrument always speaks. The reader never
// learns which voice answered.
// ─────────────────────────────────────────────────────────────────────────────

export const DISCLAIMER =
  "One possible internal experience. Not a prediction. Not advice.";

// One prior week, compacted, so the future self can remember the relationship.
export interface PriorWeek {
  label: string;
  question: string;
  reflection: string;
}

export interface ReflectionRequest {
  decision: string;
  cost?: string; // what the decision cost (from the commitment ritual)
  fear?: string; // what the user fears about it (from the commitment ritual)
  name?: string; // what the future self should call them
  letterToFuture?: string; // the letter the user wrote forward at the start
  week: number; // 1..9
  question?: string; // weeks 2..9
  history?: PriorWeek[]; // every prior week — the future self's memory
}

const ENDPOINT = `https://${projectId}.supabase.co/functions/v1/make-server-55a1a311/generate-reflection`;

// Stream the reflection live from Groq, token by token. onDelta receives the
// full accumulated text on every chunk so the UI can render it writing itself.
// On ANY failure it silently falls back to the local template (streamed via a
// gentle word reveal) so a live demo never breaks.
export async function streamReflection(
  req: ReflectionRequest,
  onDelta: (fullText: string) => void
): Promise<string> {
  const frame = frameFor(req.week);
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({
        decision: req.decision,
        cost: req.cost ?? "",
        fear: req.fear ?? "",
        weekNumber: req.week,
        weekLabel: frame.label,
        horizon: frame.horizon,
        question: req.question ?? "",
        history: req.history ?? [],
        stream: true,
      }),
    });
    if (!res.ok || !res.body) {
      const detail = await res.text().catch(() => "");
      console.error(`Streaming reflection failed for week ${req.week}: ${res.status}: ${detail}`);
      throw new Error(`status ${res.status}`);
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let acc = "";
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      acc += decoder.decode(value, { stream: true });
      onDelta(acc);
    }
    const text = acc.trim();
    if (!text) throw new Error("empty stream");
    const final = ensureDisclaimer(text);
    onDelta(final);
    return final;
  } catch (err) {
    console.error(`Falling back to local template (streamed) for week ${req.week}:`, err);
    const full = templateReflection(req);
    // gentle reveal of the fallback so the experience matches
    const tokens = full.split(/(\s+)/);
    let acc = "";
    for (let i = 0; i < tokens.length; i++) {
      acc += tokens[i];
      onDelta(acc);
      // small delay without blocking too long
      await new Promise((r) => setTimeout(r, 14));
    }
    return full;
  }
}

export async function fetchReflection(req: ReflectionRequest): Promise<string> {
  const frame = frameFor(req.week);
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({
        decision: req.decision,
        cost: req.cost ?? "",
        fear: req.fear ?? "",
        name: req.name ?? "",
        letterToFuture: req.letterToFuture ?? "",
        weekNumber: req.week,
        weekLabel: frame.label,
        horizon: frame.horizon,
        question: req.question ?? "",
        history: req.history ?? [],
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(
        `Reflection edge function returned ${res.status} for week ${req.week}: ${detail}`
      );
      throw new Error(`status ${res.status}`);
    }
    const data = (await res.json()) as { reflection?: string; error?: string };
    if (data.error) throw new Error(data.error);
    const text = (data.reflection ?? "").trim();
    if (!text) throw new Error("empty reflection");
    return ensureDisclaimer(text);
  } catch (err) {
    console.error(
      `Falling back to local template reflection for week ${req.week}:`,
      err
    );
    return templateReflection(req);
  }
}

function ensureDisclaimer(text: string): string {
  if (text.includes(DISCLAIMER)) return text;
  return `${text}\n\n${DISCLAIMER}`;
}

// ── Local template fallback ─────────────────────────────────────────────────
// Tone arc: weeks 1–2 disorientation/grief, 3–5 emerging costs, 6–9 integration.
// Never advice, prediction, or validation/invalidation. Future-self voice.

function keyword(decision: string): string {
  const cleaned = decision
    .replace(/^i (already |)/i, "")
    .replace(/\.$/, "")
    .trim();
  // take the verb-phrase core, capped
  const words = cleaned.split(/\s+/).slice(0, 9).join(" ");
  return words || "what I committed to";
}

function qClause(question?: string): string {
  if (!question) return "";
  const q = question.trim().replace(/\?+$/, "").replace(/\.$/, "");
  return q;
}

export function templateReflection(req: ReflectionRequest): string {
  const frame = frameFor(req.week);
  const core = keyword(req.decision);
  const q = qClause(req.question);
  const opener =
    req.week === 1
      ? `One week after I decided to ${core}, the room is quieter than I expected.`
      : `${capitalize(frame.label)}, and I am still the person who decided to ${core}.`;

  const middle = TONE_MIDDLES[Math.min(req.week, 9) - 1];

  const qPara = q
    ? `When I ask what part of me ${softenQuestion(q)}, I notice it isn't a wound that wants closing — it is a room I am learning to live in. I have stopped reaching for the door.`
    : `There is no decision left to make here. Only a life to inhabit, hour by ordinary hour.`;

  const body = [opener, middle, qPara].join("\n\n");
  return `${body}\n\n${DISCLAIMER}`;
}

function softenQuestion(q: string): string {
  // turn the user's question into an internal observation seed
  return q.toLowerCase().startsWith("what")
    ? q.toLowerCase().replace(/^what\s+/, "")
    : q.toLowerCase();
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const TONE_MIDDLES: string[] = [
  // 1 — one week
  "I keep waiting for relief or for ruin, and neither has come. What came instead is a strange flatness, the hum of a house after guests leave. Some part of me has gone quiet — not in grief exactly, but in the way a held breath finally lets go.",
  // 2 — one month
  "The disorientation has a shape now. I move through days that used to belong to another version of me, and I keep finding objects, habits, small loyalties that no longer have a place to land. I am grieving things I never thought to count.",
  // 3 — three months
  "The cost is becoming visible, and it is not the cost I braced for. It is quieter — a friendship that thinned, a confidence that no longer arrives unbidden. I am not calling this regret. I am calling it the weather of a real life.",
  // 4 — six months
  "I have stopped narrating the choice to other people. It has sunk below the surface of how I introduce myself. What remains is the daily texture of it: the mornings, the small competences, the way my body has started to assume this is simply where I live.",
  // 5 — one year
  "A year in, the choice no longer feels like an event. It feels like ground. There are seasons inside it I could not have predicted — stretches of unexpected steadiness, and others where an old self knocks, asks to be let back in, and I quietly do not answer.",
  // 6 — two years
  "The complexity has settled into something I can carry without setting down everything else. I am neither vindicated nor undone. I am someone who made a life out of a single turn, and the life has its own gravity now, its own private mercies.",
  // 7 — five years
  "Five years in, I rarely think of it as a thing I did. It is woven into the people I love, the rooms I return to, the person who answers when my name is called. Whole years have grown on top of it like moss on stone.",
  // 8 — ten years
  "Ten years on, the choice is almost invisible to me — not because it stopped mattering, but because it became the floor I walk on. I have lost the ability to imagine myself without it, and I have stopped trying. The wound, if it was one, is now simply texture.",
  // 9 — a lifetime
  "A lifetime in, there is no neat resolution to hand you, and I find I no longer want one. I lived inside one decision and let it become a life. What I have is not certainty. It is intimacy — with the choice, with the cost, with the quiet ongoing fact of having stayed.",
];
