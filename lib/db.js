import { createClient } from "@libsql/client";
import { priceFor } from "./pricing";

let client;
function db() {
  if (!client) client = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
  return client;
}

export async function init() {
  const c = db();
  await c.batch([
    `CREATE TABLE IF NOT EXISTS current (id INTEGER PRIMARY KEY CHECK (id = 1), text TEXT NOT NULL, link TEXT, paid_cents INTEGER NOT NULL, held_until INTEGER NOT NULL DEFAULT 0, set_at INTEGER NOT NULL, email TEXT)`,
    `CREATE TABLE IF NOT EXISTS history (id INTEGER PRIMARY KEY AUTOINCREMENT, text TEXT NOT NULL, link TEXT, paid_cents INTEGER NOT NULL, set_at INTEGER NOT NULL, erased_at INTEGER NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, status TEXT NOT NULL)`,
    `INSERT OR IGNORE INTO current (id, text, link, paid_cents, held_until, set_at) VALUES (1, 'Nobody has said anything yet. Five dollars and this sentence is yours.', NULL, 0, 0, ${Date.now()})`,
  ], "write");
}

export async function getState() {
  await init();
  const c = db();
  const cur = (await c.execute("SELECT * FROM current WHERE id = 1")).rows[0];
  const count = Number((await c.execute("SELECT COUNT(*) AS n FROM history")).rows[0].n);
  const revenue = Number((await c.execute("SELECT COALESCE(SUM(paid_cents),0) AS s FROM history")).rows[0].s) + Number(cur.paid_cents);
  const history = (await c.execute("SELECT text, link, paid_cents, set_at, erased_at FROM history ORDER BY id DESC LIMIT 200")).rows;
  const now = Date.now();
  return {
    text: cur.text,
    link: cur.link,
    paid_cents: Number(cur.paid_cents),
    held_until: Number(cur.held_until) > now ? Number(cur.held_until) : 0,
    set_at: Number(cur.set_at),
    replacements: count,
    price_cents: priceFor(count),
    revenue_cents: revenue,
    record: history.reduce((m, h) => Math.max(m, Number(h.erased_at) - Number(h.set_at)), 0) || 0,
    history: history.map((h) => ({ text: h.text, link: h.link, paid_cents: Number(h.paid_cents), set_at: Number(h.set_at), erased_at: Number(h.erased_at), lasted_ms: Number(h.erased_at) - Number(h.set_at) })),
  };
}

// Returns {ok, prev} where prev is the erased sentence (for notifications), or {ok:false}.
export async function replace({ text, link, paid_cents, expected_price, hold, email }) {
  await init();
  const c = db();
  const now = Date.now();
  const cur = (await c.execute("SELECT * FROM current WHERE id = 1")).rows[0];
  const count = Number((await c.execute("SELECT COUNT(*) AS n FROM history")).rows[0].n);
  if (priceFor(count) !== expected_price) return { ok: false };
  if (Number(cur.held_until) > now) return { ok: false };
  const held_until = hold ? now + 60 * 60 * 1000 : 0;
  await c.batch([
    { sql: "INSERT INTO history (text, link, paid_cents, set_at, erased_at) VALUES (?, ?, ?, ?, ?)", args: [cur.text, cur.link, Number(cur.paid_cents), Number(cur.set_at), now] },
    { sql: "UPDATE current SET text = ?, link = ?, paid_cents = ?, held_until = ?, set_at = ?, email = ? WHERE id = 1", args: [text, link, paid_cents, held_until, now, email || null] },
  ], "write");
  return {
    ok: true,
    prev: { text: cur.text, paid_cents: Number(cur.paid_cents), email: cur.email || null, lasted_ms: now - Number(cur.set_at) },
    next: { text, paid_cents, hold, count: count + 1, next_price: priceFor(count + 1) },
  };
}

export async function markSession(id, status) {
  await init();
  const c = db();
  const existing = (await c.execute({ sql: "SELECT status FROM sessions WHERE id = ?", args: [id] })).rows[0];
  if (existing) return false;
  await c.execute({ sql: "INSERT INTO sessions (id, status) VALUES (?, ?)", args: [id, status] });
  return true;
}

// Admin: remove the current sentence, restore the previous one, keep a record.
export async function nuke() {
  await init();
  const c = db();
  const now = Date.now();
  const cur = (await c.execute("SELECT * FROM current WHERE id = 1")).rows[0];
  const prev = (await c.execute("SELECT * FROM history ORDER BY id DESC LIMIT 1")).rows[0];
  const restoreText = prev ? prev.text : "Nobody has said anything yet. Five dollars and this sentence is yours.";
  const restoreLink = prev ? prev.link : null;
  const restorePaid = prev ? Number(prev.paid_cents) : 0;
  await c.batch([
    { sql: "INSERT INTO history (text, link, paid_cents, set_at, erased_at) VALUES (?, ?, ?, ?, ?)", args: ["[removed by the site]", null, Number(cur.paid_cents), Number(cur.set_at), now] },
    { sql: "UPDATE current SET text = ?, link = ?, paid_cents = ?, held_until = 0, set_at = ? WHERE id = 1", args: [restoreText, restoreLink, restorePaid, now] },
  ], "write");
  return true;
}
