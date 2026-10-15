import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import Logout from "@/components/Logout";
export const dynamic = "force-dynamic";
export default async function Admin() {
  if (!isAdmin()) redirect("/admin/login");
  const sql = await db();
  const products = await sql`SELECT id,slug,title,price,active FROM products ORDER BY id DESC`;
  const orders = await sql`SELECT o.id,o.name,o.email,o.phone,o.amount,o.status,o.created_at,p.title FROM orders o JOIN products p ON p.id=o.product_id ORDER BY o.id DESC LIMIT 100`;
  const h = headers();
  const base = process.env.NEXT_PUBLIC_SITE_URL || `${h.get("x-forwarded-proto") || "http"}://${h.get("host")}`;
  return (
    <div className="adm">
      <div className="row"><h1>Payment pages</h1><Link className="btn" href="/admin/product/new">New product</Link><Logout /></div>
      <h2>Products</h2>
      {products.length === 0 && <p className="muted">No products yet. Create your first one.</p>}
      {products.map(p => (
        <div className="card" key={p.id}>
          <b>{p.title}</b> · ₹{p.price} {!p.active && <em>(inactive)</em>}
          <div className="links">Payment link: <code>{base}/pay/{p.slug}</code><br />Form link: <code>{base}/p/{p.slug}</code></div>
          <Link href={`/admin/product/${p.id}`}>Edit</Link>
        </div>))}
      <h2>Orders</h2>
      <div className="scroll"><table><thead><tr><th>Date</th><th>Product</th><th>Name</th><th>Email</th><th>Phone</th><th>₹</th><th>Status</th></tr></thead><tbody>
        {orders.map(o => <tr key={o.id}><td>{new Date(o.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</td><td>{o.title}</td><td>{o.name}</td><td>{o.email}</td><td>{o.phone}</td><td>{o.amount}</td><td>{o.status}</td></tr>)}
      </tbody></table></div>
    </div>
  );
}
