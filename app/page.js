"use client";
import { useEffect, useState } from "react";
import { dollars, MAX_CHARS, HOLD_MULTIPLIER } from "../lib/pricing";

function ago(ms) {
  const s = Math.max(1, Math.floor((Date.now() - ms) / 1000));
  if (s < 60) return s + "s ago";
  if (s < 3600) return Math.floor(s / 60) + "m ago";
  if (s < 86400) return Math.floor(s / 3600) + "h ago";
  return Math.floor(s / 86400) + "d ago";
}
function lasted(ms) {
  const s = Math.max(1, Math.floor(ms / 1000));
  if (s < 60) return s + "s";
  if (s < 3600) return Math.floor(s / 60) + "m";
  if (s < 86400) return Math.floor(s / 3600) + "h";
  return Math.floor(s / 86400) + "d";
}
function left(ms) {
  const s = Math.max(0, Math.floor((ms - Date.now()) / 1000));
  return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
}

export default function Page() {
  const [st, setSt] = useState(null);
  const [text, setText] = useState("");
  const [link, setLink] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [tick, setTick] = useState(0);

  async function load() {
    try { const r = await fetch("/api/state", { cache: "no-store" }); setSt(await r.json()); } catch {}
  }
  useEffect(() => { load(); const a = setInterval(load, 5000); const b = setInterval(() => setTick((t) => t + 1), 1000); return () => { clearInterval(a); clearInterval(b); }; }, []);

  async function pay(hold) {
    setErr(""); setBusy(true);
    try {
      const r = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text, link, hold }) });
      const j = await r.json();
      if (!r.ok) { setErr(j.error || "Something went wrong."); setBusy(false); return; }
      window.location.href = j.url;
    } catch { setErr("Couldn't reach the server. Try again."); setBusy(false); }
  }

  const price = st ? st.price_cents : 500;
  const locked = st && st.held_until > Date.now();
  const over = text.length > MAX_CHARS;
  const canPay = !busy && !locked && text.trim().length > 0 && !over;

  return (
    <main className="wrap">
      <div className="top">
        <span>finalsay.lol</span>
        <span>{st ? <><b>{st.replacements}</b> erased · <b>{dollars(st.revenue_cents)}</b> spent</> : "…"}</span>
      </div>

      <p className="say">
        {st ? st.text : "…"}
      </p>
      {st && st.link && <div className="linkline"><a href={st.link} rel="nofollow noopener ugc" target="_blank">{new URL(st.link).hostname.replace(/^www\./, "")} ↗</a></div>}
      {st && <span className="stamp">{st.paid_cents ? "Cost " + dollars(st.paid_cents) : "Free. For now."}</span>}
      {st && st.paid_cents > 0 && <span className="alive">alive {lasted(Date.now() - st.set_at)}</span>}
      {locked && <div className="lock">Locked. Nobody can replace this for {left(st.held_until)}.</div>}

      <div className="form">
        <label htmlFor="t">Your sentence</label>
        <textarea id="t" rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="Say it." maxLength={MAX_CHARS + 40} />
        <div className={"count" + (over ? " over" : "")}>{text.length}/{MAX_CHARS}</div>
        <label htmlFor="l">Link (optional)</label>
        <input id="l" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://" inputMode="url" />
        <div className="row">
          <button className="btn" disabled={!canPay} onClick={() => pay(false)}>Replace it · {dollars(price)}</button>
          <button className="btn alt" disabled={!canPay} onClick={() => pay(true)}>Replace + lock 1h · {dollars(price * HOLD_MULTIPLIER)}</button>
        </div>
        {err && <div className="err">{err}</div>}
        <div className="hint">Every replacement raises the price. If someone pays before you, you're refunded. No edits, no refunds once you're up. Anything illegal or aimed at a private person gets removed without refund.</div>
      </div>

      {st && st.history.length > 0 && (
        <section className="grave">
          <h2>Erased</h2>
          {st.history.map((h, i) => (
            <div className="dead" key={i}>
              <span className="t">{h.text}</span>
              <span className="p">{h.paid_cents ? dollars(h.paid_cents) : "—"}</span>
              <span className="a">lasted {lasted(h.lasted_ms)}</span>
            </div>
          ))}
        </section>
      )}

      <div className="foot"><a href="/about">about</a><a href="https://x.com/" target="_blank" rel="noopener">@you</a></div>
    </main>
  );
}
