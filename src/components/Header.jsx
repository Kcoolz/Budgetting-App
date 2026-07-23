import { ChevronLeft, ChevronRight, Download, Plus } from "lucide-react";
import Brand from "./Brand";
import ProfileMenu from "./ProfileMenu";
import Button from "./ui/Button";

export default function Header({
  selectedMonth,
  onMonthChange,
  onMonthStep,
  onCurrentMonth,
  onAdd,
  installAvailable,
  onInstall,
  profiles,
  activeProfile,
  onSwitchProfile,
  onManageProfiles,
  profileType = "personal"
}) {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  return (
    <header className={`sticky top-0 z-10 flex min-h-[72px] items-center justify-between border-b border-black/5 px-4 backdrop-blur-xl sm:px-6 lg:justify-end lg:px-10 xl:px-14 ${profileType === "business" ? "bg-[#f3f7f5]/90" : "bg-cream-100/90"}`}>
      <div className="text-forest-900 lg:hidden">
        <Brand compact />
      </div>

      <div className="flex items-center gap-2.5">
        <ProfileMenu
          profiles={profiles}
          activeProfile={activeProfile}
          onSwitch={onSwitchProfile}
          onManage={onManageProfiles}
        />
        <div className="flex items-center rounded-xl border border-black/8 bg-white p-1">
          <button onClick={() => onMonthStep(-1)} className="interactive-button grid size-7 place-items-center rounded-lg text-slate-500 hover:bg-forest-50 hover:text-forest-800 sm:size-8" aria-label="Previous month"><ChevronLeft className="size-4" /></button>
          <label>
            <span className="sr-only">Budget month</span>
            <input type="month" value={selectedMonth} onChange={(event) => onMonthChange(event.target.value)} className="min-h-8 w-[92px] border-0 bg-transparent px-0.5 text-[10px] font-semibold text-ink-900 outline-none sm:w-[142px] sm:px-2 sm:text-xs" />
          </label>
          <button onClick={() => onMonthStep(1)} className="interactive-button grid size-7 place-items-center rounded-lg text-slate-500 hover:bg-forest-50 hover:text-forest-800 sm:size-8" aria-label="Next month"><ChevronRight className="size-4" /></button>
        </div>
        {selectedMonth !== currentMonth && <button onClick={onCurrentMonth} className="interactive-button mobile-hidden min-h-10 rounded-xl px-2 text-[11px] font-bold text-forest-700 hover:bg-forest-50">This month</button>}
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
