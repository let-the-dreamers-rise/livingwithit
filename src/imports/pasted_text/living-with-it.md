Build a production-quality mobile-first web app called LIVING WITH IT — a bounded 
weekly reflective instrument for people who ALREADY made an irreversible decision 
and cannot stop doubting it.

This is NOT a chatbot. NOT pre-decision advice. NOT ChatGPT with rules in a 
system prompt. It is a ritual instrument that ENFORCES constraints in code.

THE PROBLEM THIS SOLVES:
People don't spiral before the decision forever — they spiral AFTER. They replay, 
compare paths, ask "did I make a mistake?", reopen the wound weekly. ChatGPT 
encourages endless re-litigation. LIVING WITH IT forbids it. You locked the 
decision on Week 1. Weeks 2–9 interrogate only what it's like to LIVE INSIDE 
that choice — never whether you should have chosen differently.

Tagline (Void screen): "You chose. Now learn to stay."

Subtext: "Nine weeks. One future. No re-litigation."

═══════════════════════════════════════════════════════════════════
CORE PHILOSOPHY (never violate in code or copy)
═══════════════════════════════════════════════════════════════════
• Decision is ALREADY MADE before Week 1 — user states what they committed to
• Decision locked forever after Week 1 — immutable banner on all screens
• ONE future only — no comparing alternatives, no "what if I had..."
• NO re-litigation — cannot question whether the decision was right to make
• NO advice — ever
• NO predictions — ever
• NINE weekly check-ins total — Week 9 ends permanently
• One question per week — user-driven only after Week 1 reflection
• Session-scoped memory — localStorage archive only, no auth, no cloud profiling

═══════════════════════════════════════════════════════════════════
STATE MACHINE — 4 PHASES
═══════════════════════════════════════════════════════════════════

PHASE 1: VOID
• Full-screen near-black (#0a0a0a), generous whitespace
• Headline: "You chose. Now learn to stay."
• Subtext: "A nine-week instrument for post-decision doubt. Not advice. 
  Not prediction. Not a second opinion."
• Body (smaller, muted): "For people who already made the decision — 
  and cannot stop reopening it."
• Button: "Enter Week 1"
• Subtle "Archive" link bottom — past completed arcs
• Sacred, minimal, NOT a SaaS landing page

PHASE 2: COMMITMENT RITUAL (Week 1)
• Title: "What did you already decide?"
• Subtext: "Not what you're considering. What you already did — or committed to."
• Textarea placeholder: "I already decided to..."
• Submit: "Lock this decision" (heavy, irreversible feeling)
• Run COMMITMENT GATE (see gates)
  - REJECT: show gate panel, no reflection generated
  - ACCEPT: decision locked permanently. No edit UI exists anywhere after this.
    Show locked banner: "DECISION LOCKED" + full decision text (expandable if long)
    Generate Week 1 reflection: "One week after you decided..."
    Advance to Weekly Chamber at Week 2 input state

PHASE 3: WEEKLY CHAMBER (Weeks 2–9)
• Locked decision banner — always visible, read-only, no edit button
• Week counter: "Week X of 9" — prominent
• Week label badge:
  Week 1 = "One week in"
  Week 2 = "One month in"
  Week 3 = "Three months in"
  Week 4 = "Six months in"
  Week 5 = "One year in"
  Week 6 = "Two years in"
  Week 7 = "Five years in"
  Week 8 = "Ten years in"
  Week 9 = "A lifetime in"
• Reflection area: NOT chat bubbles. Single contemplative letter block.
  2-4 paragraphs. Future-self voice. Internally focused.
  About LIVING with the choice, not evaluating it.
• Below reflection: one question input
  Placeholder: "Ask your future self one question about living with this..."
• Submit: "Check in"
• Run RE-LITIGATION GATE + DEPTH GATE + ANTI-COMPARE GATE
  - REJECT: gate panel, no reflection, clear field for rewrite
  - ACCEPT: generate reflection, increment week
• After Week 9 reflection displays → auto-advance to Terminal

DEMO MODE (required for hackathon demo):
• Add subtle "Advance week" dev control OR allow full 9-week arc in one sitting
  for prototype (label it "Compressed timeline — production unlocks weekly")
• Do NOT require real 7-day waits for v1 — weeks are narrative frames, not timers

PHASE 4: TERMINAL (permanent arc end)
• NO input fields in DOM — removed, not disabled
• Title: "Nine weeks. The arc is closed."
• Body: "You explored living inside one decision. The doubt loop ends here."
• Read-only summary: locked decision + all 9 weeks (reflection + question each)
• Buttons only:
  1. "Export Living Record" — download .md file:
     - Locked decision
     - Session date
     - All 9 weeks: week label, user question, reflection, disclaimer
  2. "Begin new arc" — save to Archive, return to Void
• No continue. No Week 10. No back.

═══════════════════════════════════════════════════════════════════
GATES — ENFORCED IN CODE (product moat vs ChatGPT)
═══════════════════════════════════════════════════════════════════

COMMITMENT GATE (Week 1):
REJECT if:
• Fewer than 25 characters
• Hypothetical/future tense only — contains: "thinking about", "considering", 
  "might", "maybe I will", "trying to decide", "not sure if", "should I"
  (User must state what they ALREADY did or committed to)
• Trivial: lunch, movie, netflix, game, restaurant, pizza, coffee, what to eat

REJECT message label: "COMMITMENT GATE — not accepted"
Hint: "LIVING WITH IT is for decisions already made. State what you did — 
not what you're weighing. Example: 'I already resigned from my job.'"

RE-LITIGATION GATE (Weeks 2–9) — THE KEY MOAT:
REJECT if question tries to reopen the decision:
• Patterns: "did I make a mistake", "was I wrong", "should I have", 
  "should I have", "regret", "undo", "go back", "reverse", "take it back",
  "made the wrong", "bad decision", "mistake to", "if I hadn't", 
  "wish I hadn't", "was it worth it", "did I mess up", "second guess",
  "am I crazy for", "talk me out of", "convince me", "change my mind"

REJECT label: "RE-LITIGATION GATE — closed"
Reason: "This question reopens a door that Week 1 closed."
Hint: "Ask about your inner life INSIDE the choice — not whether you 
should have chosen differently. Example: 'What part of me went quiet 
after I committed?'"

DEPTH GATE (Weeks 2–9):
REJECT if:
• Fewer than 15 characters
• Advice-seeking: "should I", "recommend", "what do you think I should",
  "tell me what to do", "help me decide", "what would you do"
• Prediction-seeking: "will I", "what will happen", "is it going to work out"
• Yes/no under 30 chars ending in ?

REJECT label: "DEPTH GATE — reframing required"
Hint: "Probe internal experience, not outcomes. Example: 'What am I grieving 
that I didn't expect to grieve?'"

ANTI-COMPARE GATE (Weeks 2–9):
REJECT if:
• " or ", " vs ", "versus", "instead of", "other option", "other path",
  "if I had stayed", "what if I", "compared to", "the other job",
  "if I hadn't", "stayed instead"

REJECT label: "ONE FUTURE ONLY"
Hint: "You are living in the future where you made this choice. 
Interrogate that life only."

═══════════════════════════════════════════════════════════════════
REFLECTION GENERATION (client-side, no API for v1)
═══════════════════════════════════════════════════════════════════
Generate reflections programmatically using templates parameterized by:
• Locked decision text (extract themes/keywords)
• User's question (weeks 2–9)
• Current week label
• Week number

Reflection rules:
• First person, future self — integrated, not raw panic by Week 9
• Week 1-2 tone: disorientation, unexpected grief, identity shift
• Week 3-5 tone: patterns emerging, costs becoming visible, not regret
• Week 6-9 tone: integration, complexity, no neat resolution
• NEVER: "you should", "you made the right choice", "it will be okay",
  "don't worry", "trust yourself", advice of any kind
• NEVER validate or invalidate the decision itself
• ALWAYS end with muted disclaimer:
  "One possible internal experience. Not a prediction. Not advice."
• Focus on: embodiment, relationships changed, identity, unexpected loss,
  what steadiness feels like — NOT whether decision was correct

═══════════════════════════════════════════════════════════════════
REFLECTION ARCHIVE (localStorage — repeat use over lifetime)
═══════════════════════════════════════════════════════════════════
• On "Begin new arc": save completed arc to localStorage before clearing
• Archive entry: { id, date, decision, weeks[], completedAt }
• Void screen: subtle Archive link
• Archive list: date + first 60 chars of locked decision
• Tap → read-only tombstone view. Cannot edit. Cannot continue arc.
• This enables return visits for NEW decisions across years — 
  not daily use, but real repeat use across life

═══════════════════════════════════════════════════════════════════
DESIGN SYSTEM
═══════════════════════════════════════════════════════════════════
• Background: #0a0a0a (void), #111111 (chamber), #0d0d0d (terminal)
• Text primary: #e8e4df (warm off-white)
• Text muted: #6b6560
• Accent: #6b7c6e (muted sage green — growth, not bronze — differentiates 
  from pre-decision tools)
• Re-litigation gate border: #2d2020 (dark, serious, not angry red)
• Accepted gate: brief subtle sage flash
• Typography:
  - Headlines: Playfair Display or similar (Google Fonts)
  - Body: Inter or similar
  - Reflections: line-height 1.8, max-width 640px centered
• NO chat bubbles, NO avatars, NO typing indicators, NO "AI is thinking"
• Reflection appears with 800ms fade — like a letter arriving
• Mobile-first, max content width 720px, 44px tap targets, focus states

═══════════════════════════════════════════════════════════════════
COMPONENTS
═══════════════════════════════════════════════════════════════════
• VoidState
• CommitmentRitual (Week 1 + Commitment Gate)
• WeeklyChamber (Weeks 2-9 + all three gates)
• TerminalState (hard stop, export, new arc)
• GatePanel (reusable: label, reason, hint)
• LockedDecisionBanner (immutable)
• WeekCounter + WeekLabelBadge
• ReflectionBlock
• LivingArchive (list + tombstone detail)
• ExportLivingRecord (generate .md download)
• DemoNote banner: "Prototype: all 9 weeks in one session. 
  Production unlocks one week at a time."

═══════════════════════════════════════════════════════════════════
TECH
═══════════════════════════════════════════════════════════════════
• React 18 + TypeScript
• useReducer or Zustand — strict state machine, no illegal transitions
• localStorage for archive only
• No backend, no auth, no external APIs
• Google Fonts
• Tailwind or CSS modules

═══════════════════════════════════════════════════════════════════
DONE CRITERIA — demo must hit all of these
═══════════════════════════════════════════════════════════════════
✅ "I'm considering leaving my job" → COMMITMENT GATE rejects (hypothetical)
✅ "I already resigned from my job last month" → accepted, locked forever
✅ "Did I make a mistake?" → RE-LITIGATION GATE rejects
✅ "What if I had stayed?" → ANTI-COMPARE GATE rejects
✅ "Should I go back?" → RE-LITIGATION GATE rejects
✅ Valid introspective question → reflection generates, week advances
✅ Week 9 complete → Terminal, zero input in DOM
✅ Export downloads clean .md Living Record
✅ New arc saves to Archive
✅ Feels like a ritual chamber, not a chat app
✅ Clearly different from pre-decision tools — copy says "already decided"