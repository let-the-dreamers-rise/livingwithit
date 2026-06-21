import { projectId, publicAnonKey } from "../../../utils/supabase/info";

const BASE = `https://${projectId}.supabase.co/functions/v1/make-server-55a1a311`;
const ID_KEY = "living-with-it:subscriber-id";

async function post(path: string, body: unknown) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${publicAnonKey}`,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data && (data as { error?: string }).error) || `request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as Record<string, unknown>;
}

// Subscribe to weekly mailed letters. Stores the subscriber id locally so the
// demo "send next now" trigger can target this arc.
export async function subscribeToLetters(args: {
  email: string;
  decision: string;
  cost: string;
  fear: string;
  name: string;
  firstLetter: string;
}): Promise<string> {
  const data = await post("/subscribe", args);
  const id = String(data.id ?? "");
  if (id) localStorage.setItem(ID_KEY, id);
  return id;
}

export function getSubscriberId(): string | null {
  return localStorage.getItem(ID_KEY);
}

// Demo only: force the next sealed letter to send immediately.
export async function sendNextLetterNow(id: string): Promise<string> {
  const data = await post("/send-next", { id });
  return String(data.result ?? "sent");
}

// Self-driving delivery: every time the app is opened, nudge the server to send
// any letters whose week has come due. No external cron required — the instrument
// delivers itself. Fire-and-forget; failures are silent.
export function pokeDelivery(): void {
  fetch(`${BASE}/deliver-due`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${publicAnonKey}`,
    },
    body: "{}",
  }).catch((err) => {
    console.error("Delivery heartbeat failed (non-fatal):", err);
  });
}
