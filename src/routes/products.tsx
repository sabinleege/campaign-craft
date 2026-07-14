import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAppStore } from "../stores/app-store";
import { useHydrated } from "../hooks/use-hydrated-store";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Plus, Package, Search } from "lucide-react";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "Products & Assets — VideoMark AI" },
      { name: "description", content: "Product library with reusable assets for AI campaign generation." },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const hydrated = useHydrated();
  const products = useAppStore((s) => s.products);
  const [q, setQ] = useState("");
  if (!hydrated) return <div className="h-64 animate-pulse rounded-xl bg-muted" />;
  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(q.toLowerCase()) ||
    p.tags.some((t) => t.toLowerCase().includes(q.toLowerCase()))
  );
  return (
    <div className="space-y-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">Product Library</h1>
          <p className="text-sm text-muted-foreground">Rich product data powers every future campaign.</p>
        </div>
        <Link to="/products/$id" params={{ id: "new" }} className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-gradient-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-elegant">
          <Plus className="h-4 w-4" /> New product
        </Link>
      </header>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search products, tags…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => {
          const cover = p.imageUrls[0];
          return (
            <Link key={p.id} to="/products/$id" params={{ id: p.id }}>
              <Card className="h-full overflow-hidden transition-shadow hover:shadow-elegant">
                <div className="relative aspect-[4/3] w-full bg-gradient-primary/10">
                  {cover ? (
                    <img src={cover} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full place-items-center">
                      <Package className="h-10 w-10 text-primary/70" />
                    </div>
                  )}
                  {p.discountPercent ? (
                    <Badge className="absolute left-2 top-2 bg-destructive text-destructive-foreground">-{p.discountPercent}%</Badge>
                  ) : null}
                  {p.price && (
                    <Badge variant="secondary" className="absolute right-2 top-2">{p.price}</Badge>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold">{p.name}</h3>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.description}</p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {p.tags.slice(0, 4).map((t) => (
                      <span key={t} className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">#{t}</span>
                    ))}
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">No products match your search.</div>
        )}
      </div>
    </div>
  );
}
