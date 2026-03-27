import { AdditionalFields } from './AdditionalFields'
import { CompanyToggle } from './CompanyToggle'
import { LaunchTypeSelector } from './LaunchTypeSelector'
import { PanelSection } from './PanelSection'
import { SelectWithAdd } from './SelectWithAdd'

function getShiftRuleText(shift) {
  if (!shift) return ''

  if (shift.family === '5x2') {
    return `Regra automatica: trabalha de segunda a sexta (${shift.start} - ${shift.end}) e folga sabado e domingo.`
  }

  if (shift.family === '6x1') {
    return `Regra automatica: trabalha de segunda a sabado. Sabado segue horario reduzido (${shift.saturdayStart} - ${shift.saturdayEnd}). Domingo fica como folga.`
  }

  if (shift.family === '12x36') {
    const parityLabel = shift.parity === 'par' ? 'dias pares' : 'dias impares'
    return `Regra automatica: escala 12x36 respeitando ${parityLabel}, no horario ${shift.start} - ${shift.end}.`
  }

  return ''
}

export function LaunchForm({ scaleForm }) {
  const {
    form,
    search,
    options,
    fileError,
    isBatchLaunch,
    isEventualLaunch,
    shouldShowUploadField,
    isSubmitting,
    actions,
  } = scaleForm
  const selectedShift = options.shifts.find((shift) => shift.id === form.shiftId)
  const shiftRuleText = getShiftRuleText(selectedShift)

  return (
    <form onSubmit={actions.handleSubmit} className="space-y-4">
      <PanelSection
        title="Empresa ativa"
        description="Escolha a empresa antes de selecionar funcionario e posto"
      >
        <CompanyToggle
          value={form.company}
          onChange={actions.setCompany}
          variant="panel"
        />
      </PanelSection>

      <PanelSection
        title="Funcionario"
        description="Escolha a funcao e depois selecione o colaborador"
      >
        <div className="mb-3 grid grid-cols-2 gap-2">
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
              <span className="block rounded-xl border border-slate-200 px-3 py-3 text-center text-sm font-medium text-slate-700 transition-all peer-checked:border-blue-600 peer-checked:bg-blue-50 peer-checked:text-blue-700">
                {category.label}
              </span>
            </label>
          ))}
        </div>

        <SelectWithAdd
          label="Funcionario"
          placeholder="Selecione o funcionario..."
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
        title="Modo de Lancamento"
        description="Use fixo para automacao e eventual para ajustes pontuais"
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
          <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
            <p className="mb-2 text-sm font-medium text-emerald-800">
              Automacao ativa: a escala sera criada de uma vez.
            </p>
            <div className="space-y-2">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700">Turno Fixo</label>
                  <button
                    type="button"
                    onClick={() => actions.openQuickAddModal('shift')}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-lg font-bold text-blue-600 transition-colors hover:bg-blue-100"
                    aria-label="Adicionar turno"
                  >
                    +
                  </button>
                </div>
                <select
                  required
                  value={form.shiftId}
                  onChange={(event) => actions.updateField('shiftId', event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-base text-slate-700 outline-none ring-blue-600 transition focus:ring-2"
                >
                  <option value="">Selecione o turno fixo...</option>
                  {options.shifts.map((shift) => (
                    <option key={shift.id} value={shift.id}>
                      {shift.label}
                    </option>
                  ))}
                </select>
              </div>

              {shiftRuleText ? (
                <p className="rounded-lg bg-white/80 px-3 py-2 text-xs text-emerald-900">
                  {shiftRuleText}
                </p>
              ) : null}
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Inicio</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(event) => actions.updateField('startDate', event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-base text-slate-700 outline-none ring-blue-600 transition focus:ring-2"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Periodo</label>
                <select
                  value={form.batchDays}
                  onChange={(event) => actions.updateField('batchDays', Number(event.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-base text-slate-700 outline-none ring-blue-600 transition focus:ring-2"
                >
                  {options.batchDays.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ) : null}

        {isEventualLaunch ? (
          <div className="mt-3 space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
            <p className="text-sm text-amber-800">
              Use eventual para cobrir falta, hora extra ou funcionario avulso.
            </p>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">Turno do evento</label>
                <button
                  type="button"
                  onClick={() => actions.openQuickAddModal('shift')}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-lg font-bold text-blue-600 transition-colors hover:bg-blue-100"
                  aria-label="Adicionar turno"
                >
                  +
                </button>
              </div>
              <select
                required
                value={form.shiftId}
                onChange={(event) => actions.updateField('shiftId', event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-base text-slate-700 outline-none ring-blue-600 transition focus:ring-2"
              >
                <option value="">Selecione o turno do evento...</option>
                {options.shifts.map((shift) => (
                  <option key={shift.id} value={shift.id}>
                    {shift.label}
                  </option>
                ))}
              </select>
            </div>

            {shiftRuleText ? (
              <p className="rounded-lg bg-white/80 px-3 py-2 text-xs text-amber-900">
                {shiftRuleText}
              </p>
            ) : null}
          </div>
        ) : null}
      </PanelSection>

      {shouldShowUploadField ? (
        <PanelSection title="Upload de atestado" description="Arquivo sera convertido para Base64">
          <div className="space-y-2">
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={actions.handleFileSelection}
              className="w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-600 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-blue-700"
            />

            {form.attachment ? (
              <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                Arquivo convertido: {form.attachment.name}
              </p>
            ) : null}
          </div>

          {fileError ? (
            <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {fileError}
            </p>
          ) : null}
        </PanelSection>
      ) : null}

      <PanelSection title="Adicionais" description="Hora extra e desconto de almoco">
        <AdditionalFields
          extraHours={form.extraHours}
          lunchDiscount={form.lunchDiscount}
          onChange={(event) => actions.updateField(event.target.name, event.target.value)}
        />
      </PanelSection>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-blue-600 px-4 py-4 text-base font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-blue-300 disabled:shadow-none"
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
