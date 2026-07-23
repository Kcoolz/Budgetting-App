import {
  ArrowLeftRight,
  CalendarClock,
  ChartNoAxesColumnIncreasing,
  LayoutDashboard,
  SlidersHorizontal,
  Target,
  TrendingUp,
  WalletCards
} from "lucide-react";

export const NAVIGATION = [
  { label: "Overview", to: "/", icon: LayoutDashboard, end: true },
  { label: "Spending", to: "/spending", icon: ChartNoAxesColumnIncreasing },
  { label: "Trends", to: "/trends", icon: TrendingUp },
  { label: "Recurring", to: "/recurring", icon: CalendarClock },
  { label: "Goals", to: "/goals", icon: Target },
  { label: "Accounts", to: "/accounts", icon: WalletCards },
  { label: "Transactions", to: "/transactions", icon: ArrowLeftRight },
  { label: "Organize", to: "/organize", icon: SlidersHorizontal }
];

export const BUSINESS_NAVIGATION = [
  { label: "Overview", to: "/", icon: LayoutDashboard, end: true },
  { label: "Operations", to: "/spending", icon: ChartNoAxesColumnIncreasing },
  { label: "Insights", to: "/trends", icon: TrendingUp },
  { label: "Schedules", to: "/recurring", icon: CalendarClock },
  { label: "Reserves", to: "/goals", icon: Target },
  { label: "Accounts", to: "/accounts", icon: WalletCards },
  { label: "Ledger", to: "/transactions", icon: ArrowLeftRight },
  { label: "Organize", to: "/organize", icon: SlidersHorizontal }
];

export function navigationFor(profileType = "personal") {
  return profileType === "business" ? BUSINESS_NAVIGATION : NAVIGATION;
}
