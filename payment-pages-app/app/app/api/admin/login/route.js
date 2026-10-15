import { NextResponse } from "next/server";
import { checkPassword, makeToken } from "@/lib/auth";
const opts = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/" };
export async function POST(req) {
  const { password } = await req.json();
  if (!checkPassword(password)) return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin", makeToken(), { ...opts, maxAge: 60 * 60 * 24 * 14 });
  return res;
}
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin", "", { ...opts, maxAge: 0 });
  return res;
}
