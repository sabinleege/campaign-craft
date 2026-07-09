import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

const links = [
  { to: "/" as const, label: "Dashboard" },
  { to: "/brand" as const, label: "Brand" },
  { to: "/products" as const, label: "Products" },
  { to: "/channels" as const, label: "Channels" },
  { to: "/analytics" as const, label: "Analytics" },
];

export function TopNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-elegant">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold tracking-tight">VideoMark AI</span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Campaign Studio</span>
          </div>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              activeProps={{ className: "bg-accent text-accent-foreground" }}
              inactiveProps={{ className: "text-muted-foreground hover:text-foreground hover:bg-muted" }}
              className="rounded-md px-3 py-2 text-sm font-medium transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <Link
          to="/campaigns/new"
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-elegant transition-transform hover:scale-[1.02]"
        >
          <Sparkles className="h-4 w-4" />
          <span className="hidden sm:inline">Generate Campaign</span>
          <span className="sm:hidden">Generate</span>
        </Link>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-t border-border/40 px-2 py-1 md:hidden">
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            activeOptions={{ exact: l.to === "/" }}
            activeProps={{ className: "bg-accent text-accent-foreground" }}
            inactiveProps={{ className: "text-muted-foreground" }}
            className="shrink-0 rounded-md px-3 py-1.5 text-xs font-medium"
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
