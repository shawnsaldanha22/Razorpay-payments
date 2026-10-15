import crypto from "crypto";
export async function rzp(path, body) {
  const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
  const r = await fetch("https://api.razorpay.com/v1/" + path, {
    method: body ? "POST" : "GET", cache: "no-store",
    headers: { Authorization: "Basic " + auth, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error?.description || "Razorpay error");
  return j;
}
export const hmac = (secret, data) => crypto.createHmac("sha256", secret).update(data).digest("hex");
export const safeEq = (a, b) => a.length === b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
