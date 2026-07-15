import { Link, useNavigate } from "@tanstack/react-router";
import {
  Sparkles, LayoutDashboard, Package, Megaphone, CalendarDays,
  BarChart3, Settings, LogOut, Menu, X, Plug,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAppStore } from "../../stores/app-store";
import { useHydrated } from "../../hooks/use-hydrated-store";
import { toast } from "sonner";

const NAV = [
  { to: "/" as const, label: "Dashboard", Icon: LayoutDashboard, exact: true },
  { to: "/products" as const, label: "Products", Icon: Package },
  { to: "/campaigns" as const, label: "Campaigns", Icon: Megaphone },
  { to: "/calendar" as const, label: "Calendar", Icon: CalendarDays },
  { to: "/analytics" as const, label: "Analytics", Icon: BarChart3 },
  { to: "/channels" as const, label: "Channels", Icon: Plug },
  { to: "/brand" as const, label: "Settings", Icon: Settings },
];

export function FloatingNav() {
  const hydrated = useHydrated();
  const brand = useAppStore((s) => s.brand);
  const resetAll = useAppStore((s) => s.resetAll);
  const nav = useNavigate();
  const [open, setOpen] = useState(false);

  // Close sidebar on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const doLogout = () => {
    resetAll();
    toast.success("Signed out — demo state reset");
    setOpen(false);
    nav({ to: "/" });
  };

  return (
    <>
      {/* Always-visible top-left toggle */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close menu" : "Open menu"}
        className="fixed left-3 top-3 z-[60] grid h-11 w-11 place-items-center rounded-xl border border-border/60 bg-background/80 text-foreground shadow-elegant backdrop-blur-xl transition-transform hover:scale-105"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Backdrop */}
      {open && (
        <button
          aria-hidden
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-background/40 backdrop-blur-sm"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-border/60 bg-background/95 shadow-2xl backdrop-blur-xl transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2 border-b border-border/60 px-4 py-4 pl-16">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-primary shadow-elegant">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="min-w-0 leading-tight">
            <div className="text-sm font-bold tracking-tight">VideoMark AI</div>
            <div className="truncate text-[10px] uppercase tracking-widest text-muted-foreground">
              {hydrated ? brand.name : "Studio"}
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {NAV.map(({ to, label, Icon, exact }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              activeOptions={{ exact }}
              activeProps={{ className: "bg-primary/10 text-primary" }}
              inactiveProps={{ className: "text-muted-foreground hover:text-foreground hover:bg-muted" }}
              className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all"
            >
              <Icon className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <div className="border-t border-border/60 p-3">
          <button
            onClick={doLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}

export function BottomGenerateBar() {
  return (
    <Link
      to="/campaigns/new"
      aria-label="Generate campaign"
      title="Generate campaign"
      className="fixed bottom-4 right-4 z-40 grid h-14 w-14 place-items-center rounded-full bg-gradient-primary text-primary-foreground shadow-2xl transition-transform hover:scale-110"
    >
      <Sparkles className="h-6 w-6" />
    </Link>
  );
}
