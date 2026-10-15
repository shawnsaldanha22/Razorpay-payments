import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rzp } from "@/lib/razorpay";
export async function POST(req) {
  const { slug, name = "", email = "", phone = "" } = await req.json();
  const sql = await db();
  const [p] = await sql`SELECT id,title,price FROM products WHERE slug=${slug} AND active`;
  if (!p) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  // The price always comes from the database, never from the browser.
  if (p.price <= 0) {
    await sql`INSERT INTO orders (product_id,name,email,phone,amount,status) VALUES (${p.id},${name},${email},${phone},0,'free')`;
    return NextResponse.json({ free: true });
  }
  try {
    const o = await rzp("orders", { amount: p.price * 100, currency: "INR", receipt: `p${p.id}-${Date.now()}`, notes: { product: p.title } });
    await sql`INSERT INTO orders (product_id,name,email,phone,amount,rzp_order_id) VALUES (${p.id},${name},${email},${phone},${p.price},${o.id})`;
    return NextResponse.json({ orderId: o.id, amount: o.amount, key: process.env.RAZORPAY_KEY_ID });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 502 });
  }
}
