import { dollars } from "./pricing";

export function lasted(ms) {
  const s = Math.max(1, Math.floor(ms / 1000));
  if (s < 60) return s + " second" + (s === 1 ? "" : "s");
  if (s < 3600) { const m = Math.floor(s / 60); return m + " minute" + (m === 1 ? "" : "s"); }
  if (s < 86400) { const h = Math.floor(s / 3600); return h + " hour" + (h === 1 ? "" : "s"); }
  const d = Math.floor(s / 86400); return d + " day" + (d === 1 ? "" : "s");
}

export async function emailErased(prev, next) {
  if (!process.env.RESEND_API_KEY || !prev.email) return;
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    const site = process.env.SITE_URL || "https://finalsay.lol";
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "finalsay <onboarding@resend.dev>",
      to: prev.email,
      subject: `Someone paid ${dollars(next.paid_cents)} to erase you`,
      text: `Your sentence lasted ${lasted(prev.lasted_ms)}.\n\nIt now says:\n"${next.text}"\n\nTake it back for ${dollars(next.next_price)}: ${site}\n\n(You got this because you bought a sentence on finalsay.lol. One email per erase, nothing else.)`,
    });
  } catch (e) { console.error("email failed", e?.message); }
}

export async function tweetReplaced(prev, next) {
  if (!process.env.X_API_KEY) return;
  try {
    const { TwitterApi } = await import("twitter-api-v2");
    const x = new TwitterApi({ appKey: process.env.X_API_KEY, appSecret: process.env.X_API_SECRET, accessToken: process.env.X_ACCESS_TOKEN, accessSecret: process.env.X_ACCESS_SECRET });
    const line1 = prev.paid_cents ? `erased after ${lasted(prev.lasted_ms)}: "${prev.text}"` : `first sentence bought.`;
    const body = `${line1}\n\nnow up (${dollars(next.paid_cents)}${next.hold ? ", locked 1h" : ""}): "${next.text}"\n\nerasing it costs ${dollars(next.next_price)}`;
    await x.v2.tweet(body.slice(0, 280));
  } catch (e) { console.error("tweet failed", e?.message); }
}
