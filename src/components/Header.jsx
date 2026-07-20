import { Cloud, CloudOff, Download, Plus, RefreshCw } from "lucide-react";
import Brand from "./Brand";
import ProfileMenu from "./ProfileMenu";
import Button from "./ui/Button";

const SYNC_BADGES = {
  connecting: { icon: RefreshCw, label: "Connecting…", className: "text-slate-400", spin: true },
  saving: { icon: RefreshCw, label: "Saving…", className: "text-slate-400", spin: true },
  synced: { icon: Cloud, label: "Synced", className: "text-forest-700", spin: false },
  error: { icon: CloudOff, label: "Sync error — changes are kept on this device and retried", className: "text-rose-500", spin: false }
};

function SyncBadge({ status }) {
  const badge = SYNC_BADGES[status];
  if (!badge) return null;
  const Icon = badge.icon;
  return (
    <span className={`hidden items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] sm:flex ${badge.className}`} title={badge.label}>
      <Icon className={`size-3.5 ${badge.spin ? "animate-spin" : ""}`} />
      <span className="hidden lg:block">{badge.label.split(" — ")[0]}</span>
    </span>
  );
}

export default function Header({
  selectedMonth,
  onMonthChange,
  onAdd,
  installAvailable,
  onInstall,
  profiles,
  activeProfile,
  onSwitchProfile,
  onManageProfiles,
  profileType = "personal",
  syncStatus = "local",
  account = null,
  onSignOut
}) {
  return (
    <header className={`sticky top-0 z-10 flex min-h-[72px] items-center justify-between border-b border-black/5 px-4 backdrop-blur-xl sm:px-6 lg:justify-end lg:px-10 xl:px-14 ${profileType === "business" ? "bg-[#f3f7f5]/90" : "bg-cream-100/90"}`}>
      <div className="text-forest-900 lg:hidden">
        <Brand compact />
      </div>

      <div className="flex items-center gap-2.5">
        <SyncBadge status={syncStatus} />
        <ProfileMenu
          profiles={profiles}
          activeProfile={activeProfile}
          onSwitch={onSwitchProfile}
          onManage={onManageProfiles}
          account={account}
          onSignOut={onSignOut}
        />
        <label>
          <span className="sr-only">Budget month</span>
          <input
            type="month"
            value={selectedMonth}
            onChange={(event) => onMonthChange(event.target.value)}
            className="min-h-10 w-[142px] rounded-xl border border-black/8 bg-white px-3 text-xs font-semibold text-ink-900 outline-none transition-shadow focus:ring-4 focus:ring-forest-700/10 sm:w-auto sm:text-sm"
          />
        </label>
        {installAvailable && (
          <Button onClick={onInstall} className="mobile-hidden">
            <Download className="size-4" /> Install
          </Button>
        )}
        <Button variant="primary" onClick={onAdd} className="mobile-hidden">
          <Plus className="size-4" /> Add transaction
        </Button>
      </div>
    </header>
  );
}
