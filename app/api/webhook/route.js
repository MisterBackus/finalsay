import Stripe from "stripe";
import { replace, markSession } from "../../../lib/db";
import { emailErased, tweetReplaced } from "../../../lib/notify";
export const dynamic = "force-dynamic";

export async function POST(req) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers.get("stripe-signature");
  const raw = await req.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (e) {
    return new Response("bad signature", { status: 400 });
  }
  if (event.type !== "checkout.session.completed") return Response.json({ ok: true });

  const s = event.data.object;
  if (s.payment_status !== "paid") return Response.json({ ok: true });
  const fresh = await markSession(s.id, "processing");
  if (!fresh) return Response.json({ ok: true });

  const m = s.metadata || {};
  const r = await replace({
    text: m.text,
    link: m.link || null,
    paid_cents: s.amount_total,
    expected_price: Number(m.expected_price),
    hold: m.hold === "1",
    email: s.customer_details?.email || null,
  });
  const ok = r.ok;
  if (ok) {
    await Promise.all([emailErased(r.prev, r.next), tweetReplaced(r.prev, r.next)]);
  }
  if (!ok) {
    // Someone beat them to it, or the sentence is locked. Refund automatically.
    try { await stripe.refunds.create({ payment_intent: s.payment_intent }); } catch (e) {}
  }
  return Response.json({ ok: true, replaced: ok });
}
