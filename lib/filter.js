const BLOCKED = ["nigg", "fagg", "kike", "spic", "chink", "tranny", "retard"];
const URL_OK = /^https?:\/\/[^\s]+$/i;
export function cleanText(t) {
  const s = String(t || "").replace(/\s+/g, " ").trim();
  if (!s) return { ok: false, error: "Write something first." };
  if (s.length > 120) return { ok: false, error: "120 characters max." };
  const low = s.toLowerCase();
  if (BLOCKED.some((w) => low.includes(w))) return { ok: false, error: "Not that." };
  return { ok: true, value: s };
}
export function cleanLink(l) {
  const s = String(l || "").trim();
  if (!s) return { ok: true, value: null };
  if (!URL_OK.test(s) || s.length > 300) return { ok: false, error: "Link must start with http:// or https://" };
  return { ok: true, value: s };
}
