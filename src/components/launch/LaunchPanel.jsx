import { LaunchForm } from './LaunchForm'
import { CategoryManagerModal } from './CategoryManagerModal'
import { QuickAddModal } from './QuickAddModal'
import { RecentRecordsList } from './RecentRecordsList'

const SHEET_URL =
  import.meta.env.VITE_SHEETS_URL ||
  'https://docs.google.com/spreadsheets/d/PLANILHA_EXEMPLO/edit'

export function LaunchPanel({
  userName,
  scaleForm,
  onLogout,
  onNavigate,
  currentPage,
}) {
  const {
    modal,
    isCategoryManagerOpen,
    recentRecords,
    isBootstrapping,
    syncMessage,
    syncError,
    actions,
  } = scaleForm

  return (
    <div className="min-h-screen bg-zinc-100">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col lg:py-6">
        <header className="rounded-b-[2rem] bg-zinc-950 px-4 py-5 text-white shadow-xl sm:px-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="max-w-lg">
              <h1 className="text-2xl font-bold sm:text-3xl">Olá, {userName}</h1>
              <p className="mt-1 text-sm text-zinc-300 sm:text-base">
                Painel de lançamento de escalas
              </p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <a
                  href={SHEET_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-zinc-950 shadow-sm transition hover:bg-zinc-100"
                >
                  Abrir planilha
                </a>
                <button
                  type="button"
                  onClick={onLogout}
                  className="inline-flex items-center rounded-2xl bg-red-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-800"
                >
                  Sair
                </button>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-lg font-semibold text-red-300 backdrop-blur-sm">
                L4
              </div>
            </div>
          </div>

          <p className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-zinc-200">
            Use <strong className="text-white">Turno Fixo</strong> para gerar 30, 60 ou 120 dias de
            uma vez. Use <strong className="text-white">Lançamento Eventual</strong> para falta,
            cobertura e ajuste manual.
          </p>

          <nav className="mt-3 grid grid-cols-2 gap-2">
            {[
              { value: 'launch', label: 'Lançamentos' },
              { value: 'records', label: 'Registros' },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => onNavigate(item.value)}
                className={`rounded-2xl px-3 py-2 text-sm font-medium transition ${
                  currentPage === item.value
                    ? 'bg-white text-red-700'
                    : 'bg-white/5 text-zinc-200 hover:bg-white/10'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </header>

        <main className="-mt-2 flex-1 p-4 pt-6 sm:p-6">
          <div className="mx-auto w-full max-w-4xl space-y-4">
            {isBootstrapping ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
                Carregando dados da planilha...
              </div>
            ) : null}

            {syncMessage ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                {syncMessage}
              </div>
            ) : null}

            {syncError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                {syncError}
              </div>
            ) : null}

            <LaunchForm scaleForm={scaleForm} />
            <RecentRecordsList records={recentRecords} />
          </div>
        </main>
      </div>

      {modal.isOpen ? (
        <QuickAddModal
          isOpen={modal.isOpen}
          type={modal.type}
          onClose={actions.closeQuickAddModal}
          onSave={actions.saveQuickAdd}
        />
      ) : null}

      <CategoryManagerModal
        isOpen={isCategoryManagerOpen}
        categories={scaleForm.options.employeeCategories}
        employees={scaleForm.options.allEmployees}
        isSaving={scaleForm.isSavingLookup}
        onClose={actions.closeCategoryManager}
        onAddCategory={actions.addCategory}
        onDeleteCategory={actions.deleteCategory}
        onAssignCategory={actions.assignEmployeeCategory}
      />
    </div>
  )
}
