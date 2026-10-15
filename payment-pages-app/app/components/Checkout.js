"use client";
import { useEffect, useState } from "react";
const inr = n => "₹" + Number(n).toLocaleString("en-IN");
const loadRzp = () => new Promise((ok, no) => {
  if (window.Razorpay) return ok();
  const s = document.createElement("script");
  s.src = "https://checkout.razorpay.com/v1/checkout.js"; s.onload = ok; s.onerror = no;
  document.body.appendChild(s);
});

export default function Checkout({ product: p, mode }) {
  const [f, setF] = useState({ name: "", email: "", cc: "+91", phone: "" });
  const [err, setErr] = useState(""), [busy, setBusy] = useState(false), [done, setDone] = useState(null);
  const set = k => e => setF({ ...f, [k]: e.target.value });

  async function pay(e) {
    e?.preventDefault();
    let body = { slug: p.slug };
    if (mode === "form") {
      const num = f.phone.replace(/\D/g, "");
      if (f.name.trim().length < 2) return setErr("Enter your full name.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) return setErr("Enter a valid email address.");
      if (f.cc === "+91" ? !/^[6-9]\d{9}$/.test(num.slice(-10)) : num.length < 6) return setErr("Enter a valid contact number.");
      body = { ...body, name: f.name.trim(), email: f.email.trim(), phone: f.cc + (f.cc === "+91" ? num.slice(-10) : num) };
    }
    setErr(""); setBusy(true);
    try {
      const r = await fetch("/api/order", { method: "POST", body: JSON.stringify(body) });
      const o = await r.json();
      if (!r.ok) throw new Error(o.error);
      if (o.free) return setDone({ name: body.name });
      await loadRzp();
      const rz = new window.Razorpay({
        key: o.key, order_id: o.orderId, amount: o.amount, currency: "INR",
        name: p.title, description: p.title, image: p.logo || undefined,
        prefill: { name: body.name, email: body.email, contact: body.phone },
        theme: { color: p.brand },
        modal: { ondismiss: () => setBusy(false) },
        handler: async res => {
          const v = await fetch("/api/verify", { method: "POST", body: JSON.stringify({ orderId: res.razorpay_order_id, paymentId: res.razorpay_payment_id, signature: res.razorpay_signature }) });
          if (v.ok) setDone({ id: res.razorpay_payment_id, name: body.name });
          else setErr("Payment received but not confirmed yet. Keep your payment ID: " + res.razorpay_payment_id);
          setBusy(false);
        },
      });
      rz.on("payment.failed", x => { setErr(x.error.description); setBusy(false); });
      rz.open();
    } catch (x) { setErr(x.message || "Something went wrong."); setBusy(false); }
  }
  useEffect(() => { if (mode === "pay" && p.price > 0 && window.top === window) pay(); }, []); // eslint-disable-line

  return (
    <div className="wrap">
      <section className="hero" style={{ background: p.brand }}>
        {p.logo ? <img className="logo" src={p.logo} alt="" /> : <div className="logotext">{process.env.NEXT_PUBLIC_BRAND_NAME}</div>}
        <div>
          <h1>{p.title}</h1><p>{p.description}</p>
          {p.price > 0 && <span className="price">Advance: {inr(p.price)}</span>}
        </div>
        {p.mentor_name ? <div><h3>Mentored By</h3><div className="mentor">
          {p.mentor_photo ? <img className="av" src={p.mentor_photo} alt="" /> : <div className="av">{p.mentor_name[0]}</div>}
          <div><b>{p.mentor_name}</b><span>{p.mentor_role}</span></div></div></div> : <div />}
      </section>
      <section className="side">
        {done ? (
          <div className="narrow"><h2>{done.name ? `You're in, ${done.name.split(" ")[0]}.` : "Payment received."}</h2>
            <p>{done.id ? <>Your payment ID is <b>{done.id}</b>. </> : null}A receipt is on its way to your email.</p></div>
        ) : mode === "form" ? (
          <form className="narrow" onSubmit={pay} noValidate>
            <div className="fld"><label htmlFor="n">Full Name <i>*</i></label><input id="n" value={f.name} onChange={set("name")} autoComplete="name" /></div>
            <div className="fld"><label htmlFor="e">Email Address <i>*</i></label><input id="e" type="email" value={f.email} onChange={set("email")} autoComplete="email" /></div>
            <div className="fld"><label htmlFor="p">Contact Number <i>*</i></label>
              <div className="tel"><select value={f.cc} onChange={set("cc")} aria-label="Country code">{["+91", "+1", "+44", "+971", "+65", "+61"].map(c => <option key={c}>{c}</option>)}</select>
                <input id="p" type="tel" value={f.phone} onChange={set("phone")} placeholder="081234 56789" autoComplete="tel-national" /></div></div>
            <p className="err" role="alert">{err}</p>
            <button className="next" disabled={busy} style={{ background: p.brand }}>{p.button_text || "Next"}</button>
            <p className="terms">Secure payment by Razorpay.</p>
          </form>
        ) : (
          <div className="narrow"><p className="muted">Amount due</p><h2 className="big">{inr(p.price)}</h2>
            <p className="err" role="alert">{err}</p>
            <button className="next" disabled={busy} onClick={pay} style={{ background: p.brand }}>Pay {inr(p.price)}</button>
            <p className="terms">Secure payment by Razorpay. UPI, cards, netbanking and wallets.</p></div>
        )}
      </section>
    </div>
  );
}
