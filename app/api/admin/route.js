import { nuke } from "../../../lib/db";
export const dynamic = "force-dynamic";
export async function POST(req) {
  const { key } = await req.json().catch(() => ({}));
  if (!process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) return new Response("no", { status: 403 });
  await nuke();
  return Response.json({ ok: true });
}
