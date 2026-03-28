const COMPANY_OPTIONS = [
  { value: 'l4_servicos', label: 'L4 Servi\u00e7os' },
  { value: 'l4_pro_service', label: 'L4 Pr\u00f3 Service' },
]

const VARIANT_STYLES = {
  header: {
    wrapper: 'grid grid-cols-2 gap-2 rounded-xl bg-white/10 p-1',
    option:
      'block rounded-lg px-3 py-3 text-center text-sm font-semibold text-blue-100 transition-all peer-checked:bg-white peer-checked:text-blue-700',
  },
  panel: {
    wrapper: 'grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1',
    option:
      'block rounded-lg px-3 py-3 text-center text-sm font-semibold text-slate-600 transition-all peer-checked:bg-white peer-checked:text-blue-700 peer-checked:shadow-sm',
  },
}

export function CompanyToggle({ value, onChange, variant = 'header' }) {
  const styles = VARIANT_STYLES[variant] || VARIANT_STYLES.header

  return (
    <div className={styles.wrapper}>
      {COMPANY_OPTIONS.map((company) => (
        <label key={company.value} className="cursor-pointer">
          <input
            type="radio"
            name="company"
            value={company.value}
            checked={value === company.value}
            onChange={() => onChange(company.value)}
            className="peer sr-only"
          />
          <span className={styles.option}>
            {company.label}
          </span>
        </label>
      ))}
    </div>
  )
}
