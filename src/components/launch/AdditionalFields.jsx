export function AdditionalFields({ extraHours, lunchDiscount, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">Hora Extra</label>
        <input
          type="number"
          min="0"
          step="0.5"
          name="extraHours"
          value={extraHours}
          onChange={onChange}
          placeholder="0"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-base text-slate-700 outline-none ring-blue-600 transition focus:ring-2"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">
          Almoco (desconto)
        </label>
        <input
          type="number"
          min="0"
          step="0.5"
          name="lunchDiscount"
          value={lunchDiscount}
          onChange={onChange}
          placeholder="0"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-base text-slate-700 outline-none ring-blue-600 transition focus:ring-2"
        />
      </div>
    </div>
  )
}
