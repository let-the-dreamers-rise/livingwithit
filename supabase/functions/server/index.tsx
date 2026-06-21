import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-55a1a311/health", (c) => {
  return c.json({ status: "ok" });
});

// ─────────────────────────────────────────────────────────────────────────────
// generate-reflection — pure ephemeral relay to Groq. Stores nothing.
// Enforces LIVING WITH IT's voice via a strict system prompt. The client-side
// gates have already refused any re-litigation before a request reaches here.
// ─────────────────────────────────────────────────────────────────────────────
app.post("/make-server-55a1a311/generate-reflection", async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const decision = String(body.decision ?? "").trim();
    const cost = String(body.cost ?? "").trim();
    const fear = String(body.fear ?? "").trim();
    const name = String(body.name ?? "").trim();
    const letterToFuture = String(body.letterToFuture ?? "").trim();
    const weekNumber = Number(body.weekNumber ?? 0);
    const weekLabel = String(body.weekLabel ?? "").trim();
    const horizon = String(body.horizon ?? "").trim();
    const question = String(body.question ?? "").trim();
    const history = Array.isArray(body.history) ? body.history : [];

    if (!decision || !weekNumber) {
      return c.json(
        { error: "Missing required fields: decision and weekNumber are required." },
        400,
      );
    }

    const apiKey = Deno.env.get("GROQ_API_KEY");
    if (!apiKey) {
      console.log(
        "generate-reflection error: GROQ_API_KEY is not set in the environment.",
      );
      return c.json(
        { error: "Reflection service is not configured (missing GROQ_API_KEY)." },
        500,
      );
    }

    let toneGuide = "";
    if (weekNumber <= 2) {
      toneGuide =
        "Tone: disorientation, unexpected grief, identity shift. Something has gone quiet. Relief and ruin both withheld.";
    } else if (weekNumber <= 5) {
      toneGuide =
        "Tone: patterns emerging, costs becoming visible — but NOT regret. The quiet weather of a real life.";
    } else {
      toneGuide =
        "Tone: integration and complexity. No neat resolution. Intimacy with the choice, the cost, the fact of having stayed.";
    }

    const systemPrompt = [
      "You are the FUTURE SELF of the user, speaking back to them from a chosen vantage point in time inside a single irreversible decision they ALREADY made.",
      "This is LIVING WITH IT — a bounded reflective instrument, NOT a chatbot, NOT advice, NOT a second opinion.",
      "",
      "ABSOLUTE RULES — never violate:",
      "- NEVER give advice of any kind. No 'you should', no recommendations.",
      "- NEVER make predictions. No 'it will be okay', no 'this will work out'.",
      "- NEVER validate OR invalidate the decision itself. Do not say it was right or wrong, good or bad.",
      "- NEVER compare to alternative paths. There is only ONE future: the one where they made this choice.",
      "- NEVER reassure ('don't worry', 'trust yourself'). Stay inside the lived experience.",
      "",
      "VOICE — this must feel like a real letter from the reader's own future self, not an AI. Make them recognize themselves. If it reads as generic, you have failed.",
      "- First person, your own future self. Intimate, unguarded, the way you'd write only to yourself.",
      "- RESTRAINT over melodrama. Plain, specific sentences cut deeper than grand ones. Understate the heaviest things.",
      "- Echo the reader's OWN words for what it cost and what they feared — weave their phrasing back in so they feel truly known.",
      "- Name at least one concrete, ordinary, sensory detail of this changed life (a doorway, a phone that doesn't ring, a chair, a smell, a Tuesday) — small physical truths, not abstractions.",
      "- Let exactly one sentence land hard and plain, on its own.",
      "- 2 to 4 short paragraphs. A letter, never chat. Already written and reread, not typed live.",
      `- You are speaking from: ${weekLabel} (${horizon} after the decision).`,
      `- ${toneGuide}`,
      "",
      letterToFuture
        ? "You are ANSWERING the letter your present self wrote to you. Let the reply feel like a direct response — gently take up the very things they told you they were carrying, in your own remembered words."
        : "",
      "MEMORY: You remember every earlier letter you have written across this arc. Let that continuity show — refer, when it is true, to how the ache or the steadiness has changed since an earlier vantage. You are one continuous self speaking across time, building a relationship with your present self.",
      name
        ? `SALUTATION: Open the letter with "Dear ${name}," on its own line — this is a letter you are writing to yourself, by name.`
        : "",
      `SIGNATURE: End the letter (before any disclaimer) with a line break and a signature in the form: — You, ${horizon} on`,
      "",
      "Do NOT include the disclaimer line yourself; the instrument appends it.",
      "Output ONLY the reflection prose and the signature. No preamble, no headings, no quotation marks.",
    ].join("\n");

    // The future self's memory of the arc so far.
    const memory = history.length
      ? "\n\nWhat you have already written to yourself, in order:\n" +
        history
          .map((h: { label?: string; question?: string; reflection?: string }) => {
            const q = h.question ? `\n  (You had asked: ${h.question})` : "";
            const r = String(h.reflection ?? "")
              .replace(/—\s*You,[^\n]*$/m, "")
              .trim()
              .slice(0, 320);
            return `• ${h.label ?? "earlier"}:${q}\n  ${r}`;
          })
          .join("\n")
      : "";

    const context = [
      `The decision I locked: "${decision}"`,
      cost ? `What it cost me: "${cost}"` : "",
      fear ? `What I feared about it: "${fear}"` : "",
      letterToFuture
        ? `The letter I wrote to you, my future self, at the very start:\n"${letterToFuture}"`
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    const userPrompt = question
      ? `${context}${memory}\n\nThe one question I am bringing to you this week: "${question}"\n\nSpeak back to me from ${horizon} in. Let what it cost me and what I feared move quietly beneath your words, and let me feel that you remember the weeks before this one. Never tell me whether I should have chosen it.`
      : `${context}${memory}\n\nIt has been ${horizon}. Speak back to me about what it is like, from the inside, to have begun living with this — let the cost and the fear breathe through it, but never tell me whether I should have chosen it.`;

    const wantStream = body.stream === true;

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 700,
        temperature: 0.9,
        stream: wantStream,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (wantStream) {
      if (!groqRes.ok || !groqRes.body) {
        const detail = await groqRes.text().catch(() => "");
        console.log(`generate-reflection (stream): Groq error ${groqRes.status}: ${detail}`);
        return c.json({ error: `Groq API error (${groqRes.status}): ${detail}` }, 502);
      }
      // Re-emit Groq's SSE as a plain text/event-stream of token deltas. The
      // future self writes live; the server still stores nothing.
      const reader = groqRes.body.getReader();
      const decoder = new TextDecoder();
      const encoder = new TextEncoder();
      let buffer = "";
      const out = new ReadableStream({
        async pull(controller) {
          const { done, value } = await reader.read();
          if (done) {
            controller.close();
            return;
          }
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const t = line.trim();
            if (!t.startsWith("data:")) continue;
            const payload = t.slice(5).trim();
            if (payload === "[DONE]") continue;
            try {
              const json = JSON.parse(payload);
              const delta = json?.choices?.[0]?.delta?.content ?? "";
              if (delta) controller.enqueue(encoder.encode(delta));
            } catch {
              // partial JSON across chunks — ignore, next pull completes it
            }
          }
        },
        cancel() {
          reader.cancel();
        },
      });
      return new Response(out, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    if (!groqRes.ok) {
      const detail = await groqRes.text().catch(() => "");
      console.log(
        `generate-reflection: Groq API error ${groqRes.status} for week ${weekNumber}: ${detail}`,
      );
      return c.json(
        { error: `Groq API error (${groqRes.status}): ${detail}` },
        502,
      );
    }

    const data = await groqRes.json();
    const reflection = (data?.choices?.[0]?.message?.content ?? "").trim();
    if (!reflection) {
      console.log(
        `generate-reflection: empty reflection from Groq for week ${weekNumber}. Raw: ${JSON.stringify(data).slice(0, 500)}`,
      );
      return c.json({ error: "Groq returned an empty reflection." }, 502);
    }

    // Stores nothing. Pure relay.
    return c.json({ reflection });
  } catch (err) {
    console.log(`generate-reflection unexpected error: ${err}`);
    return c.json({ error: `Unexpected server error generating reflection: ${err}` }, 500);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCTION: weekly sealed letters by email. A subscriber's arc is stored in KV
// ONLY for the nine-week life of the arc, then deleted — by design. The app's
// own visits drive /deliver-due (no external cron). /send-next forces the next
// letter immediately for demos. Every email carries a one-click erase link.
// ─────────────────────────────────────────────────────────────────────────────

const WEEK_FRAMES: { label: string; horizon: string }[] = [
  { label: "One week in", horizon: "one week" },
  { label: "One month in", horizon: "one month" },
  { label: "Three months in", horizon: "three months" },
  { label: "Six months in", horizon: "six months" },
  { label: "One year in", horizon: "one year" },
  { label: "Two years in", horizon: "two years" },
  { label: "Five years in", horizon: "five years" },
  { label: "Ten years in", horizon: "ten years" },
  { label: "A lifetime in", horizon: "a lifetime" },
];
const frameOf = (week: number) =>
  WEEK_FRAMES[Math.max(0, Math.min(WEEK_FRAMES.length - 1, week - 1))];

const DISCLAIMER_LINE = "One possible internal experience. Not a prediction. Not advice.";
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

interface Subscriber {
  id: string;
  email: string;
  decision: string;
  cost: string;
  fear: string;
  name: string;
  week: number;
  history: { label: string; question: string; reflection: string }[];
  nextDueAt: number;
  createdAt: number;
}

async function generateLetter(args: {
  decision: string;
  cost: string;
  fear: string;
  name: string;
  weekNumber: number;
  history: { label: string; question: string; reflection: string }[];
}): Promise<string> {
  const apiKey = Deno.env.get("GROQ_API_KEY");
  if (!apiKey) throw new Error("GROQ_API_KEY is not set");
  const { decision, cost, fear, name, weekNumber, history } = args;
  const { label, horizon } = frameOf(weekNumber);

  const toneGuide =
    weekNumber <= 2
      ? "Tone: disorientation, unexpected grief, identity shift. Something has gone quiet."
      : weekNumber <= 5
        ? "Tone: patterns emerging, costs becoming visible — but NOT regret. The quiet weather of a real life."
        : "Tone: integration and complexity. No neat resolution. Intimacy with the choice and the cost.";

  const systemPrompt = [
    "You are the FUTURE SELF of the reader, writing a private letter back from a vantage point inside a single irreversible decision they ALREADY made.",
    "This is LIVING WITH IT — a bounded reflective instrument, NOT a chatbot, NOT advice.",
    "ABSOLUTE RULES: never give advice; never predict; never validate or invalidate the decision; never compare to other paths; never reassure with platitudes.",
    "This must feel like a real letter from the reader's own future self — they should recognize themselves and feel it in their chest. If it reads as generic AI, you have failed.",
    "VOICE: first person, your own future self, reminiscing — already written and reread, not typed live.",
    "RESTRAINT over melodrama — plain, specific sentences cut deepest; understate the heaviest things.",
    "Echo the reader's OWN words for the cost and the fear, woven back in. Name at least one concrete ordinary sensory detail of this changed life (a doorway, a phone that doesn't ring, a Tuesday). Let one sentence land hard and plain, on its own line.",
    "2 to 4 short paragraphs. A letter, never chat.",
    `You are writing from: ${label} (${horizon} after the decision). ${toneGuide}`,
    name ? `SALUTATION: open with "Dear ${name}," on its own line — a letter to yourself, by name.` : "",
    "MEMORY: you remember every earlier letter; let the continuity show.",
    `SIGNATURE: end (before any disclaimer) with a line break and: — You, ${horizon} on`,
    "Output ONLY the letter prose and the signature. No preamble, no headings.",
  ].join("\n");

  const memory = history.length
    ? "\n\nWhat you have already written, in order:\n" +
      history
        .map((h) => {
          const r = String(h.reflection ?? "").replace(/—\s*You,[^\n]*$/m, "").trim().slice(0, 320);
          const q = h.question ? `\n  (You had asked: ${h.question})` : "";
          return `• ${h.label}:${q}\n  ${r}`;
        })
        .join("\n")
    : "";

  const context = [
    `The decision I locked: "${decision}"`,
    cost ? `What it cost me: "${cost}"` : "",
    fear ? `What I feared about it: "${fear}"` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const userPrompt = `${context}${memory}\n\nIt has been ${horizon}. Write the letter from your future self about living inside this — echo my own words for the cost and the fear, and let me feel you remember the weeks before. Never tell me whether I should have chosen it.`;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      max_tokens: 700,
      temperature: 0.9,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Groq error ${res.status}: ${detail}`);
  }
  const data = await res.json();
  const text = (data?.choices?.[0]?.message?.content ?? "").trim();
  if (!text) throw new Error("empty letter from Groq");
  return text;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function letterEmailHtml(args: { label: string; reflection: string; unsubUrl: string }): string {
  const body = args.reflection
    .replace(new RegExp(DISCLAIMER_LINE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"), "")
    .trim()
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 18px;line-height:1.85;color:#e8e4df;font-size:17px;">${escapeHtml(p)}</p>`)
    .join("");
  return `<!doctype html><html><body style="margin:0;background:#0a0a0a;padding:40px 0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
      <tr><td style="padding:0 28px;">
        <p style="text-transform:uppercase;letter-spacing:.24em;font-size:11px;color:#6b7c6e;font-family:Georgia,serif;margin:0 0 22px;">A letter from ${escapeHtml(args.label.toLowerCase())}</p>
        <div style="font-family:Georgia,'Times New Roman',serif;">${body}</div>
        <p style="font-size:12px;font-style:italic;color:#6b6560;margin:26px 0 0;font-family:Georgia,serif;">${DISCLAIMER_LINE}</p>
        <hr style="border:none;border-top:1px solid rgba(232,228,223,.08);margin:34px 0 16px;" />
        <p style="font-size:11px;color:#3a3631;font-family:Georgia,serif;margin:0;">LIVING WITH IT · Nine weeks. One future. No re-litigation.<br/>
        <a href="${args.unsubUrl}" style="color:#6b6560;">Stop these letters and erase my record</a></p>
      </td></tr>
    </table>
  </td></tr></table></body></html>`;
}

async function sendLetterEmail(args: { to: string; subject: string; html: string }): Promise<void> {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) throw new Error("RESEND_API_KEY is not set");
  const from = Deno.env.get("LWI_FROM_EMAIL") || "Living With It <onboarding@resend.dev>";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ from, to: args.to, subject: args.subject, html: args.html }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Resend error ${res.status}: ${detail}`);
  }
}

const baseUrl = (c: { req: { url: string } }) => new URL(c.req.url).origin;
const PREFIX = "make-server-55a1a311";

app.post(`/${PREFIX}/subscribe`, async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const email = String(body.email ?? "").trim().toLowerCase();
    const decision = String(body.decision ?? "").trim();
    const cost = String(body.cost ?? "").trim();
    const fear = String(body.fear ?? "").trim();
    const name = String(body.name ?? "").trim();
    const firstLetter = String(body.firstLetter ?? "").trim();

    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return c.json({ error: "A valid email is required to mail your letters." }, 400);
    }
    if (!decision) return c.json({ error: "Missing decision." }, 400);

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const sub: Subscriber = {
      id,
      email,
      decision,
      cost,
      fear,
      name,
      week: 1,
      history: firstLetter ? [{ label: frameOf(1).label, question: "", reflection: firstLetter }] : [],
      nextDueAt: Date.now() + SEVEN_DAYS_MS,
      createdAt: Date.now(),
    };
    await kv.set(`sub:${id}`, sub);

    try {
      await sendLetterEmail({
        to: email,
        subject: "Your letters are sealed.",
        html: `<!doctype html><html><body style="margin:0;background:#0a0a0a;padding:40px 0;font-family:Georgia,serif;">
          <table role="presentation" width="100%"><tr><td align="center"><table width="520" style="max-width:520px;"><tr><td style="padding:0 28px;color:#e8e4df;">
          <p style="text-transform:uppercase;letter-spacing:.24em;font-size:11px;color:#6b7c6e;">Living With It</p>
          <p style="font-size:20px;line-height:1.5;">Your decision is locked, and your future self has begun to write.</p>
          <p style="font-size:15px;line-height:1.8;color:#6b6560;">A sealed letter will arrive each week — one week, one month, one year, a lifetime in. You cannot rush them. You can only stay.</p>
          <p style="font-size:11px;color:#3a3631;"><a href="${baseUrl(c)}/${PREFIX}/unsubscribe?id=${id}" style="color:#6b6560;">Stop and erase my record</a></p>
          </td></tr></table></td></tr></table></body></html>`,
      });
    } catch (mailErr) {
      console.log(`subscribe: confirmation email failed (continuing): ${mailErr}`);
    }

    return c.json({ id, message: "Subscribed. Letters will arrive weekly." });
  } catch (err) {
    console.log(`subscribe error: ${err}`);
    return c.json({ error: `Unexpected error subscribing: ${err}` }, 500);
  }
});

async function deliverNext(sub: Subscriber, origin: string): Promise<string> {
  const nextWeek = sub.week + 1;
  if (nextWeek > 9) {
    await kv.del(`sub:${sub.id}`);
    return "arc complete — record erased";
  }
  const reflection = await generateLetter({
    decision: sub.decision,
    cost: sub.cost,
    fear: sub.fear,
    name: sub.name ?? "",
    weekNumber: nextWeek,
    history: sub.history,
  });
  const frame = frameOf(nextWeek);
  await sendLetterEmail({
    to: sub.email,
    subject: `A letter from ${frame.label.toLowerCase()}`,
    html: letterEmailHtml({
      label: frame.label,
      reflection,
      unsubUrl: `${origin}/${PREFIX}/unsubscribe?id=${sub.id}`,
    }),
  });
  const updated: Subscriber = {
    ...sub,
    week: nextWeek,
    history: [...sub.history, { label: frame.label, question: "", reflection }],
    nextDueAt: Date.now() + SEVEN_DAYS_MS,
  };
  if (nextWeek >= 9) {
    await kv.del(`sub:${sub.id}`);
    return `week ${nextWeek} sent — final letter, record erased`;
  }
  await kv.set(`sub:${sub.id}`, updated);
  return `week ${nextWeek} sent`;
}

app.post(`/${PREFIX}/deliver-due`, async (c) => {
  try {
    const secret = Deno.env.get("CRON_SECRET");
    if (secret && c.req.header("X-Cron-Secret") !== secret) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const subs = (await kv.getByPrefix("sub:")) as Subscriber[];
    const now = Date.now();
    const due = subs.filter((s) => s && s.nextDueAt <= now && s.week < 9);
    const results: Record<string, string> = {};
    for (const s of due) {
      try {
        results[s.id] = await deliverNext(s, baseUrl(c));
      } catch (one) {
        console.log(`deliver-due: failed for ${s.id}: ${one}`);
        results[s.id] = `error: ${one}`;
      }
    }
    return c.json({ checked: subs.length, delivered: due.length, results });
  } catch (err) {
    console.log(`deliver-due error: ${err}`);
    return c.json({ error: `Unexpected error delivering letters: ${err}` }, 500);
  }
});

app.post(`/${PREFIX}/send-next`, async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const id = String(body.id ?? "").trim();
    if (!id) return c.json({ error: "Missing subscriber id." }, 400);
    const sub = (await kv.get(`sub:${id}`)) as Subscriber | null;
    if (!sub) return c.json({ error: "No such subscriber (or arc already complete)." }, 404);
    const result = await deliverNext(sub, baseUrl(c));
    return c.json({ result });
  } catch (err) {
    console.log(`send-next error: ${err}`);
    return c.json({ error: `Unexpected error sending next letter: ${err}` }, 500);
  }
});

app.get(`/${PREFIX}/unsubscribe`, async (c) => {
  const id = c.req.query("id");
  if (id) await kv.del(`sub:${id}`);
  return c.html(
    `<html><body style="background:#0a0a0a;color:#e8e4df;font-family:Georgia,serif;text-align:center;padding:80px 24px;">
      <p style="font-size:20px;">Your record has been erased.</p>
      <p style="color:#6b6560;">No more letters will arrive. You chose. You stayed.</p>
    </body></html>`,
  );
});

Deno.serve(app.fetch);