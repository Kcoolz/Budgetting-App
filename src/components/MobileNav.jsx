import { useEffect, useState } from "react";
import { Grid2X2, Settings } from "lucide-react";
import { NavLink, useLocation } from "react-router";
import { navigationFor } from "./navigation";

export default function MobileNav({ profileType = "personal" }) {
  const business = profileType === "business";
  const navigation = navigationFor(profileType);
  const { pathname } = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const primaryPaths = ["/", "/spending", "/transactions", "/recurring"];
  const primaryNavigation = primaryPaths.map((path) => navigation.find(({ to }) => to === path)).filter(Boolean);
  const moreNavigation = [
    ...navigation.filter(({ to }) => !primaryPaths.includes(to)),
    { label: "Profiles", to: "/profiles", icon: Settings }
  ];
  const moreActive = moreNavigation.some(({ to }) => pathname === to);

  useEffect(() => setMoreOpen(false), [pathname]);
  useEffect(() => {
    if (!moreOpen) return undefined;
    const close = (event) => {
      if (event.key === "Escape") setMoreOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [moreOpen]);

  const navClass = (active) => `interactive-button grid min-w-0 place-items-center gap-0.5 rounded-xl px-0.5 py-1.5 text-[10px] font-bold ${
    active ? business ? "bg-teal-50 text-teal-800" : "bg-forest-50 text-forest-800" : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
  }`;

  return (
    <>
      {moreOpen && (
        <div className="fixed inset-0 z-[29] bg-forest-950/25 backdrop-blur-[2px] lg:hidden" onClick={() => setMoreOpen(false)}>
          <div className="app-popover absolute bottom-[calc(64px+env(safe-area-inset-bottom))] left-3 right-3 rounded-2xl border border-black/5 bg-white p-3 shadow-2xl" onClick={(event) => event.stopPropagation()} role="menu" aria-label="More navigation">
            <div className="grid grid-cols-2 gap-2">
              {moreNavigation.map(({ label, to, icon: Icon }) => (
                <NavLink key={to} to={to} className={({ isActive }) => `interactive-button flex min-h-14 items-center gap-3 rounded-xl px-3 text-xs font-bold ${isActive ? "bg-forest-50 text-forest-800" : "bg-slate-50 text-slate-600"}`} role="menuitem">
                  <span className="grid size-8 place-items-center rounded-lg bg-white"><Icon className="size-4" /></span>{label}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}

      <nav className="app-mobile-nav fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-black/5 bg-white/95 px-1 pb-[max(6px,env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-8px_30px_rgba(24,49,46,0.08)] backdrop-blur-xl lg:hidden" aria-label="Mobile navigation">
        {primaryNavigation.map(({ label, to, icon: Icon, end }) => (
          <NavLink key={label} to={to} end={end} className={({ isActive }) => navClass(isActive)}>
            <Icon className="size-[18px]" strokeWidth={1.8} />
            <span className="max-w-full truncate">{label}</span>
          </NavLink>
        ))}
        <button type="button" onClick={() => setMoreOpen((value) => !value)} className={navClass(moreOpen || moreActive)} aria-expanded={moreOpen} aria-haspopup="menu">
          <Grid2X2 className="size-[18px]" strokeWidth={1.8} />
          <span>More</span>
        </button>
      </nav>
    </>
  );
}
