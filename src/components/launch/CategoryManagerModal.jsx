import { useEffect, useMemo, useState } from 'react'

function buildInitialState(categories) {
  const firstAvailable = categories[0]

  return {
    newCategory: '',
    replacementCategory: firstAvailable?.value || '',
  }
}

export function CategoryManagerModal({
  isOpen,
  categories,
  employees,
  isSaving,
  onClose,
  onAddCategory,
  onDeleteCategory,
  onAssignCategory,
}) {
  const [state, setState] = useState(() => buildInitialState(categories))

  useEffect(() => {
    setState(buildInitialState(categories))
  }, [categories])

  const categoryUsage = useMemo(() => {
    return categories.map((category) => {
      const linkedEmployees = employees.filter((employee) => employee.category === category.value)
      return {
        ...category,
        linkedEmployees,
      }
    })
  }, [categories, employees])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/70 p-3 backdrop-blur-sm sm:items-center sm:justify-center">
      <div className="w-full max-w-3xl rounded-3xl border border-zinc-200 bg-white p-4 shadow-2xl sm:p-5">
        <header className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-zinc-950">Gerenciar categorias</h3>
            <p className="text-sm text-zinc-500">
              Adicione, reatribua e exclua categorias dos colaboradores.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-full p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
            aria-label="Fechar modal"
          >
            x
          </button>
        </header>

        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <section className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <h4 className="text-sm font-semibold text-zinc-900">Nova categoria</h4>
            <div className="mt-3 space-y-2">
              <input
                type="text"
                value={state.newCategory}
                onChange={(event) =>
                  setState((previous) => ({
                    ...previous,
                    newCategory: event.target.value,
                  }))
                }
                placeholder="Ex.: Portaria"
                className="w-full rounded-2xl border border-zinc-200 bg-white px-3 py-3 text-base text-zinc-800 outline-none ring-red-600 transition focus:ring-2"
              />
              <button
                type="button"
                onClick={() => onAddCategory(state.newCategory)}
                disabled={isSaving}
                className="w-full rounded-2xl bg-red-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:bg-red-300"
              >
                Adicionar categoria
              </button>
            </div>
          </section>

          <section className="space-y-3">
            {categoryUsage.map((category) => {
              const canDelete = category.linkedEmployees.length === 0

              return (
                <article
                  key={category.value}
                  className="rounded-2xl border border-zinc-200 bg-white p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-950">{category.label}</h4>
                      <p className="mt-1 text-xs text-zinc-500">
                        {category.linkedEmployees.length} colaborador(es) vinculado(s)
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {!canDelete ? (
                        <select
                          value={state.replacementCategory}
                          onChange={(event) =>
                            setState((previous) => ({
                              ...previous,
                              replacementCategory: event.target.value,
                            }))
                          }
                          className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700 outline-none ring-red-600 transition focus:ring-2"
                        >
                          {categories
                            .filter((item) => item.value !== category.value)
                            .map((item) => (
                              <option key={item.value} value={item.value}>
                                {item.label}
                              </option>
                            ))}
                        </select>
                      ) : null}

                      <button
                        type="button"
                        disabled={isSaving || (!canDelete && !state.replacementCategory)}
                        onClick={() =>
                          onDeleteCategory(category.value, {
                            replacementCategory: canDelete ? '' : state.replacementCategory,
                          })
                        }
                        className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>

                  {category.linkedEmployees.length ? (
                    <div className="mt-3 space-y-2">
                      {category.linkedEmployees.map((employee) => (
                        <div
                          key={employee.id}
                          className="flex flex-col gap-2 rounded-2xl bg-zinc-50 p-3 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div>
                            <p className="text-sm font-medium text-zinc-900">{employee.label}</p>
                            <p className="text-xs text-zinc-500">
                              Categoria atual: {category.label}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <select
                              value={employee.category}
                              onChange={(event) =>
                                onAssignCategory(employee.id, event.target.value)
                              }
                              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 outline-none ring-red-600 transition focus:ring-2"
                            >
                              {categories.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-xs text-zinc-500">
                      Nenhum colaborador vinculado. Pode excluir sem reatribuição.
                    </p>
                  )}
                </article>
              )
            })}
          </section>
        </div>
      </div>
    </div>
  )
}
