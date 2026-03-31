const APPS_SCRIPT_ENDPOINT = import.meta.env.VITE_APPS_SCRIPT_URL || ''
let sessionToken = ''
const REQUEST_TIMEOUT_MS = 20000

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
    const preview = String(raw || '').slice(0, 120).replace(/\s+/g, ' ')
    throw new Error(
      `Resposta invalida da API (nao JSON). Verifique deploy/permissoes do Apps Script. Trecho: ${preview}`,
    )
  }
}

async function requestGet(params) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  let response

  try {
    response = await fetch(getEndpointUrl(withAuthParams(params)), {
      signal: controller.signal,
      redirect: 'follow',
    })
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error('Tempo limite excedido ao consultar Apps Script (GET).')
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
  }

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
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  let response

  try {
    response = await fetch(getEndpointUrl(), {
      method: 'POST',
      // Apps Script costuma bloquear preflight com application/json.
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(withAuthBody(body, useAuth)),
      signal: controller.signal,
      redirect: 'follow',
    })
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error('Tempo limite excedido ao consultar Apps Script (POST).')
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
  }

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

export function getRecordsReport({ company, employeeId, postId, month, limit = 500 } = {}) {
  return requestGet({
    action: 'recordsreport',
    company: company || '',
    employeeId: employeeId || '',
    postId: postId || '',
    month: month || '',
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

export function createCategory(payload) {
  return requestPost({
    action: 'createcategory',
    payload,
  })
}

export function deleteCategory(payload) {
  return requestPost({
    action: 'deletecategory',
    payload,
  })
}

export function updateEmployeeCategory(payload) {
  return requestPost({
    action: 'updateemployeecategory',
    payload,
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

export function updateScaleEntry({ scaleId, data }) {
  return requestPost({
    action: 'updatescaleentry',
    payload: {
      scaleId,
      data,
    },
  })
}
