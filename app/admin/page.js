"use client";
import { useEffect, useState } from "react";
export default function Admin() {
  const [st, setSt] = useState(null);
  const [msg, setMsg] = useState("");
  const key = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("key") : "";
  async function load() { const r = await fetch("/api/state", { cache: "no-store" }); setSt(await r.json()); }
  useEffect(() => { load(); }, []);
  async function kill() {
    if (!confirm("Remove the current sentence and restore the previous one?")) return;
    const r = await fetch("/api/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key }) });
    setMsg(r.ok ? "Removed." : "Wrong key.");
    load();
  }
  return (
    <main className="wrap">
      <div className="top"><span>admin</span></div>
      <p className="say" style={{fontSize: 26}}>{st ? st.text : "…"}</p>
      {st && <div className="hint">Paid {(st.paid_cents/100).toFixed(2)} · {st.held_until ? "locked" : "not locked"}</div>}
      <div className="row" style={{marginTop: 24}}><button className="btn" onClick={kill}>Remove this sentence</button></div>
      {msg && <div className="err">{msg}</div>}
    </main>
  );
}
