export function PanelSection({ title, description, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <header className="mb-3">
        <h2 className="text-base font-semibold text-slate-800">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        ) : null}
      </header>
      {children}
    </section>
  )
}
