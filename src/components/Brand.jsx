import { Link } from "react-router";

export default function Brand({ compact = false }) {
  return (
    <Link to="/" className="flex items-center gap-3 font-bold tracking-[-0.02em] text-current" aria-label="Cloud Budget home">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-100 text-forest-900">
        <svg viewBox="0 0 32 32" className="size-6 fill-none stroke-current stroke-[2.2] [stroke-linecap:round] [stroke-linejoin:round]" aria-hidden="true">
          <path d="M9.5 25h14a5.5 5.5 0 0 0 .7-10.96A8.5 8.5 0 0 0 8.08 12.6 6.25 6.25 0 0 0 9.5 25Z" />
        </svg>
      </span>
      {!compact && <span className="text-lg">Cloud</span>}
    </Link>
  );
}
