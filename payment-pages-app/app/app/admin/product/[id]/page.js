import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import ProductForm from "@/components/ProductForm";
export const dynamic = "force-dynamic";
const blank = { title: "", description: "", price: 5000, slug: "", mentor_name: "", mentor_role: "", mentor_photo: "", logo: "", brand: "#050B24", button_text: "Next", active: true };
export default async function Edit({ params }) {
  if (!isAdmin()) redirect("/admin/login");
  let initial = blank;
  if (params.id !== "new") {
    const sql = await db();
    const [p] = await sql`SELECT id,slug,title,description,price,mentor_name,mentor_role,mentor_photo,logo,brand,button_text,active FROM products WHERE id=${params.id}`;
    if (!p) redirect("/admin");
    initial = p;
  }
  return <div className="adm"><Link href="/admin">← Back</Link><h1>{initial.id ? "Edit product" : "New product"}</h1><ProductForm initial={initial} /></div>;
}
