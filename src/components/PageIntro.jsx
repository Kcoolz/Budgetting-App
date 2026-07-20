export default function PageIntro({ eyebrow, title, description, action, id, variant = "default" }) {
  if (variant === "hero") {
    return (
      <section id={id} className="overview-hero relative mb-5 overflow-hidden rounded-[28px] px-5 py-7 text-white shadow-[0_22px_60px_rgba(11,31,58,0.18)] sm:px-8 sm:py-9 lg:px-10">
        <span className="absolute -right-12 -top-20 size-56 rounded-full border border-white/10 bg-white/[0.045]" aria-hidden="true" />
        <span className="absolute -bottom-28 right-24 size-52 rounded-full border border-blue-200/10" aria-hidden="true" />
        <div className="relative flex flex-col items-start justify-between gap-7 sm:flex-row sm:items-end">
          <div>
            <p className="text-[0.675rem] font-extrabold uppercase tracking-[0.15em] text-blue-200">{eyebrow}</p>
            <h1 className="mt-2 max-w-3xl font-display text-[2.45rem] font-normal leading-[1.02] tracking-[-0.045em] sm:text-[3.25rem]">{title}</h1>
            {description && <p className="mt-3 max-w-2xl text-sm leading-relaxed text-blue-100/75">{description}</p>}
          </div>
          {action}
        </div>
      </section>
    );
  }

  return (
    <section id={id} className="mb-7 flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-1.5 font-display text-[2.35rem] font-normal leading-[1.03] tracking-[-0.045em] sm:text-5xl">{title}</h1>
        {description && <p className="mt-2.5 max-w-2xl text-sm text-slate-500">{description}</p>}
      </div>
      {action}
    </section>
  );
}
