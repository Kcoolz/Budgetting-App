import { getProfileColor, getProfileInitials } from "../lib/profiles";

export default function ProfileAvatar({ profile, className = "size-10", textClassName = "text-xs" }) {
  const color = getProfileColor(profile?.color);

  return (
    <span
      className={`grid shrink-0 place-items-center rounded-xl font-extrabold ${className} ${textClassName}`}
      style={{ backgroundColor: color.soft, color: color.accent }}
      aria-hidden="true"
    >
      {getProfileInitials(profile?.name)}
    </span>
  );
}
