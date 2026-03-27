# Migracao de Cabecalhos para Portugues (Google Sheets)

Este guia deixa os nomes das colunas 100% em portugues na planilha, sem quebrar o app.

## 1) Cabecalhos alvo (portugues)

- `funcionarios`:
  - `id_funcionario, nome, categoria, cargo, cpf, data_inicio, empresa, ativo, criado_em, atualizado_em`
- `postos`:
  - `id_posto, nome, empresa, ativo, criado_em, atualizado_em`
- `turnos`:
  - `id_turno, nome, familia, entrada, saida, entrada_sabado, saida_sabado, paridade, ativo, criado_em, atualizado_em`
- `lancamentos`:
  - `id_lancamento, id_lote, empresa, id_funcionario, id_posto, id_turno, tipo_lancamento, motivo_eventual, data_eventual, data_inicio, dias_lote, hora_extra, desconto_almoco, nome_arquivo, mime_arquivo, id_arquivo_drive, criado_em`
- `escala_diaria`:
  - `id_escala, id_lote, id_lancamento, data, status, inicio, fim, id_funcionario, id_posto, id_turno, empresa, origem, criado_em`
- `auditoria`:
  - `id_log, acao, payload, sucesso, mensagem, criado_em`

## 2) Script de migracao (copiar e executar no Apps Script)

```javascript
const CABECALHOS_PT = {
  funcionarios: [
    'id_funcionario', 'nome', 'categoria', 'cargo', 'cpf', 'data_inicio',
    'empresa', 'ativo', 'criado_em', 'atualizado_em'
  ],
  postos: [
    'id_posto', 'nome', 'empresa', 'ativo', 'criado_em', 'atualizado_em'
  ],
  turnos: [
    'id_turno', 'nome', 'familia', 'entrada', 'saida',
    'entrada_sabado', 'saida_sabado', 'paridade', 'ativo', 'criado_em', 'atualizado_em'
  ],
  lancamentos: [
    'id_lancamento', 'id_lote', 'empresa', 'id_funcionario', 'id_posto', 'id_turno',
    'tipo_lancamento', 'motivo_eventual', 'data_eventual', 'data_inicio', 'dias_lote',
    'hora_extra', 'desconto_almoco', 'nome_arquivo', 'mime_arquivo',
    'id_arquivo_drive', 'criado_em'
  ],
  escala_diaria: [
    'id_escala', 'id_lote', 'id_lancamento', 'data', 'status', 'inicio', 'fim',
    'id_funcionario', 'id_posto', 'id_turno', 'empresa', 'origem', 'criado_em'
  ],
  auditoria: [
    'id_log', 'acao', 'payload', 'sucesso', 'mensagem', 'criado_em'
  ],
}

function migrarCabecalhosParaPortugues() {
  const ss = SpreadsheetApp.getActiveSpreadsheet()

  Object.entries(CABECALHOS_PT).forEach(([nomeAba, headers]) => {
    const aba = ss.getSheetByName(nomeAba)
    if (!aba) throw new Error(`Aba nao encontrada: ${nomeAba}`)

    const totalColunas = Math.max(aba.getLastColumn(), headers.length)
    if (totalColunas > headers.length) {
      // opcional: limpa somente o resto da linha de cabecalho para evitar lixo visual
      aba.getRange(1, headers.length + 1, 1, totalColunas - headers.length).clearContent()
    }

    aba.getRange(1, 1, 1, headers.length).setValues([headers])
    aba.setFrozenRows(1)
  })
}
```

## 3) Atualizacao da API (obrigatorio)

Depois de migrar os cabecalhos, atualize o `Code.gs` para gravar e ler com os nomes em portugues.

No frontend deste projeto, ja deixamos compatibilidade para ler:

- id em ingles ou portugues (`employeeId` ou `id_funcionario`, etc.)
- campos recentes em ingles ou portugues (`launchType` ou `tipo_lancamento`, etc.)

Assim voce pode migrar sem quebrar o app na transicao.

## 4) Checklist rapido

1. Rode `migrarCabecalhosParaPortugues`.
2. Publique nova versao do Web App.
3. Teste:
   - `?action=ping`
   - `?action=bootstrap`
   - salvar um lancamento pelo app
4. Verifique se os dados entram nas colunas em portugues.
