import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
const no = () => NextResponse.json({ error: "Unauthorized" }, { status: 401 });
export async function POST(req) {
  if (!isAdmin()) return no();
  const b = await req.json();
  const slug = String(b.slug || b.title || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (!slug || !b.title) return NextResponse.json({ error: "Title is required" }, { status: 400 });
  const price = Math.max(0, parseInt(b.price) || 0);
  const sql = await db();
  try {
    if (b.id) await sql`UPDATE products SET slug=${slug},title=${b.title},description=${b.description || ""},price=${price},mentor_name=${b.mentor_name || ""},mentor_role=${b.mentor_role || ""},mentor_photo=${b.mentor_photo || ""},logo=${b.logo || ""},brand=${b.brand || "#050B24"},button_text=${b.button_text || "Next"},active=${b.active !== false} WHERE id=${b.id}`;
    else await sql`INSERT INTO products (slug,title,description,price,mentor_name,mentor_role,mentor_photo,logo,brand,button_text,active) VALUES (${slug},${b.title},${b.description || ""},${price},${b.mentor_name || ""},${b.mentor_role || ""},${b.mentor_photo || ""},${b.logo || ""},${b.brand || "#050B24"},${b.button_text || "Next"},${b.active !== false})`;
    return NextResponse.json({ ok: true, slug });
  } catch (e) {
    return NextResponse.json({ error: /unique/i.test(e.message) ? "That link name is already used" : e.message }, { status: 400 });
  }
}
export async function DELETE(req) {
  if (!isAdmin()) return no();
  const id = new URL(req.url).searchParams.get("id");
  const sql = await db();
  await sql`DELETE FROM products WHERE id=${id}`;
  return NextResponse.json({ ok: true });
}
