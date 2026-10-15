"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
const F = [["title", "Title"], ["description", "Description", "area"], ["price", "Advance price in ₹ (0 = free signup)", "number"],
  ["slug", "Link name (auto from title if empty)"], ["mentor_name", "Mentor name"], ["mentor_role", "Mentor role"], ["mentor_photo", "Mentor photo URL"],
  ["logo", "Logo URL"], ["brand", "Brand colour", "color"], ["button_text", "Button text"]];
export default function ProductForm({ initial }) {
  const [v, setV] = useState(initial), [err, setErr] = useState(""), r = useRouter();
  const set = k => e => setV({ ...v, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  async function save(e) {
    e.preventDefault();
    const res = await fetch("/api/admin/product", { method: "POST", body: JSON.stringify(v) });
    const j = await res.json();
    if (!res.ok) return setErr(j.error);
    r.push("/admin"); r.refresh();
  }
  async function del() {
    if (!confirm("Delete this product and its orders?")) return;
    await fetch("/api/admin/product?id=" + v.id, { method: "DELETE" });
    r.push("/admin"); r.refresh();
  }
  return (
    <form className="panel" onSubmit={save}>
      {F.map(([k, l, t]) => <div key={k}><label htmlFor={k}>{l}</label>
        {t === "area" ? <textarea id={k} value={v[k]} onChange={set(k)} /> : <input id={k} type={t || "text"} value={v[k]} onChange={set(k)} />}</div>)}
      <label><input type="checkbox" checked={v.active} onChange={set("active")} /> Active (page is live)</label>
      <p className="err">{err}</p>
      <div className="row"><button className="btn">Save</button>{v.id && <button type="button" className="btn del" onClick={del}>Delete</button>}</div>
    </form>
  );
}
