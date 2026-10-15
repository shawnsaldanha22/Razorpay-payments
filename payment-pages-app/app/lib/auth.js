import crypto from "crypto";
import { cookies } from "next/headers";
const eq = (a, b) => a.length === b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
export const makeToken = () => crypto.createHmac("sha256", process.env.SESSION_SECRET).update(process.env.ADMIN_PASSWORD).digest("hex");
export const checkPassword = p => eq(String(p || ""), String(process.env.ADMIN_PASSWORD));
export const isAdmin = () => { const c = cookies().get("admin")?.value; return !!c && eq(c, makeToken()); };
