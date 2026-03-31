export function LaunchTypeSelector({
  launchType,
  launchTypeOptions,
  eventualReason,
  eventualDate,
  eventualOptions,
  onLaunchTypeChange,
  onEventualReasonChange,
  onEventualDateChange,
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {launchTypeOptions.map((option) => (
          <label key={option.value} className="cursor-pointer">
            <input
              type="radio"
              name="launchType"
              value={option.value}
              checked={launchType === option.value}
              onChange={() => onLaunchTypeChange(option.value)}
              className="peer sr-only"
            />
            <span className="block rounded-2xl border border-zinc-200 px-3 py-3 text-left text-sm font-semibold text-zinc-800 transition-all peer-checked:border-red-700 peer-checked:bg-red-50 peer-checked:text-red-700">
              <span className="block">{option.label}</span>
              <span className="mt-1 block text-xs font-normal text-zinc-500">
                {option.description}
              </span>
            </span>
          </label>
        ))}
      </div>

      {launchType === 'eventual' ? (
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-800">Tipo eventual</label>
            <select
              value={eventualReason}
              onChange={(event) => onEventualReasonChange(event.target.value)}
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-3 text-base text-zinc-800 outline-none ring-red-600 transition focus:ring-2"
            >
              {eventualOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-800">Data eventual</label>
            <input
              type="date"
              value={eventualDate}
              onChange={(event) => onEventualDateChange(event.target.value)}
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-3 text-base text-zinc-800 outline-none ring-red-600 transition focus:ring-2"
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}
