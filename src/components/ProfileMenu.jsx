import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Settings, UsersRound } from "lucide-react";
import ProfileAvatar from "./ProfileAvatar";

export default function ProfileMenu({ profiles, activeProfile, onSwitch, onManage }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      if (!menuRef.current?.contains(event.target)) setOpen(false);
    };
    const handleKey = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (!["ArrowDown", "ArrowUp"].includes(event.key)) return;
      const items = [...(menuRef.current?.querySelectorAll('[role^="menuitem"]') ?? [])];
      if (!items.length) return;
      event.preventDefault();
      const currentIndex = items.indexOf(document.activeElement);
      const offset = event.key === "ArrowDown" ? 1 : -1;
      items[(currentIndex + offset + items.length) % items.length].focus();
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", handleKey);
    const focusFirst = requestAnimationFrame(() => menuRef.current?.querySelector('[role^="menuitem"]')?.focus());
    return () => {
      cancelAnimationFrame(focusFirst);
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const chooseProfile = (id) => {
    onSwitch(id);
    setOpen(false);
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="interactive-button flex min-h-10 items-center gap-2 rounded-xl border border-black/8 bg-white p-1.5 text-left hover:border-forest-700/25 hover:bg-forest-50 sm:pr-2.5"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Current profile: ${activeProfile.name}`}
      >
        <ProfileAvatar profile={activeProfile} className="size-7" textClassName="text-[9px]" />
        <span className="hidden max-w-28 truncate text-xs font-semibold xl:block">{activeProfile.name}</span>
        <ChevronDown className={`hidden size-3.5 text-slate-400 transition-transform sm:block ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-40 w-64 overflow-hidden rounded-2xl border border-black/5 bg-white p-2 shadow-[0_18px_55px_rgba(11,31,58,0.16)]" role="menu">
          <div className="flex items-center gap-2 px-2 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
            <UsersRound className="size-3.5" /> Profiles
          </div>
          <div className="max-h-64 overflow-y-auto">
            {profiles.map((profile) => {
              const isActive = profile.id === activeProfile.id;
              return (
                <button
                  key={profile.id}
                  type="button"
                  onClick={() => chooseProfile(profile.id)}
                  className={`interactive-button flex w-full items-center gap-3 rounded-xl p-2 text-left ${isActive ? "bg-forest-50" : "hover:bg-slate-50"}`}
                  role="menuitemradio"
                  aria-checked={isActive}
                >
                  <ProfileAvatar profile={profile} className="size-9" textClassName="text-[10px]" />
                  <span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold">{profile.name}</span><span className="mt-0.5 block text-[9px] capitalize text-slate-400">{profile.type ?? "personal"}</span></span>
                  {isActive && <Check className="size-4 text-forest-700" />}
                </button>
              );
            })}
          </div>
          <div className="mt-2 border-t border-black/5 pt-2">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onManage();
              }}
              className="interactive-button flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-ink-900"
              role="menuitem"
            >
              <Settings className="size-4" /> Manage profiles
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
