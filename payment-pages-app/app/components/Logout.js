"use client";
import { useRouter } from "next/navigation";
export default function Logout() {
  const r = useRouter();
  return <button className="btn alt" onClick={async () => { await fetch("/api/admin/login", { method: "DELETE" }); r.push("/admin/login"); r.refresh(); }}>Log out</button>;
}
