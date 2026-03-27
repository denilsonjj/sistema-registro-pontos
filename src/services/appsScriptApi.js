const APPS_SCRIPT_ENDPOINT = import.meta.env.VITE_APPS_SCRIPT_URL || ''
let sessionToken = ''

function getEndpointUrl(params = {}) {
  if (!APPS_SCRIPT_ENDPOINT) {
    throw new Error('Defina VITE_APPS_SCRIPT_URL no arquivo .env')
  }

  const query = new URLSearchParams(params).toString()
  return query ? `${APPS_SCRIPT_ENDPOINT}?${query}` : APPS_SCRIPT_ENDPOINT
}

function withAuthParams(params = {}) {
  if (!sessionToken) return params
  return { ...params, token: sessionToken }
}

function withAuthBody(body = {}, useAuth = true) {
  if (!useAuth || !sessionToken) return body
  return { ...body, token: sessionToken }
}

async function readJsonResponse(response) {
  const raw = await response.text()

  try {
    return JSON.parse(raw)
  } catch {
    throw new Error('Resposta invalida da API.')
  }
}

async function requestGet(params) {
  const response = await fetch(getEndpointUrl(withAuthParams(params)))

  if (!response.ok) {
    throw new Error(`Erro HTTP ${response.status}`)
  }

  const data = await readJsonResponse(response)

  if (!data.ok) {
    throw new Error(data.error || 'Falha na requisicao GET.')
  }

  return data
}

async function requestPost(body, { useAuth = true } = {}) {
  const response = await fetch(getEndpointUrl(), {
    method: 'POST',
    // Apps Script costuma bloquear preflight com application/json.
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(withAuthBody(body, useAuth)),
  })

  if (!response.ok) {
    throw new Error(`Erro HTTP ${response.status}`)
  }

  const data = await readJsonResponse(response)

  if (!data.ok) {
    throw new Error(data.error || 'Falha na requisicao POST.')
  }

  return data
}

export function pingApi() {
  return requestGet({ action: 'ping' })
}

export function getBootstrapData() {
  return requestGet({ action: 'bootstrap' })
}

export function getRecentRecords({ company, limit = 10 } = {}) {
  return requestGet({
    action: 'recentrecords',
    company: company || '',
    limit: String(limit),
  })
}

export function createScaleLaunch(payload) {
  return requestPost({
    action: 'createlaunch',
    payload,
  })
}

export function createLookupItem(type, payload) {
  return requestPost({
    action: 'createlookupitem',
    payload: {
      type,
      data: payload,
    },
  })
}

export function loginWithPassword({ username, password }) {
  return requestPost(
    {
      action: 'login',
      payload: {
        username,
        password,
      },
    },
    { useAuth: false },
  )
}

export function setApiSessionToken(token) {
  sessionToken = String(token || '')
}

export function updateScaleLaunch({ launchId, data }) {
  return requestPost({
    action: 'updatelaunch',
    payload: {
      launchId,
      data,
    },
  })
}
