import { NavLink } from "react-router";
import { navigationFor } from "./navigation";

export default function MobileNav({ profileType = "personal" }) {
  const business = profileType === "business";
  const navigation = navigationFor(profileType);
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 grid border-t border-black/5 bg-white/95 px-1 pb-[max(6px,env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-8px_30px_rgba(24,49,46,0.08)] backdrop-blur-xl lg:hidden" style={{ gridTemplateColumns: `repeat(${navigation.length}, minmax(0, 1fr))` }} aria-label="Mobile navigation">
      {navigation.map(({ label, to, icon: Icon, end }) => (
        <NavLink
          key={label}
          to={to}
          end={end}
          className={({ isActive }) => `interactive-button grid min-w-0 place-items-center gap-0.5 rounded-xl px-0.5 py-1.5 text-[9px] font-bold ${isActive ? business ? "bg-teal-50 text-teal-800" : "bg-forest-50 text-forest-800" : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"}`}
        >
          <Icon className="size-[17px]" strokeWidth={1.8} />
          <span className="max-w-full truncate">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
