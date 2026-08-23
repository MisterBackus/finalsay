import Stripe from "stripe";
import { getState } from "../../../lib/db";
import { cleanText, cleanLink } from "../../../lib/filter";
import { HOLD_MULTIPLIER, dollars } from "../../../lib/pricing";
export const dynamic = "force-dynamic";

// Simple per-IP limiter: 5 checkout attempts per 10 minutes.
const hits = new Map();
function limited(ip) {
  const now = Date.now(), win = 10 * 60 * 1000;
  const arr = (hits.get(ip) || []).filter((t) => now - t < win);
  if (arr.length >= 5) return true;
  arr.push(now); hits.set(ip, arr);
  return false;
}

export async function POST(req) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (limited(ip)) return Response.json({ error: "Slow down. Try again in a few minutes." }, { status: 429 });
  const body = await req.json().catch(() => ({}));
  const t = cleanText(body.text);
  if (!t.ok) return Response.json({ error: t.error }, { status: 400 });
  const l = cleanLink(body.link);
  if (!l.ok) return Response.json({ error: l.error }, { status: 400 });
  const hold = !!body.hold;

  const state = await getState();
  if (state.held_until) return Response.json({ error: "This sentence is locked for now. Try again when the timer ends." }, { status: 409 });

  const amount = hold ? state.price_cents * HOLD_MULTIPLIER : state.price_cents;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const site = process.env.SITE_URL || "http://localhost:3000";
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{
      quantity: 1,
      price_data: {
        currency: "usd",
        unit_amount: amount,
        product_data: { name: hold ? "Replace the sentence and lock it for 1 hour" : "Replace the sentence", description: `"${t.value}"` },
      },
    }],
    metadata: { text: t.value, link: l.value || "", hold: hold ? "1" : "0", expected_price: String(state.price_cents) },
    success_url: `${site}/success?sid={CHECKOUT_SESSION_ID}`,
    cancel_url: `${site}/`,
  });
  return Response.json({ url: session.url, amount: dollars(amount) });
}
