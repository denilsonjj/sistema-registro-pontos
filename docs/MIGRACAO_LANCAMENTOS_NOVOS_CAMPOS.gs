const CABECALHO_LANCAMENTOS_ATUALIZADO = [
  'id_lancamento',
  'id_lote',
  'empresa',
  'id_funcionario',
  'id_posto',
  'id_turno',
  'tipo_lancamento',
  'motivo_eventual',
  'data_eventual',
  'data_inicio',
  'dias_lote',
  'hora_extra',
  'desconto_almoco',
  'vale',
  'motivo_desconto',
  'nome_arquivo',
  'mime_arquivo',
  'modo_repeticao',
  'dias_semana_customizados',
  'id_arquivo_drive',
  'criado_em',
]

function migrarLancamentosNovosCampos() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('lancamentos')
  if (!sheet) throw new Error('Aba lancamentos nao encontrada.')

  const lastColumn = Math.max(sheet.getLastColumn(), 1)
  const currentHeaders = sheet.getRange(1, 1, 1, lastColumn).getValues()[0]
  const currentHeaderMap = {}

  currentHeaders.forEach(function(header, index) {
    const key = String(header || '').trim()
    if (key) currentHeaderMap[key] = index
  })

  const allData = sheet.getDataRange().getValues()
  const existingRows = allData.length > 1 ? allData.slice(1) : []

  const migratedRows = existingRows.map(function(row) {
    return CABECALHO_LANCAMENTOS_ATUALIZADO.map(function(header) {
      const oldIndex = currentHeaderMap[header]
      if (oldIndex === undefined) return ''
      return row[oldIndex] === undefined ? '' : row[oldIndex]
    })
  })

  sheet.clearContents()
  sheet.getRange(1, 1, 1, CABECALHO_LANCAMENTOS_ATUALIZADO.length).setValues([
    CABECALHO_LANCAMENTOS_ATUALIZADO,
  ])

  if (migratedRows.length) {
    sheet
      .getRange(2, 1, migratedRows.length, CABECALHO_LANCAMENTOS_ATUALIZADO.length)
      .setValues(migratedRows)
  }

  if (sheet.getMaxColumns() < CABECALHO_LANCAMENTOS_ATUALIZADO.length) {
    sheet.insertColumnsAfter(
      sheet.getMaxColumns(),
      CABECALHO_LANCAMENTOS_ATUALIZADO.length - sheet.getMaxColumns(),
    )
  }

  sheet.setFrozenRows(1)
  sheet
    .getRange(1, 1, 1, CABECALHO_LANCAMENTOS_ATUALIZADO.length)
    .setFontWeight('bold')
    .setBackground('#e2e8f0')
    .setHorizontalAlignment('center')

  return {
    ok: true,
    linhas_migradas: migratedRows.length,
    colunas_finais: CABECALHO_LANCAMENTOS_ATUALIZADO.length,
  }
}
