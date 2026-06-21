// localStorage archive — the only persistence in LIVING WITH IT. No auth, no
// cloud, no profiling. This enables return visits for NEW decisions across years.

export interface WeekEntry {
  week: number;
  label: string;
  question: string; // empty for week 1
  reflection: string;
}

export interface Arc {
  id: string;
  date: string; // ISO date the arc was begun / completed
  decision: string;
  cost: string; // what the decision cost (commitment ritual, step 2)
  fear: string; // what the user fears about it (commitment ritual, step 3)
  weeks: WeekEntry[];
  completedAt: string;
}

const KEY = "living-with-it:archive:v1";

export function loadArchive(): Arc[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Arc[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Failed to load LIVING WITH IT archive from localStorage:", err);
    return [];
  }
}

export function saveArc(arc: Arc): Arc[] {
  const all = loadArchive();
  const next = [arc, ...all];
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch (err) {
    console.error("Failed to save arc to LIVING WITH IT archive:", err);
  }
  return next;
}

export function newId(): string {
  return `arc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
