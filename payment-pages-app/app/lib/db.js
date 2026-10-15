import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL);
let ready;
// Creates tables on first use, so there is no migration step.
export async function db() {
  ready ??= (async () => {
    await sql`CREATE TABLE IF NOT EXISTS products (id SERIAL PRIMARY KEY, slug TEXT UNIQUE NOT NULL, title TEXT NOT NULL, description TEXT DEFAULT '', price INT NOT NULL DEFAULT 0, mentor_name TEXT DEFAULT '', mentor_role TEXT DEFAULT '', mentor_photo TEXT DEFAULT '', logo TEXT DEFAULT '', brand TEXT DEFAULT '#050B24', button_text TEXT DEFAULT 'Next', active BOOLEAN DEFAULT TRUE, created_at TIMESTAMPTZ DEFAULT now())`;
    await sql`CREATE TABLE IF NOT EXISTS orders (id SERIAL PRIMARY KEY, product_id INT REFERENCES products(id) ON DELETE CASCADE, name TEXT DEFAULT '', email TEXT DEFAULT '', phone TEXT DEFAULT '', amount INT DEFAULT 0, rzp_order_id TEXT UNIQUE, rzp_payment_id TEXT, status TEXT DEFAULT 'created', created_at TIMESTAMPTZ DEFAULT now())`;
  })();
  await ready;
  return sql;
}
export async function loadProduct(slug) {
  const sql = await db();
  const [p] = await sql`SELECT id,slug,title,description,price,mentor_name,mentor_role,mentor_photo,logo,brand,button_text FROM products WHERE slug=${slug} AND active`;
  return p;
}
