import { useState } from 'react'
import { LaunchPanel } from './components/launch/LaunchPanel'
import { RecordsPage } from './components/records/RecordsPage'
import { LoginPage } from './components/auth/LoginPage'
import { useAuth } from './hooks/useAuth'
import { useRecordsPage } from './hooks/useRecordsPage'
import { useScaleForm } from './hooks/useScaleForm'

function App() {
  const auth = useAuth()
  const [page, setPage] = useState('launch')
  const scaleForm = useScaleForm({ enabled: auth.isAuthenticated })
  const recordsPage = useRecordsPage({ enabled: auth.isAuthenticated })

  if (auth.isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
          <p className="text-sm text-slate-600">Verificando sess\u00e3o...</p>
        </div>
      </div>
    )
  }

  if (!auth.isAuthenticated) {
    return (
      <LoginPage
        isSubmitting={auth.isSubmitting}
        error={auth.error}
        onLogin={auth.login}
      />
    )
  }

  if (page === 'records') {
    return (
      <RecordsPage
        userName={auth.session?.displayName || 'Operador'}
        recordsState={recordsPage}
        onLogout={auth.logout}
        onNavigate={setPage}
        currentPage={page}
      />
    )
  }

  return (
    <LaunchPanel
      userName={auth.session?.displayName || 'Operador'}
      scaleForm={scaleForm}
      onLogout={auth.logout}
      onNavigate={setPage}
      currentPage={page}
    />
  )
}

export default App
