const variants = {
  primary: "border-forest-900 bg-forest-900 text-white hover:border-forest-800 hover:bg-forest-800 hover:shadow-md",
  secondary: "border-black/8 bg-white text-ink-900 hover:border-forest-700/25 hover:bg-forest-50",
  ghost: "border-transparent bg-transparent text-slate-600 hover:bg-black/[0.035] hover:text-ink-900",
  danger: "border-rose-700 bg-rose-700 text-white hover:border-rose-800 hover:bg-rose-800 hover:shadow-md",
  heroPrimary: "border-white bg-white text-forest-900 shadow-lg shadow-black/10 hover:border-blue-50 hover:bg-blue-50",
  heroGhost: "border-white/15 bg-white/10 text-white hover:border-white/25 hover:bg-white/15"
};

export default function Button({ variant = "secondary", className = "", children, ...props }) {
  return (
    <button
      className={`interactive-button inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
