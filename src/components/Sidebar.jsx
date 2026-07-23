import { ShieldCheck } from "lucide-react";
import { NavLink } from "react-router";
import Brand from "./Brand";
import { navigationFor } from "./navigation";

export default function Sidebar({ profileType = "personal" }) {
  const business = profileType === "business";
  const navigation = navigationFor(profileType);
  return (
    <aside className={`fixed inset-y-0 left-0 z-20 hidden w-60 flex-col px-5 py-7 text-white lg:flex ${business ? "bg-[#102c2b]" : "bg-forest-900"}`} aria-label="Primary navigation">
      <Brand />

      {business && <div className="mt-6 flex items-center gap-2 rounded-xl border border-teal-200/10 bg-teal-300/[0.07] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-teal-200"><span className="size-1.5 rounded-full bg-teal-300" /> Business workspace</div>}

      <nav className={`${business ? "mt-6" : "mt-12"} grid gap-1.5`}>
        {navigation.map(({ label, to, icon: Icon, end }) => (
          <NavLink
            key={label}
            to={to}
            end={end}
            className={({ isActive }) => `interactive-button flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold ${
              isActive ? "bg-white/10 text-white" : "text-white/65 hover:bg-white/[0.07] hover:text-white"
            }`}
          >
            <Icon className="size-[18px]" strokeWidth={1.8} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto flex gap-3 rounded-2xl border border-white/10 bg-white/[0.055] p-3.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-emerald-300/10 text-emerald-200">
          <ShieldCheck className="size-4" />
        </span>
        <div>
          <strong className="text-xs font-semibold">{business ? "Business data stays local" : "Stored on this device"}</strong>
          <p className="mt-1 text-[11px] leading-relaxed text-white/55">{business ? "Your ledger remains private in this browser." : "Your financial data stays private in this browser."}</p>
        </div>
      </div>
    </aside>
  );
}
