# Edicao de Registros na Planilha

Para a nova tela `Registros` salvar alteracoes, sua API precisa aceitar a acao `updatelaunch`.

## 1) Acrescente no `doPost`

```javascript
if (action === 'updatelaunch') {
  const result = updateLaunch_(body.payload || {})
  return jsonResponse_({ ok: true, data: result })
}
```

## 2) Adicione estas funcoes no `api.gs`

```javascript
function updateLaunch_(payload) {
  const launchId = String(payload.launchId || '').trim()
  const data = payload.data || {}

  if (!launchId) throw new Error('launchId obrigatorio.')

  const updatedLaunch = updateRowByField_('lancamentos', ['id_lancamento', 'launchId'], launchId, {
    hora_extra: data.hora_extra,
    desconto_almoco: data.desconto_almoco,
    motivo_eventual: data.motivo_eventual,
    data_eventual: data.data_eventual,
    extraHours: data.extraHours,
    lunchDiscount: data.lunchDiscount,
    eventualReason: data.eventualReason,
    eventualDate: data.eventualDate,
  })

  return { launchId: launchId, updated: updatedLaunch }
}

function updateRowByField_(sheetName, fieldAliases, idValue, patch) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName)
  if (!sheet) throw new Error('Aba nao encontrada: ' + sheetName)

  const values = sheet.getDataRange().getValues()
  if (values.length < 2) throw new Error('Nenhum registro para atualizar.')

  const headers = values[0]
  const idCol = findHeaderIndex_(headers, fieldAliases)
  if (idCol < 0) throw new Error('Campo ID nao encontrado em ' + sheetName)

  let rowIndex = -1
  for (let i = 1; i < values.length; i += 1) {
    if (String(values[i][idCol] || '').trim() === idValue) {
      rowIndex = i + 1
      break
    }
  }

  if (rowIndex < 0) throw new Error('Registro nao encontrado: ' + idValue)

  Object.keys(patch).forEach((key) => {
    const value = patch[key]
    if (value === undefined) return

    const col = findHeaderIndex_(headers, [key])
    if (col < 0) return
    sheet.getRange(rowIndex, col + 1).setValue(value)
  })

  return true
}

function findHeaderIndex_(headers, aliases) {
  const map = {}
  headers.forEach((h, i) => {
    map[String(h).toLowerCase()] = i
  })

  for (let i = 0; i < aliases.length; i += 1) {
    const key = String(aliases[i]).toLowerCase()
    if (map[key] !== undefined) return map[key]
  }

  return -1
}
```

## 3) Reimplante o Web App

Depois de salvar:

1. `Deploy` -> `Manage deployments`
2. Editar implantacao
3. `Deploy`
