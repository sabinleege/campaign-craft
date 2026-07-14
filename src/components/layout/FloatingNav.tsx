import { Link, useNavigate } from "@tanstack/react-router";
import { Sparkles, LayoutDashboard, Package, Megaphone, CalendarDays, BarChart3, Settings, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAppStore } from "../../stores/app-store";
import { useHydrated } from "../../hooks/use-hydrated-store";
import { toast } from "sonner";

const NAV = [
  { to: "/" as const, label: "Dashboard", Icon: LayoutDashboard, exact: true },
  { to: "/products" as const, label: "Products", Icon: Package },
  { to: "/campaigns" as const, label: "Campaigns", Icon: Megaphone },
  { to: "/calendar" as const, label: "Calendar", Icon: CalendarDays },
  { to: "/analytics" as const, label: "Analytics", Icon: BarChart3 },
  { to: "/brand" as const, label: "Settings", Icon: Settings },
];

export function FloatingNav() {
  const hydrated = useHydrated();
  const brand = useAppStore((s) => s.brand);
  const resetAll = useAppStore((s) => s.resetAll);
  const nav = useNavigate();
  const [open, setOpen] = useState(false);

  const doLogout = () => {
    resetAll();
    toast.success("Signed out — demo state reset");
    nav({ to: "/" });
  };

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-3 z-50 flex justify-center px-3">
        <div className="pointer-events-auto flex w-full max-w-6xl items-center gap-2 rounded-2xl border border-border/60 bg-background/70 px-3 py-2 shadow-elegant backdrop-blur-xl transition-shadow hover:shadow-2xl">
          <Link to="/" className="group flex items-center gap-2 pr-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-primary shadow-elegant transition-transform group-hover:scale-105">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="hidden flex-col leading-tight sm:flex">
              <span className="text-xs font-bold tracking-tight">VideoMark AI</span>
              <span className="truncate text-[10px] uppercase tracking-widest text-muted-foreground">
                {hydrated ? brand.name : "Studio"}
              </span>
            </div>
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-0.5 md:flex">
            {NAV.map(({ to, label, Icon, exact }) => (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact }}
                activeProps={{ className: "bg-primary/10 text-primary" }}
                inactiveProps={{ className: "text-muted-foreground hover:text-foreground hover:bg-muted" }}
                className="group flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all"
              >
                <Icon className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
                <span className="hidden lg:inline">{label}</span>
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            <Link
              to="/campaigns/new"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-elegant transition-transform hover:scale-[1.03]"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Generate Campaign</span>
              <span className="sm:hidden">Generate</span>
            </Link>
            <button
              onClick={doLogout}
              title="Logout"
              className="hidden h-9 w-9 place-items-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground md:grid"
            >
              <LogOut className="h-4 w-4" />
            </button>
            <button
              onClick={() => setOpen((o) => !o)}
              className="grid h-9 w-9 place-items-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground md:hidden"
              aria-label="Open menu"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="fixed inset-x-3 top-20 z-40 rounded-2xl border border-border/60 bg-background/95 p-2 shadow-elegant backdrop-blur-xl md:hidden">
          <div className="grid grid-cols-2 gap-1">
            {NAV.map(({ to, label, Icon, exact }) => (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact }}
                onClick={() => setOpen(false)}
                activeProps={{ className: "bg-primary/10 text-primary" }}
                inactiveProps={{ className: "text-muted-foreground hover:bg-muted" }}
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
            <button
              onClick={() => { setOpen(false); doLogout(); }}
              className="col-span-2 mt-1 flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export function BottomGenerateBar() {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-3 z-40 flex justify-center px-3">
      <Link
        to="/campaigns/new"
        className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-gradient-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-2xl transition-transform hover:scale-[1.03]"
      >
        <Sparkles className="h-4 w-4" />
        Generate Campaign
      </Link>
    </div>
  );
}
