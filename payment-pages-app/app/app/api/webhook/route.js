import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hmac, safeEq } from "@/lib/razorpay";
// Backup confirmation: marks orders paid even if the buyer closes the tab right after paying.
export async function POST(req) {
  const raw = await req.text();
  const sig = req.headers.get("x-razorpay-signature") || "";
  if (!safeEq(hmac(process.env.RAZORPAY_WEBHOOK_SECRET, raw), sig)) return NextResponse.json({ error: "Bad signature" }, { status: 400 });
  const ev = JSON.parse(raw);
  const pay = ev.payload?.payment?.entity;
  if ((ev.event === "payment.captured" || ev.event === "order.paid") && pay?.order_id) {
    const sql = await db();
    await sql`UPDATE orders SET status='paid', rzp_payment_id=${pay.id}, email=COALESCE(NULLIF(email,''),${pay.email || ""}), phone=COALESCE(NULLIF(phone,''),${pay.contact || ""}) WHERE rzp_order_id=${pay.order_id}`;
  }
  return NextResponse.json({ ok: true });
}
