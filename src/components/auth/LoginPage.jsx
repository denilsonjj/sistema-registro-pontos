import { useState } from 'react'

const DEFAULT_FORM = {
  username: '',
  password: '',
}

export function LoginPage({ onLogin, isSubmitting, error }) {
  const [form, setForm] = useState(DEFAULT_FORM)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    await onLogin({
      username: form.username.trim(),
      password: form.password,
    })
  }

  return (
    <div className="min-h-screen bg-zinc-100">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col lg:py-6">
        <header className="rounded-b-[2rem] bg-zinc-950 px-4 py-6 text-white shadow-xl sm:px-6">
          <h1 className="text-2xl font-bold sm:text-3xl">Gestão de Escalas</h1>
          <p className="mt-1 text-sm text-zinc-300 sm:text-base">
            Acesse com login e senha cadastrados no Google Sheets.
          </p>
        </header>

        <main className="-mt-2 flex flex-1 items-start justify-center p-4 pt-6 sm:p-6">
          <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-semibold text-zinc-950">Entrar</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Informe suas credenciais para continuar.
            </p>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-800">Login</label>
                <input
                  required
                  name="username"
                  type="text"
                  autoComplete="username"
                  value={form.username}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-3 text-base text-zinc-800 outline-none ring-red-600 transition focus:ring-2"
                  placeholder="seu.login"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-800">Senha</label>
                <input
                  required
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-3 text-base text-zinc-800 outline-none ring-red-600 transition focus:ring-2"
                  placeholder="********"
                />
              </div>

              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-1 w-full rounded-2xl bg-red-700 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-red-200 transition hover:bg-red-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-red-300 disabled:shadow-none"
              >
                {isSubmitting ? 'Entrando...' : 'Acessar sistema'}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}
