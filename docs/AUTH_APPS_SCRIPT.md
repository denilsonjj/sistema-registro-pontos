# Login basico (Apps Script + Sheets)

## 1) Crie a aba `usuarios`

Use estes cabecalhos na linha 1:

`id_usuario | usuario | senha | nome | perfil | ativo`

Exemplo:

`1 | admin | 123456 | Administrador | admin | TRUE`

## 2) Adicione este bloco no Apps Script

```javascript
function doGet(e) {
  try {
    const action = (e.parameter.action || '').toLowerCase()
    const token = e.parameter.token || ''

    if (action !== 'ping' && action !== 'login') {
      validarSessao_(token)
    }

    if (action === 'ping') return jsonOk_({ message: 'API online' })
    if (action === 'bootstrap') return jsonOk_(getBootstrapData_())
    if (action === 'recentrecords') return jsonOk_(getRecentRecords_(e))

    return jsonError_('Acao GET nao suportada.')
  } catch (error) {
    return jsonError_(error.message || 'Erro no GET')
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || '{}')
    const action = String(body.action || '').toLowerCase()
    const token = String(body.token || '')

    if (action !== 'login') {
      validarSessao_(token)
    }

    if (action === 'login') {
      return jsonOk_(fazerLogin_(body.payload || {}))
    }

    if (action === 'createlookupitem') {
      return jsonOk_(createLookupItem_(body.payload || {}))
    }

    if (action === 'createlaunch') {
      return jsonOk_(createLaunch_(body.payload || {}))
    }

    return jsonError_('Acao POST nao suportada.')
  } catch (error) {
    return jsonError_(error.message || 'Erro no POST')
  }
}

function fazerLogin_(payload) {
  const usuario = String(payload.username || '').trim()
  const senha = String(payload.password || '')

  if (!usuario || !senha) {
    throw new Error('Login e senha obrigatorios.')
  }

  const aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('usuarios')
  if (!aba) throw new Error('Aba usuarios nao encontrada.')

  const dados = aba.getDataRange().getValues()
  const cab = dados[0]
  const idxUsuario = cab.indexOf('usuario')
  const idxSenha = cab.indexOf('senha')
  const idxNome = cab.indexOf('nome')
  const idxPerfil = cab.indexOf('perfil')
  const idxAtivo = cab.indexOf('ativo')

  for (let i = 1; i < dados.length; i += 1) {
    const row = dados[i]
    const loginOk = String(row[idxUsuario] || '').trim() === usuario
    const senhaOk = String(row[idxSenha] || '') === senha
    const ativo = String(row[idxAtivo] || '').toLowerCase() !== 'false'

    if (loginOk && senhaOk && ativo) {
      const token = Utilities.getUuid()
      const sessao = {
        usuario,
        nome: String(row[idxNome] || usuario),
        perfil: String(row[idxPerfil] || 'operador'),
      }

      // Expira em 12h (43200 segundos)
      CacheService.getScriptCache().put(
        `sessao_${token}`,
        JSON.stringify(sessao),
        43200,
      )

      return {
        token,
        user: {
          usuario,
          nome: String(row[idxNome] || usuario),
          perfil: String(row[idxPerfil] || 'operador'),
        },
      }
    }
  }

  throw new Error('Credenciais invalidas.')
}

function validarSessao_(token) {
  if (!token) throw new Error('Nao autenticado.')
  const raw = CacheService.getScriptCache().get(`sessao_${token}`)
  const sessao = raw ? JSON.parse(raw) : null
  if (!sessao) throw new Error('Sessao invalida.')
}

function jsonOk_(data) {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, data }))
    .setMimeType(ContentService.MimeType.JSON)
}

function jsonError_(message) {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: false, error: message }))
    .setMimeType(ContentService.MimeType.JSON)
}
```

## 3) Reimplante

Depois de salvar o script:

1. `Deploy` -> `Manage deployments`
2. Edite a implantacao Web App
3. `Execute as: Me` e `Who has access: Anyone`
4. Atualize a URL no `.env` (se mudar)
