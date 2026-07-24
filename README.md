# Cloud Budget

Cloud is a React and Tailwind CSS local-first budgeting PWA. It works in a desktop or mobile browser, keeps financial data in that browser's local storage, and supports offline use after the first production visit.

## Run it locally

You need Node.js 22.12 or newer. Install the dependencies once, then start the Vite development server:

```powershell
npm.cmd install
npm.cmd start
```

Then open <http://localhost:4173>.

To test on a phone connected to the same Wi-Fi network, run:

```powershell
npm.cmd run phone
```

Then open `http://YOUR-COMPUTER-IP:4173` in Safari, Chrome, or another mobile browser. The computer must stay awake while using the development server. This local address is for testing; installable and away-from-home access requires an HTTPS deployment.

Run the automated checks with:

```powershell
npm.cmd test
npm.cmd run check
npm.cmd run test:e2e
```

## Current features

- Monthly category budgets
- Month-specific budget plans that remain independent from historical months
- Income-capped safe-to-spend guidance based on income actually recorded
- Income and expense tracking
- Financial accounts for cash, checking, savings, investments, credit cards, and loans
- Account balances, net financial position, and amount-owed summaries
- Internal transfers that do not inflate income or spending
- Credit-card accounts can feed the payoff planner so balances are not entered twice
- Monthly cash-flow and category summaries
- Daily spending sparkline and prior-month comparison
- Safe-to-spend daily allowance
- Quick-add transactions such as `15 Coffee`
- Color-coded category budget progress
- Bills-first Spending workspace with fixed and flexible costs separated
- Credit-card avalanche and snowball payoff projections
- Overview debt-payoff snapshot with total balance, monthly plan, projected finish, and priority card
- Weekly, biweekly, monthly, and yearly income or outgoing-payment schedules
- Fourteen-day upcoming-obligations calendar
- Savings goals with linked accounts, deposits, withdrawals, transfers, and recurring contribution plans
- Full-month planning calendar with bill dates, preferred goal dates, and hard deadlines
- Goal pace guidance for both planned and must-have completion dates
- Transaction review queue with bulk approve, clear, categorize, tag, and delete actions
- Custom spending categories with editing, ordering, archiving, and history-safe merging
- Split transactions across two or more budget categories
- Reusable ordered local rules with match previews, editing, and optional retroactive application
- On-device recurring-pattern suggestions from transaction history
- Schedule inbox with paid, received, skipped, due, and overdue states
- Forty-five-day account cash-flow forecasts with next-income guidance and temporary what-if scenarios
- Statement-balance account reconciliation with optional budget-excluded adjustments
- Transaction search, filtering, and full editing
- Optional per-category budget rollover
- Currency selection (CAD, USD, EUR, GBP, AUD)
- CSV, OFX, and QFX importing with duplicate detection, custom CSV column mapping, import history, schedule matching, and batch undo
- Password-encrypted all-profile backups with a restore preview and monthly backup reminders
- Local JSON compatibility exports and a safety export before restore
- Mirrored localStorage and IndexedDB persistence, plus an optional device-only PIN lock
- Offline app shell, install manifest, and an in-app update-ready prompt
- Persistent light and dark themes with automatic device-theme detection
- Responsive desktop and Android layouts
- Complete Overview dashboard plus focused Spending, Recurring, Goals, and Transactions pages
- Customizable Overview sections with show, hide, reorder, and reset controls
- Route-aware desktop sidebar and mobile bottom navigation
- Multiple local profiles with independent budgets and fast profile switching
- Create profiles from scratch or duplicate an existing plan
- Personal and Business profile types with distinct navigation, language, and visual themes
- Business command centre for revenue, operating costs, profit margin, tax set-asides, overhead, and bookkeeping review
- Business expense classifications for software, advertising, payroll, equipment, travel, professional services, and more
- Three-, six-, and twelve-month spending trends with category breakdowns
- Twelve-month net-worth history and transaction CSV report exports
- Detailed expense tracking for dining out, groceries, gas, transit, subscriptions, and more
- Consistent destructive-action confirmations and undo for common transaction, goal, account, schedule, transfer, and import changes
- Route-level lazy loading plus automated unit, browser, keyboard, and accessible-name checks

## App pages

Cloud uses client-side hash routes so navigation works on localhost, static HTTPS hosting, and GitHub Pages without server rewrite rules:

- `#/` - complete Overview containing every dashboard section
- `#/spending` - budgets, category progress, and cash flow
- `#/trends` - month-over-month charts, popular spending details, and category trends
- `#/recurring` - fourteen-day bills calendar and schedules
- `#/goals` - savings targets and fund assignments
- `#/transactions` - quick add, review, and transaction history
- `#/accounts` - account balances, account management, and internal transfers
- `#/organize` - custom categories, tags, transaction rules, and recurring suggestions
- `#/profiles` - create, rename, switch, and remove local budget profiles

## Data and installation

Profiles, accounts, transfers, and transactions are mirrored between `localStorage` and IndexedDB, so each browser/device has its own separate local data. Profiles are private budget spaces, not online accounts, and do not sync between devices. Clearing browser data can remove them; use **Profiles -> Encrypted backup** to keep a password-protected recovery copy. Cloud cannot recover a forgotten backup password or local PIN.

`localhost` is sufficient for local PWA development. To install the same hosted app on Android and desktop, deploy the built site to an HTTPS host, open the URL in Chrome or Edge, and use the browser's **Install app** option.

## Deploy to GitHub Pages

The included `.github/workflows/deploy-pages.yml` workflow installs dependencies, runs unit tests, builds the app, runs the Chromium browser/accessibility suite, and deploys `dist` whenever `main` is updated. In the GitHub repository, open **Settings -> Pages**, set **Source** to **GitHub Actions**, and run the workflow from the **Actions** tab if it has not started automatically.

## Sensible next milestones

1. Add optional manual investment holdings and performance history.
2. Add more report formats and printable month-end summaries.
