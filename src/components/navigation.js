import {
  ArrowLeftRight,
  CalendarClock,
  ChartNoAxesColumnIncreasing,
  LayoutDashboard,
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
  { label: "Transactions", to: "/transactions", icon: ArrowLeftRight }
];

export const BUSINESS_NAVIGATION = [
  { label: "Overview", to: "/", icon: LayoutDashboard, end: true },
  { label: "Operations", to: "/spending", icon: ChartNoAxesColumnIncreasing },
  { label: "Insights", to: "/trends", icon: TrendingUp },
  { label: "Schedules", to: "/recurring", icon: CalendarClock },
  { label: "Reserves", to: "/goals", icon: Target },
  { label: "Accounts", to: "/accounts", icon: WalletCards },
  { label: "Ledger", to: "/transactions", icon: ArrowLeftRight }
];

export function navigationFor(profileType = "personal") {
  return profileType === "business" ? BUSINESS_NAVIGATION : NAVIGATION;
}
