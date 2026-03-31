import { AdditionalFields } from './AdditionalFields'
import { CompanyToggle } from './CompanyToggle'
import { LaunchTypeSelector } from './LaunchTypeSelector'
import { PanelSection } from './PanelSection'
import { SelectWithAdd } from './SelectWithAdd'
import { WEEKDAY_OPTIONS } from '../../utils/scheduleEngine'
import { formatDate } from '../../utils/formatters'

function PreviewCard({
  schedulePreview,
  previewEntries,
  excludedDates,
  onToggleDate,
  onClearDates,
}) {
  if (!schedulePreview.totalEntries && !previewEntries.length) {
    return null
  }

  const excludedSet = new Set(excludedDates || [])

  return (
    <div className="rounded-3xl border border-red-100 bg-red-50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-zinc-950">Pre-visualizacao da escala</h3>
          <p className="mt-1 text-xs text-zinc-600">{schedulePreview.ruleText}</p>
        </div>
        <div className="rounded-2xl bg-white px-3 py-2 text-right shadow-sm">
          <p className="text-[11px] uppercase tracking-wide text-zinc-500">Turnos previstos</p>
          <p className="text-lg font-semibold text-red-700">{schedulePreview.workDays}</p>
        </div>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-4">
        <div className="rounded-2xl bg-white px-3 py-3 shadow-sm">
          <p className="text-xs text-zinc-500">Dias lancados</p>
          <p className="mt-1 text-base font-semibold text-zinc-950">{schedulePreview.totalEntries}</p>
        </div>
        <div className="rounded-2xl bg-white px-3 py-3 shadow-sm">
          <p className="text-xs text-zinc-500">Dias de trabalho</p>
          <p className="mt-1 text-base font-semibold text-zinc-950">{schedulePreview.workDays}</p>
        </div>
        <div className="rounded-2xl bg-white px-3 py-3 shadow-sm">
          <p className="text-xs text-zinc-500">Folgas previstas</p>
          <p className="mt-1 text-base font-semibold text-zinc-950">{schedulePreview.offDays}</p>
        </div>
        <div className="rounded-2xl bg-white px-3 py-3 shadow-sm">
          <p className="text-xs text-zinc-500">Dias ignorados</p>
          <p className="mt-1 text-base font-semibold text-zinc-950">{schedulePreview.excludedCount || 0}</p>
        </div>
      </div>

      <div className="mt-3 rounded-2xl border border-dashed border-red-200 bg-white p-3">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Datas geradas (toque para ignorar/incluir antes de salvar)
          </p>
          {(schedulePreview.excludedCount || 0) > 0 ? (
            <button
              type="button"
              onClick={onClearDates}
              className="rounded-xl border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-100"
            >
              Restaurar todas
            </button>
          ) : null}
        </div>

        <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
          {previewEntries.map((entry) => {
            const isWork = entry.status === 'TRABALHO'
            const isExcluded = excludedSet.has(entry.date)

            return (
              <button
                key={`${entry.date}-${entry.status}`}
                type="button"
                onClick={() => onToggleDate(entry.date)}
                className={`flex w-full items-center justify-between rounded-2xl border px-3 py-2 text-left transition ${
                  isExcluded
                    ? 'border-zinc-200 bg-zinc-100 text-zinc-500'
                    : isWork
                      ? 'border-emerald-200 bg-emerald-50 text-zinc-800 hover:bg-emerald-100'
                      : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                <div>
                  <p className={`text-sm font-semibold ${isExcluded ? 'line-through' : ''}`}>
                    {formatDate(entry.date)}
                  </p>
                  <p className="text-xs">
                    {isWork
                      ? `${entry.start || '--:--'} - ${entry.end || '--:--'}`
                      : 'Folga'}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs font-semibold">{isWork ? 'Trabalho' : 'Folga'}</p>
                  <p className="text-xs">{isExcluded ? 'Ignorado' : 'Ativo'}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function LaunchForm({ scaleForm }) {
  const {
    form,
    search,
    options,
    fileError,
    previewEntries,
    excludedDates,
    schedulePreview,
    isBatchLaunch,
    isEventualLaunch,
    shouldShowUploadField,
    isSubmitting,
    actions,
  } = scaleForm

  return (
    <form onSubmit={actions.handleSubmit} className="space-y-4">
      <PanelSection
        title="Empresa"
        description="Defina a empresa antes de selecionar colaborador e posto"
      >
        <CompanyToggle value={form.company} onChange={actions.setCompany} variant="panel" />
      </PanelSection>

      <PanelSection
        title="Colaborador"
        description="Escolha a categoria e depois selecione o colaborador"
      >
        <div className="mb-3 flex justify-end">
          <button
            type="button"
            onClick={actions.openCategoryManager}
            className="rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
          >
            Gerenciar categorias
          </button>
        </div>

        <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {options.employeeCategories.map((category) => (
            <label key={category.value} className="cursor-pointer">
              <input
                type="radio"
                name="employeeCategory"
                value={category.value}
                checked={form.employeeCategory === category.value}
                onChange={() => actions.updateField('employeeCategory', category.value)}
                className="peer sr-only"
              />
              <span className="block rounded-2xl border border-zinc-200 px-3 py-3 text-center text-sm font-medium text-zinc-700 transition-all peer-checked:border-red-700 peer-checked:bg-red-50 peer-checked:text-red-700">
                {category.label}
              </span>
            </label>
          ))}
        </div>

        <SelectWithAdd
          label="Colaborador"
          placeholder="Selecione o colaborador..."
          value={form.employeeId}
          options={options.employees}
          searchTerm={search.employee}
          showSearch
          onChange={(value) => actions.updateField('employeeId', value)}
          onSearchChange={(value) => actions.setSearchValue('employee', value)}
          onAddClick={() => actions.openQuickAddModal('employee')}
        />
      </PanelSection>

      <PanelSection title="Posto" description="Selecione o local de trabalho">
        <SelectWithAdd
          label="Posto"
          placeholder="Selecione o posto..."
          value={form.postId}
          options={options.posts}
          showSearch={false}
          onChange={(value) => actions.updateField('postId', value)}
          onAddClick={() => actions.openQuickAddModal('post')}
        />
      </PanelSection>

      <PanelSection
        title="Lancamento"
        description="Use turno fixo para automatizar e eventual para excecoes"
      >
        <LaunchTypeSelector
          launchType={form.launchType}
          launchTypeOptions={options.launchTypes}
          eventualReason={form.eventualReason}
          eventualDate={form.eventualDate}
          eventualOptions={options.eventualReasons}
          onLaunchTypeChange={actions.setLaunchType}
          onEventualReasonChange={actions.setEventualReason}
          onEventualDateChange={(value) => actions.updateField('eventualDate', value)}
        />

        {isBatchLaunch ? (
          <div className="mt-4 space-y-3 rounded-3xl border border-zinc-200 bg-zinc-50 p-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-3">
                <label className="text-sm font-medium text-zinc-800">Turno fixo</label>
                <button
                  type="button"
                  onClick={() => actions.openQuickAddModal('shift')}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-red-200 bg-red-50 text-lg font-bold text-red-700 transition-colors hover:bg-red-100"
                  aria-label="Adicionar turno"
                >
                  +
                </button>
              </div>
              <select
                required
                value={form.shiftId}
                onChange={(event) => actions.updateField('shiftId', event.target.value)}
                className="w-full rounded-2xl border border-zinc-200 bg-white px-3 py-3 text-base text-zinc-800 outline-none ring-red-600 transition focus:ring-2"
              >
                <option value="">Selecione o turno fixo...</option>
                {options.shifts.map((shift) => (
                  <option key={shift.id} value={shift.id}>
                    {shift.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-800">Inicio da escala</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(event) => actions.updateField('startDate', event.target.value)}
                  className="w-full rounded-2xl border border-zinc-200 bg-white px-3 py-3 text-base text-zinc-800 outline-none ring-red-600 transition focus:ring-2"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-800">Periodo</label>
                <select
                  value={form.batchDays}
                  onChange={(event) => actions.updateField('batchDays', Number(event.target.value))}
                  className="w-full rounded-2xl border border-zinc-200 bg-white px-3 py-3 text-base text-zinc-800 outline-none ring-red-600 transition focus:ring-2"
                >
                  {options.batchDays.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-zinc-800">Regra de repeticao</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {options.recurrenceModes.map((option) => (
                  <label key={option.value} className="cursor-pointer">
                    <input
                      type="radio"
                      name="recurrenceMode"
                      value={option.value}
                      checked={form.recurrenceMode === option.value}
                      onChange={() => actions.updateField('recurrenceMode', option.value)}
                      className="peer sr-only"
                    />
                    <span className="block rounded-2xl border border-zinc-200 bg-white px-3 py-3 text-sm font-medium text-zinc-700 transition peer-checked:border-red-700 peer-checked:bg-red-50 peer-checked:text-red-700">
                      <span className="block">{option.label}</span>
                      <span className="mt-1 block text-xs font-normal text-zinc-500">
                        {option.description}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {form.recurrenceMode === 'weekly_custom' ? (
              <div className="space-y-2 rounded-2xl border border-dashed border-red-200 bg-white p-3">
                <p className="text-sm font-medium text-zinc-800">Dias fixos da semana</p>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                  {WEEKDAY_OPTIONS.map((day) => {
                    const checked = form.customWeekDays.includes(day.value)
                    return (
                      <label key={day.value} className="cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => actions.toggleCustomWeekDay(day.value)}
                          className="peer sr-only"
                        />
                        <span className="block rounded-2xl border border-zinc-200 px-3 py-3 text-center text-sm font-medium text-zinc-700 transition peer-checked:border-red-700 peer-checked:bg-red-50 peer-checked:text-red-700">
                          {day.shortLabel}
                        </span>
                      </label>
                    )
                  })}
                </div>
                <p className="text-xs text-zinc-500">
                  Exemplo: marque terca e quinta para uma escala fixa nesses dois dias.
                </p>
              </div>
            ) : null}

            <PreviewCard
              schedulePreview={schedulePreview}
              previewEntries={previewEntries}
              excludedDates={excludedDates}
              onToggleDate={actions.toggleExcludedDate}
              onClearDates={actions.clearExcludedDates}
            />
          </div>
        ) : null}

        {isEventualLaunch ? (
          <div className="mt-4 space-y-3 rounded-3xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-900">
              Use eventual para cobrir falta, hora extra ou colaborador avulso.
            </p>
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-3">
                <label className="text-sm font-medium text-zinc-800">Turno do evento</label>
                <button
                  type="button"
                  onClick={() => actions.openQuickAddModal('shift')}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-red-200 bg-red-50 text-lg font-bold text-red-700 transition-colors hover:bg-red-100"
                  aria-label="Adicionar turno"
                >
                  +
                </button>
              </div>
              <select
                required
                value={form.shiftId}
                onChange={(event) => actions.updateField('shiftId', event.target.value)}
                className="w-full rounded-2xl border border-zinc-200 bg-white px-3 py-3 text-base text-zinc-800 outline-none ring-red-600 transition focus:ring-2"
              >
                <option value="">Selecione o turno do evento...</option>
                {options.shifts.map((shift) => (
                  <option key={shift.id} value={shift.id}>
                    {shift.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : null}
      </PanelSection>

      {shouldShowUploadField ? (
        <PanelSection title="Upload de atestado" description="O arquivo sera convertido para Base64">
          <div className="space-y-2">
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={actions.handleFileSelection}
              className="w-full rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-3 text-sm text-zinc-600 file:mr-3 file:rounded-xl file:border-0 file:bg-red-700 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-red-800"
            />

            {form.attachment ? (
              <p className="rounded-2xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                Arquivo convertido: {form.attachment.name}
              </p>
            ) : null}
          </div>

          {fileError ? (
            <p className="mt-2 rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-700">
              {fileError}
            </p>
          ) : null}
        </PanelSection>
      ) : null}

      <PanelSection
        title="Adicionais"
        description="Lance hora extra, refeicao e deixe visivel o motivo do desconto"
      >
        <AdditionalFields
          extraHours={form.extraHours}
          lunchDiscount={form.lunchDiscount}
          mealAllowance={form.mealAllowance}
          autoMealAllowance={form.autoMealAllowance}
          discountReason={form.discountReason}
          workedDays={schedulePreview.workDays}
          onChange={(event) => actions.updateField(event.target.name, event.target.value)}
          onAutoMealAllowanceChange={actions.setAutoMealAllowance}
        />
      </PanelSection>

      <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-red-700 px-4 py-4 text-base font-semibold text-white shadow-lg shadow-red-200 transition hover:bg-red-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-red-300 disabled:shadow-none"
        >
          {isSubmitting
            ? 'Salvando na planilha...'
            : isBatchLaunch
              ? 'Gerar Escala Automatica'
              : 'Salvar Lancamento Eventual'}
        </button>
      </div>
    </form>
  )
}
