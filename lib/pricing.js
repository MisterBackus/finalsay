// Price to replace the sentence, in cents, given how many replacements have happened.
// First 20: $5, $6, $7 ... then +10% per replacement.
export function priceFor(n) {
  if (n < 20) return 500 + 100 * n;
  return Math.round(2400 * Math.pow(1.1, n - 20));
}
export const HOLD_MULTIPLIER = 2;
export const HOLD_MS = 60 * 60 * 1000;
export const MAX_CHARS = 120;
export function dollars(cents) {
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: cents % 100 ? 2 : 0 });
}
