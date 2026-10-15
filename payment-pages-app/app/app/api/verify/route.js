import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rzp, hmac, safeEq } from "@/lib/razorpay";
export async function POST(req) {
  const { orderId, paymentId, signature } = await req.json();
  const expected = hmac(process.env.RAZORPAY_KEY_SECRET, `${orderId}|${paymentId}`);
  if (!signature || !safeEq(expected, String(signature))) return NextResponse.json({ error: "Bad signature" }, { status: 400 });
  const sql = await db();
  let email = "", phone = "";
  try { const pay = await rzp(`payments/${paymentId}`); email = pay.email || ""; phone = pay.contact || ""; } catch {}
  await sql`UPDATE orders SET status='paid', rzp_payment_id=${paymentId}, email=COALESCE(NULLIF(email,''),${email}), phone=COALESCE(NULLIF(phone,''),${phone}) WHERE rzp_order_id=${orderId}`;
  return NextResponse.json({ ok: true });
}
