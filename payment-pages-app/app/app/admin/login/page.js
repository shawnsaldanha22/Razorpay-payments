"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function Login() {
  const [pw, setPw] = useState(""), [err, setErr] = useState(""), r = useRouter();
  async function go(e) {
    e.preventDefault();
    const res = await fetch("/api/admin/login", { method: "POST", body: JSON.stringify({ password: pw }) });
    if (res.ok) { r.push("/admin"); r.refresh(); } else setErr("Wrong password.");
  }
  return <form className="adm login" onSubmit={go}><h1>Admin login</h1>
    <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="Password" aria-label="Password" />
    <p className="err">{err}</p><button className="btn">Log in</button></form>;
}
