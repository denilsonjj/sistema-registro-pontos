import { LaunchForm } from './LaunchForm'
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
    recentRecords,
    isBootstrapping,
    syncMessage,
    syncError,
    actions,
  } = scaleForm

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col lg:py-6">
        <header className="rounded-b-3xl bg-blue-600 px-4 py-5 text-white shadow-md sm:px-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="max-w-md">
              <h1 className="text-2xl font-bold sm:text-3xl">Ola, {userName}</h1>
              <p className="text-sm text-blue-100 sm:text-base">
                Painel de Lancamento de Escalas
              </p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <a
                  href={SHEET_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50"
                >
                  Abrir planilha
                </a>
                <button
                  type="button"
                  onClick={onLogout}
                  className="inline-flex items-center rounded-xl bg-blue-700/80 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Sair
                </button>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-lg font-semibold backdrop-blur-sm">
                GS
              </div>
            </div>
          </div>

          <p className="mt-3 rounded-xl bg-white/10 px-3 py-2 text-sm text-blue-100">
            Dica: use <strong>Turno Fixo</strong> para gerar 30, 60 ou 120 dias de uma vez.
            Use <strong>Turno Eventual</strong> para extras, faltas e coberturas.
          </p>

          <nav className="mt-3 grid grid-cols-2 gap-2">
            {[
              { value: 'launch', label: 'Lancamentos' },
              { value: 'records', label: 'Registros' },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => onNavigate(item.value)}
                className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                  currentPage === item.value
                    ? 'bg-white text-blue-700'
                    : 'bg-white/10 text-blue-100 hover:bg-white/20'
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
              <div className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800">
                Carregando dados da planilha...
              </div>
            ) : null}

            {syncMessage ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                {syncMessage}
              </div>
            ) : null}

            {syncError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
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
    </div>
  )
}
