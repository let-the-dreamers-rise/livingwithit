# Living With It

> **You chose. Now live with it.**  
> Nine weeks. One future. No re-litigation.

A bounded, nine-week reflective instrument for people who **already made an irreversible decision** and cannot stop doubting it.

This is **not a chatbot**. It is a ritual chamber that enforces its philosophy in **code** — input gates refuse re-litigation before any AI runs.

| | |
|---|---|
| **Live demo** | [living-with-it.vercel.app](https://living-with-it.vercel.app) |
| **Figma source** | [Design impactful solution](https://www.figma.com/design/ExHcb6sg0iCGJlKn1QDQNf/Design-impactful-solution) |

---

## The Problem

People don't spiral forever *before* a decision — they spiral **after**. They replay, compare paths, ask *"Did I make a mistake?"*, and reopen the wound weekly.

ChatGPT and similar tools encourage endless re-litigation. They offer second opinions with no boundary.

**Living With It** forbids that loop. You lock the decision once. Weeks 2–9 explore only what it's like to **live inside** that choice — never whether you should have chosen differently.

---

## What It Does

### Four-phase state machine

```
VOID → COMMITMENT → CHAMBER (Weeks 1–9) → TERMINAL
```

| Phase | What happens |
|-------|----------------|
| **Void** | Enter the instrument. Minimal, sacred landing. |
| **Commitment** | Lock an irreversible, past-tense decision. Write a letter to your future self. |
| **Chamber** | Receive weekly letters from your future self across nine temporal vantage points. |
| **Terminal** | Arc complete. Export your Living Record. Begin again. |

The locked decision is **immutable** after commitment — no edit UI exists anywhere in the DOM.

### Input gates (the product moat)

Before any AI call, client-side gates validate every input:

| Gate | Blocks | Example rejected |
|------|--------|------------------|
| **Commitment** | Hypotheticals, trivial choices | *"I'm considering leaving my job"* |
| **Re-Litigation** | Questioning the decision itself | *"Did I make a mistake?"* |
| **Anti-Compare** | Alternate timelines | *"What if I had stayed?"* |
| **Depth** | Shallow one-word prompts | *"Help"* |

If a gate rejects input, **no network request is made**. The user rewrites; the instrument does not negotiate.

### AI reflections

Accepted check-ins generate a single contemplative letter block — first-person future-self voice:

- No chat bubbles, avatars, or typing indicators
- Tone arc by week: disorientation → emerging costs → integration
- **Never** advice, predictions, or validation/invalidation of the decision
- Every reflection ends with: *"One possible internal experience. Not a prediction. Not advice."*

### Export & archive

- **Living Record** — download a `.md` file with decision, all nine weeks, and disclaimers
- **Archive** — completed arcs stored in browser `localStorage` (read-only tombstones)

### Optional email delivery

Subscribers can receive sealed weekly letters by email. Subscriber data lives in Supabase KV and is **erased after nine weeks** — by design.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  React + Vite (client)                                      │
│  ┌─────────────┐    ┌──────────────┐    ┌────────────────┐ │
│  │ useReducer  │───▶│ gates.ts     │───▶│ reflection.ts  │ │
│  │ state machine│    │ (client-side)│    │ fetch / stream │ │
│  └─────────────┘    └──────────────┘    └───────┬────────┘ │
│         │                                        │          │
│         ▼                                        ▼          │
│  localStorage archive              Supabase Edge Function   │
└─────────────────────────────────────┬───────────────────────┘
                                      │
                          ┌───────────▼───────────┐
                          │ Groq Llama 3.3 70B    │
                          │ (ephemeral relay)     │
                          │ stores nothing        │
                          └───────────────────────┘
                                      │
                          ┌───────────▼───────────┐
                          │ Resend (optional)     │
                          │ weekly letter emails  │
                          └───────────────────────┘
```

**Key design choices:**

- **Gates run client-side** — constraints are product logic, not prompt suggestions
- **Edge function is a pure relay** — reflection content is not stored server-side
- **Template fallback** — if Groq or the network fails, a local engine generates tone-arc reflections so demos never break silently

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| UI | shadcn/ui primitives, custom ritual aesthetic |
| State | `useReducer` strict phase machine |
| AI | Groq API (Llama 3.3 70B Versatile) |
| Backend | Supabase Edge Functions (Deno + Hono) |
| Email | Resend API |
| Hosting | Vercel |
| Design | Figma Make export |

---

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── App.tsx              # Root state machine
│   │   ├── components/          # Phase UI + gates panels
│   │   └── lib/
│   │       ├── gates.ts         # Input gate functions (product moat)
│   │       ├── reflection.ts    # AI fetch + template fallback
│   │       ├── weeks.ts         # Week labels & temporal frames
│   │       ├── archive.ts       # localStorage read/write
│   │       ├── export.ts        # Living Record .md download
│   │       └── mail.ts          # Email subscription client
│   └── styles/                  # Theme tokens, fonts, globals
├── supabase/functions/server/
│   ├── index.tsx                # Edge function: reflection + email
│   └── kv_store.tsx             # Subscriber storage (9-week TTL)
├── utils/supabase/info.tsx      # Supabase project ID + anon key
└── vercel.json                  # SPA routing + build config
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install & run

```bash
git clone https://github.com/let-the-dreamers-rise/livingwithit.git
cd livingwithit
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Build for production

```bash
npm run build
npm run preview
```

---

## Environment & Secrets

The frontend uses the Supabase anon key in `utils/supabase/info.tsx` (public, safe for client).

Edge function secrets are set in **Supabase Dashboard → Edge Functions → Secrets**:

| Secret | Required | Purpose |
|--------|----------|---------|
| `GROQ_API_KEY` | Yes | AI letter generation |
| `RESEND_API_KEY` | For email | Weekly letter delivery |
| `LWI_FROM_EMAIL` | Optional | Custom sender (requires verified domain) |
| `CRON_SECRET` | Optional | Protect `/deliver-due` endpoint |

Without `GROQ_API_KEY`, reflections fall back to the local template engine.

---

## Demo Walkthrough

Try these to see gates and AI in action:

1. **Rejected — hypothetical:** `I'm considering leaving my job`
2. **Accepted — lock decision:** `I already resigned from my job last month`
3. **Rejected — re-litigation:** `Did I make a mistake?`
4. **Rejected — comparison:** `What if I had stayed?`
5. **Accepted — introspective:** `What part of me still reaches for the old version of my life?`

Complete all nine weeks to reach **Terminal** state (zero input fields) and export your Living Record.

> **Demo note:** All nine weeks unlock in one session for judges. Production would gate one week per seven days.

---

## Responsible AI

| Risk | Mitigation |
|------|------------|
| Over-reliance on AI as prophecy or therapy | Hard-coded gates; system prompt bans advice/predictions/validation; mandatory disclaimer on every reflection |
| Re-litigation amplification | Re-Litigation and Anti-Compare gates block before the model runs |
| Cloud profiling | Reflection relay stores nothing; archive is localStorage-only |
| Silent API failure | Template fallback always produces a response |

**Human-in-the-loop:** The AI never decides whether the user's choice was right or wrong. Only a human can lock the irreversible decision.

---

## Deployment

### Vercel (frontend)

```bash
npx vercel deploy --prod
```

Or connect the GitHub repo in the Vercel dashboard. `vercel.json` handles SPA rewrites.

### Supabase (edge functions)

Deploy `supabase/functions/server/` as the `make-server-55a1a311` edge function via Supabase CLI or dashboard.

---

## What's Next

- [ ] Verified Resend sending domain (email to any address)
- [ ] Production weekly unlock (one week per seven days)
- [ ] User testing with post-decision cohorts (career, relationship, relocation)

---

## License & Attributions

See [ATTRIBUTIONS.md](./ATTRIBUTIONS.md) for third-party credits.

---

## Built for

USAII Global AI Hackathon 2026 · Productivity track · Life Decision Simulator

**Team:** [let-the-dreamers-rise](https://github.com/let-the-dreamers-rise)
