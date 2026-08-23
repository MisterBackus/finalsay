import { ImageResponse } from "next/og";
import { getState } from "../lib/db";
import { dollars } from "../lib/pricing";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG() {
  let text = "One sentence. Pay to replace it.", paid = 0, price = 500, erased = 0;
  try { const s = await getState(); text = s.text; paid = s.paid_cents; price = s.price_cents; erased = s.replacements; } catch {}
  const fs = text.length > 80 ? 48 : text.length > 40 ? 62 : 78;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: "#fff", color: "#111", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 64, fontFamily: "sans-serif" }}>
        <div style={{ fontSize: 26, color: "#8a8a8a", letterSpacing: 2 }}>FINALSAY.LOL</div>
        <div style={{ fontSize: fs, fontWeight: 900, lineHeight: 1.05 }}>{text}</div>
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          <div style={{ border: "6px solid #E10600", color: "#E10600", padding: "8px 20px", fontSize: 32, fontWeight: 700, transform: "rotate(-3deg)" }}>{paid ? "COST " + dollars(paid) : "FREE. FOR NOW."}</div>
          <div style={{ fontSize: 28, color: "#8a8a8a" }}>Replace it for {dollars(price)} · {erased} erased so far</div>
        </div>
      </div>
    ), size);
}
