import { useEffect, useReducer } from "react";
import { VoidState } from "./components/VoidState";
import { CommitmentRitual } from "./components/CommitmentRitual";
import { WriteToFuture } from "./components/WriteToFuture";
import { WeeklyChamber } from "./components/WeeklyChamber";
import { TerminalState } from "./components/TerminalState";
import { LivingArchive } from "./components/LivingArchive";
import { fetchReflection } from "./lib/reflection";
import { pokeDelivery } from "./lib/mail";
import { frameFor, TOTAL_WEEKS } from "./lib/weeks";
import {
  loadArchive,
  saveArc,
  newId,
  type Arc,
  type WeekEntry,
} from "./lib/archive";

// ─────────────────────────────────────────────────────────────────────────────
// LIVING WITH IT — strict 4-phase state machine.
// VOID → COMMITMENT → CHAMBER → TERMINAL (+ ARCHIVE, a read-only side view).
// Illegal transitions are unrepresentable: the reducer only accepts the actions
// each phase is allowed to dispatch.
// ─────────────────────────────────────────────────────────────────────────────

type Phase = "void" | "commitment" | "letter" | "chamber" | "terminal" | "archive";

interface State {
  phase: Phase;
  decision: string;
  cost: string;
  fear: string;
  name: string;
  letterToFuture: string;
  weeks: WeekEntry[];
  pending: boolean;
  arc: Arc | null; // finalized arc shown on the terminal screen
  archive: Arc[];
  returnPhase: Phase; // where to go back to from the archive view
}

type Action =
  | { type: "ENTER_COMMITMENT" }
  | { type: "OPEN_ARCHIVE" }
  | { type: "CLOSE_ARCHIVE" }
  | { type: "LOCK"; decision: string; cost: string; fear: string; name: string }
  | { type: "SEAL_LETTER"; letter: string }
  | { type: "PENDING" }
  | { type: "ADD_WEEK"; entry: WeekEntry }
  | { type: "FINALIZE"; arc: Arc; archive: Arc[] }
  | { type: "RESET" };

function init(): State {
  return {
    phase: "void",
    decision: "",
    cost: "",
    fear: "",
    name: "",
    letterToFuture: "",
    weeks: [],
    pending: false,
    arc: null,
    archive: loadArchive(),
    returnPhase: "void",
  };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ENTER_COMMITMENT":
      return { ...state, phase: "commitment" };
    case "OPEN_ARCHIVE":
      return { ...state, returnPhase: state.phase, phase: "archive" };
    case "CLOSE_ARCHIVE":
      return { ...state, phase: state.returnPhase };
    case "LOCK":
      // The decision is sealed; now the user writes a letter to their future self.
      return {
        ...state,
        phase: "letter",
        decision: action.decision,
        cost: action.cost,
        fear: action.fear,
        name: action.name,
        pending: false,
      };
    case "SEAL_LETTER":
      // The letter is sent forward; the future self begins to answer (Week 1).
      return { ...state, letterToFuture: action.letter, pending: true };
    case "PENDING":
      return { ...state, pending: true };
    case "ADD_WEEK":
      return {
        ...state,
        phase: "chamber",
        pending: false,
        weeks: [...state.weeks, action.entry],
      };
    case "FINALIZE":
      return {
        ...state,
        phase: "terminal",
        pending: false,
        arc: action.arc,
        archive: action.archive,
      };
    case "RESET":
      return { ...init(), archive: state.archive };
    default:
      return state;
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, init);

  // Self-driving delivery: on every visit, nudge the server to mail any letters
  // that have come due. No external cron — the instrument delivers itself.
  useEffect(() => {
    pokeDelivery();
  }, []);

  // Lock the decision → move to the "write a letter to your future self" step.
  function handleLock(decision: string, cost: string, fear: string, name: string) {
    dispatch({ type: "LOCK", decision, cost, fear, name });
  }

  // The user sends their letter forward → the future self answers (Week 1).
  async function handleSealLetter(letter: string) {
    dispatch({ type: "SEAL_LETTER", letter });
    const reflection = await fetchReflection({
      decision: state.decision,
      cost: state.cost,
      fear: state.fear,
      name: state.name,
      letterToFuture: letter,
      week: 1,
    });
    const frame = frameFor(1);
    dispatch({
      type: "ADD_WEEK",
      entry: { week: 1, label: frame.label, question: "", reflection },
    });
  }

  // Weeks 2–9 check-in → generate the next reflection from the user's question.
  async function handleCheckIn(question: string) {
    const nextWeek = state.weeks.length + 1;
    dispatch({ type: "PENDING" });
    const reflection = await fetchReflection({
      decision: state.decision,
      cost: state.cost,
      fear: state.fear,
      name: state.name,
      letterToFuture: state.letterToFuture,
      week: nextWeek,
      question,
      // The future self's memory: every week written so far.
      history: state.weeks.map((w) => ({
        label: w.label,
        question: w.question,
        reflection: w.reflection,
      })),
    });
    const frame = frameFor(nextWeek);
    const entry: WeekEntry = {
      week: nextWeek,
      label: frame.label,
      question,
      reflection,
    };
    const allWeeks = [...state.weeks, entry];

    if (nextWeek >= TOTAL_WEEKS) {
      const now = new Date();
      const arc: Arc = {
        id: newId(),
        date: now.toISOString().slice(0, 10),
        decision: state.decision,
        cost: state.cost,
        fear: state.fear,
        weeks: allWeeks,
        completedAt: now.toISOString().slice(0, 10),
      };
      const archive = saveArc(arc);
      dispatch({ type: "FINALIZE", arc, archive });
    } else {
      dispatch({ type: "ADD_WEEK", entry });
    }
  }

  // Keep the document background matched to the active phase.
  useEffect(() => {
    const bg =
      state.phase === "chamber"
        ? "#111111"
        : state.phase === "terminal"
        ? "#0d0d0d"
        : "#0a0a0a";
    document.body.style.background = bg;
    return () => {
      document.body.style.background = "";
    };
  }, [state.phase]);

  return (
    <div className="lwi relative size-full min-h-screen overflow-y-auto">
      {/* Premium ambient backdrop — sits behind every phase. */}
      <div className="lwi-ambient" aria-hidden />
      <div className="lwi-grain" aria-hidden />
      <div className="lwi-vignette" aria-hidden />

      <div className="lwi-stage">
      {state.phase === "void" && (
        <VoidState
          onEnter={() => dispatch({ type: "ENTER_COMMITMENT" })}
          onArchive={() => dispatch({ type: "OPEN_ARCHIVE" })}
          hasArchive={state.archive.length > 0}
        />
      )}

      {state.phase === "commitment" && (
        <CommitmentRitual onLock={handleLock} />
      )}

      {/* The user writes a letter forward to their future self. */}
      {state.phase === "letter" && !state.pending && (
        <WriteToFuture name={state.name} onSeal={handleSealLetter} />
      )}

      {/* The letter is sent; the future self begins to answer. */}
      {state.phase === "letter" && state.pending && <FirstReflectionHold />}

      {state.phase === "chamber" && state.weeks.length > 0 && (
        <WeeklyChamber
          decision={state.decision}
          cost={state.cost}
          fear={state.fear}
          name={state.name}
          weeks={state.weeks}
          pending={state.pending}
          onCheckIn={handleCheckIn}
        />
      )}

      {state.phase === "terminal" && state.arc && (
        <TerminalState
          arc={state.arc}
          onNewArc={() => dispatch({ type: "RESET" })}
        />
      )}

      {state.phase === "archive" && (
        <LivingArchive
          arcs={state.archive}
          onBack={() => dispatch({ type: "CLOSE_ARCHIVE" })}
        />
      )}
      </div>
    </div>
  );
}

function FirstReflectionHold() {
  return (
    <div
      className="flex min-h-screen w-full flex-col items-center justify-center"
      style={{ background: "var(--lwi-void)" }}
    >
      <div
        className="h-px w-16 lwi-pulse"
        style={{ background: "var(--lwi-accent)" }}
      />
      <p
        className="mt-5 text-[0.8rem] italic"
        style={{ color: "var(--lwi-faint)" }}
      >
        Your future self is beginning to write back…
      </p>
    </div>
  );
}
