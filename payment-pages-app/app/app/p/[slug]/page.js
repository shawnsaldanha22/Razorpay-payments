import { notFound } from "next/navigation";
import { loadProduct } from "@/lib/db";
import Checkout from "@/components/Checkout";
export const dynamic = "force-dynamic";
export default async function Page({ params }) {
  const p = await loadProduct(params.slug);
  if (!p) notFound();
  return <Checkout product={p} mode="form" />;
}
