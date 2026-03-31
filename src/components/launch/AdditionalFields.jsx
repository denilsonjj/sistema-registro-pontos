export function AdditionalFields({
  extraHours,
  lunchDiscount,
  mealAllowance,
  autoMealAllowance,
  discountReason,
  workedDays,
  onChange,
  onAutoMealAllowanceChange,
}) {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-800">Hora extra</label>
          <input
            type="number"
            min="0"
            step="0.5"
            name="extraHours"
            value={extraHours}
            onChange={onChange}
            placeholder="0"
            className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-3 text-base text-zinc-800 outline-none ring-red-600 transition focus:ring-2"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-800">Almoco / janta (desconto)</label>
          <input
            type="number"
            min="0"
            step="0.5"
            name="lunchDiscount"
            value={lunchDiscount}
            onChange={onChange}
            placeholder="0"
            className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-3 text-base text-zinc-800 outline-none ring-red-600 transition focus:ring-2"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-[220px_1fr]">
        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-800">Vale / refeicao</label>
          <label className="flex cursor-pointer items-center gap-2 text-xs text-zinc-600">
            <input
              type="checkbox"
              checked={Boolean(autoMealAllowance)}
              onChange={(event) => onAutoMealAllowanceChange(event.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 text-red-700 focus:ring-red-600"
            />
            Calcular automatico pelos dias de trabalho
          </label>
          <input
            type="number"
            min="0"
            step="1"
            name="mealAllowance"
            value={mealAllowance}
            onChange={onChange}
            placeholder={workedDays ? String(workedDays) : '0'}
            disabled={Boolean(autoMealAllowance)}
            className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-3 text-base text-zinc-800 outline-none ring-red-600 transition focus:ring-2 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-500"
          />
          {autoMealAllowance ? (
            <p className="text-xs text-zinc-500">Valor atualizado conforme a previa da escala.</p>
          ) : null}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-800">Motivo do desconto</label>
          <input
            type="text"
            name="discountReason"
            value={discountReason}
            onChange={onChange}
            placeholder="Ex.: falta parcial, ajuste manual, refeicao nao utilizada"
            className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-3 text-base text-zinc-800 outline-none ring-red-600 transition focus:ring-2"
          />
        </div>
      </div>

      {workedDays ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-3 py-3 text-sm text-red-900">
          Previa do periodo: <strong>{workedDays}</strong> turnos de trabalho previstos.
        </div>
      ) : null}
    </div>
  )
}
