// Week narrative frames. Weeks are not timers — they are temporal vantage points
// from which the future self speaks back across a lifetime of living with the choice.

export const TOTAL_WEEKS = 9;

export interface WeekFrame {
  week: number;
  label: string; // badge text
  horizon: string; // future-self vantage used by the reflection engine
}

export const WEEK_FRAMES: WeekFrame[] = [
  { week: 1, label: "One week in", horizon: "one week" },
  { week: 2, label: "One month in", horizon: "one month" },
  { week: 3, label: "Three months in", horizon: "three months" },
  { week: 4, label: "Six months in", horizon: "six months" },
  { week: 5, label: "One year in", horizon: "one year" },
  { week: 6, label: "Two years in", horizon: "two years" },
  { week: 7, label: "Five years in", horizon: "five years" },
  { week: 8, label: "Ten years in", horizon: "ten years" },
  { week: 9, label: "A lifetime in", horizon: "a lifetime" },
];

export function frameFor(week: number): WeekFrame {
  return WEEK_FRAMES[Math.max(0, Math.min(WEEK_FRAMES.length - 1, week - 1))];
}
