import type { Arc } from "./archive";
import { DISCLAIMER } from "./reflection";

// Generate and download the Living Record as a Markdown file.

export function buildRecordMarkdown(arc: Arc): string {
  const lines: string[] = [];
  lines.push("# LIVING WITH IT — Living Record");
  lines.push("");
  lines.push(`*Session begun ${arc.date}. Arc closed ${arc.completedAt}.*`);
  lines.push("");
  lines.push("## The decision, locked");
  lines.push("");
  lines.push(`> ${arc.decision}`);
  lines.push("");
  if (arc.cost) {
    lines.push(`**What it cost:** ${arc.cost}`);
    lines.push("");
  }
  if (arc.fear) {
    lines.push(`**What I feared:** ${arc.fear}`);
    lines.push("");
  }
  lines.push("---");
  lines.push("");
  for (const w of arc.weeks) {
    lines.push(`## Week ${w.week} — ${w.label}`);
    lines.push("");
    if (w.question) {
      lines.push(`**The question I asked:** ${w.question}`);
      lines.push("");
    }
    lines.push(w.reflection.replace(new RegExp(`\\n*${escapeRe(DISCLAIMER)}\\s*$`), "").trim());
    lines.push("");
    lines.push(`*${DISCLAIMER}*`);
    lines.push("");
    lines.push("---");
    lines.push("");
  }
  lines.push(
    "_LIVING WITH IT is a bounded instrument for post-decision doubt. Nine weeks. One future. No re-litigation._"
  );
  lines.push("");
  return lines.join("\n");
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function downloadRecord(arc: Arc): void {
  const md = buildRecordMarkdown(arc);
  const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const slug = arc.decision
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  a.href = url;
  a.download = `living-with-it-${slug || "record"}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
