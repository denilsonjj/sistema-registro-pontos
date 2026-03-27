import { useEffect, useMemo, useState } from 'react'
import { loginWithPassword, setApiSessionToken } from '../services/appsScriptApi'

const SESSION_STORAGE_KEY = 'sistema_ponto_auth_session'

function readStoredSession() {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null

    return {
      token: String(parsed.token || ''),
      username: String(parsed.username || ''),
      displayName: String(parsed.displayName || parsed.username || 'Operador'),
    }
  } catch {
    return null
  }
}

function saveStoredSession(session) {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
}

function clearStoredSession() {
  localStorage.removeItem(SESSION_STORAGE_KEY)
}

export function useAuth() {
  const [session, setSession] = useState(null)
  const [isChecking, setIsChecking] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const restoredSession = readStoredSession()
    setSession(restoredSession)
    setApiSessionToken(restoredSession?.token || '')
    setIsChecking(false)
  }, [])

  const login = async ({ username, password }) => {
    if (!username || !password) {
      setError('Preencha login e senha.')
      return false
    }

    setError('')
    setIsSubmitting(true)

    try {
      const response = await loginWithPassword({ username, password })
      const data = response?.data || {}
      const user = data.user || {}
      const token = String(
        data.token || data.sessionToken || data?.session?.token || '',
      ).trim()

      if (!token) {
        throw new Error('API de login nao retornou token de sessao.')
      }

      const normalizedSession = {
        token,
        username: String(user.usuario || user.username || username),
        displayName: String(
          user.nome || user.displayName || user.usuario || user.username || username,
        ),
      }

      setApiSessionToken(token)
      saveStoredSession(normalizedSession)
      setSession(normalizedSession)
      return true
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Falha ao autenticar.',
      )
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  const logout = () => {
    setApiSessionToken('')
    clearStoredSession()
    setSession(null)
    setError('')
  }

  return {
    session,
    isChecking,
    isSubmitting,
    error,
    isAuthenticated: useMemo(() => Boolean(session), [session]),
    login,
    logout,
  }
}
