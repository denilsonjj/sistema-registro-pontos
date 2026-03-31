function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

export function SelectWithAdd({
  label,
  placeholder,
  value,
  options,
  searchTerm,
  showSearch = true,
  showAddButton = true,
  onChange,
  onSearchChange,
  onAddClick,
}) {
  const filteredOptions = showSearch
    ? options.filter((option) =>
        normalizeText(option.label).includes(normalizeText(searchTerm || '')),
      )
    : options

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-zinc-800">{label}</label>
        {showAddButton ? (
          <button
            type="button"
            onClick={onAddClick}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-red-200 bg-red-50 text-lg font-bold text-red-700 transition-colors hover:bg-red-100"
            aria-label={`Adicionar ${label}`}
          >
            +
          </button>
        ) : null}
      </div>

      {showSearch ? (
        <input
          type="search"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={`Buscar ${label.toLowerCase()}...`}
          className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-3 text-base text-zinc-800 outline-none ring-red-600 transition focus:ring-2"
        />
      ) : null}

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-3 text-base text-zinc-800 outline-none ring-red-600 transition focus:ring-2"
        required
      >
        <option value="">{placeholder}</option>
        {filteredOptions.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
