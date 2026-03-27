const TZ = 'America/Sao_Paulo'

const CABECALHOS = {
  funcionarios: [
    'id_funcionario', 'nome', 'categoria', 'cargo', 'cpf', 'data_inicio',
    'empresa', 'ativo', 'criado_em', 'atualizado_em',
  ],
  postos: [
    'id_posto', 'nome', 'empresa', 'ativo', 'criado_em', 'atualizado_em',
  ],
  turnos: [
    'id_turno', 'nome', 'familia', 'entrada', 'saida',
    'entrada_sabado', 'saida_sabado', 'paridade', 'ativo', 'criado_em', 'atualizado_em',
  ],
  lancamentos: [
    'id_lancamento', 'id_lote', 'empresa', 'id_funcionario', 'id_posto', 'id_turno',
    'tipo_lancamento', 'motivo_eventual', 'data_eventual', 'data_inicio', 'dias_lote',
    'hora_extra', 'desconto_almoco', 'nome_arquivo', 'mime_arquivo',
    'id_arquivo_drive', 'criado_em',
  ],
  escala_diaria: [
    'id_escala', 'id_lote', 'id_lancamento', 'data', 'status', 'inicio', 'fim',
    'id_funcionario', 'id_posto', 'id_turno', 'empresa', 'origem', 'criado_em',
  ],
  auditoria: [
    'id_log', 'acao', 'payload', 'sucesso', 'mensagem', 'criado_em',
  ],
  usuarios: [
    'usuario', 'senha', 'nome', 'perfil', 'ativo',
  ],
}

const ALIASES = {
  funcionarios: {
    id_funcionario: ['id_funcionario', 'employeeId'],
    nome: ['nome', 'name'],
    categoria: ['categoria', 'category'],
    cargo: ['cargo', 'role'],
    cpf: ['cpf'],
    data_inicio: ['data_inicio', 'dataInicio', 'startDate'],
    empresa: ['empresa', 'company'],
    ativo: ['ativo'],
    criado_em: ['criado_em', 'createdAt'],
    atualizado_em: ['atualizado_em', 'updatedAt'],
  },
  postos: {
    id_posto: ['id_posto', 'postId'],
    nome: ['nome', 'name'],
    empresa: ['empresa', 'company'],
    ativo: ['ativo'],
    criado_em: ['criado_em', 'createdAt'],
    atualizado_em: ['atualizado_em', 'updatedAt'],
  },
  turnos: {
    id_turno: ['id_turno', 'shiftId'],
    nome: ['nome', 'name'],
    familia: ['familia', 'family'],
    entrada: ['entrada', 'start'],
    saida: ['saida', 'end'],
    entrada_sabado: ['entrada_sabado', 'sabEntrada', 'sabStart'],
    saida_sabado: ['saida_sabado', 'sabSaida', 'sabEnd'],
    paridade: ['paridade', 'parity'],
    ativo: ['ativo'],
    criado_em: ['criado_em', 'createdAt'],
    atualizado_em: ['atualizado_em', 'updatedAt'],
  },
  lancamentos: {
    id_lancamento: ['id_lancamento', 'launchId'],
    id_lote: ['id_lote', 'batchId'],
    empresa: ['empresa', 'company'],
    id_funcionario: ['id_funcionario', 'employeeId'],
    id_posto: ['id_posto', 'postId'],
    id_turno: ['id_turno', 'shiftId'],
    tipo_lancamento: ['tipo_lancamento', 'launchType'],
    motivo_eventual: ['motivo_eventual', 'eventualReason'],
    data_eventual: ['data_eventual', 'eventualDate'],
    data_inicio: ['data_inicio', 'startDate'],
    dias_lote: ['dias_lote', 'batchDays'],
    hora_extra: ['hora_extra', 'extraHours'],
    desconto_almoco: ['desconto_almoco', 'lunchDiscount'],
    nome_arquivo: ['nome_arquivo', 'attachmentFileName'],
    mime_arquivo: ['mime_arquivo', 'attachmentMimeType'],
    id_arquivo_drive: ['id_arquivo_drive', 'attachmentDriveFileId'],
    criado_em: ['criado_em', 'createdAt'],
  },
  escala_diaria: {
    id_escala: ['id_escala', 'scaleId'],
    id_lote: ['id_lote', 'batchId'],
    id_lancamento: ['id_lancamento', 'launchId'],
    data: ['data', 'date'],
    status: ['status'],
    inicio: ['inicio', 'start'],
    fim: ['fim', 'end'],
    id_funcionario: ['id_funcionario', 'employeeId'],
    id_posto: ['id_posto', 'postId'],
    id_turno: ['id_turno', 'shiftId'],
    empresa: ['empresa', 'company'],
    origem: ['origem', 'origin'],
    criado_em: ['criado_em', 'createdAt'],
  },
}

const TURNOS_PADRAO = [
  { id_turno: '12x36_dia_par', nome: '12x36 Dia Par', familia: '12x36', entrada: '07:00', saida: '19:00', entrada_sabado: '', saida_sabado: '', paridade: 'par' },
  { id_turno: '12x36_dia_impar', nome: '12x36 Dia Impar', familia: '12x36', entrada: '07:00', saida: '19:00', entrada_sabado: '', saida_sabado: '', paridade: 'impar' },
  { id_turno: '12x36_noite_par', nome: '12x36 Noite Par', familia: '12x36', entrada: '19:00', saida: '07:00', entrada_sabado: '', saida_sabado: '', paridade: 'par' },
  { id_turno: '12x36_noite_impar', nome: '12x36 Noite Impar', familia: '12x36', entrada: '19:00', saida: '07:00', entrada_sabado: '', saida_sabado: '', paridade: 'impar' },
  { id_turno: '5x2_padrao', nome: '5x2 (Seg-Sex 08:00-17:00)', familia: '5x2', entrada: '08:00', saida: '17:00', entrada_sabado: '', saida_sabado: '', paridade: '' },
  { id_turno: '6x1_10_19_sab_07_13', nome: '6x1 10:00-19:00 (Sab 07:00-13:00)', familia: '6x1', entrada: '10:00', saida: '19:00', entrada_sabado: '07:00', saida_sabado: '13:00', paridade: '' },
  { id_turno: '6x1_06_15_sab_07_13', nome: '6x1 06:00-15:00 (Sab 07:00-13:00)', familia: '6x1', entrada: '06:00', saida: '15:00', entrada_sabado: '07:00', saida_sabado: '13:00', paridade: '' },
  { id_turno: '6x1_07_16_sab_07_13', nome: '6x1 07:00-16:00 (Sab 07:00-13:00)', familia: '6x1', entrada: '07:00', saida: '16:00', entrada_sabado: '07:00', saida_sabado: '13:00', paridade: '' },
  { id_turno: '6x1_08_17_sab_07_13', nome: '6x1 08:00-17:00 (Sab 07:00-13:00)', familia: '6x1', entrada: '08:00', saida: '17:00', entrada_sabado: '07:00', saida_sabado: '13:00', paridade: '' },
  { id_turno: '6x1_06_15_sab_04_13', nome: '6x1 06:00-15:00 (Sab 04:00-13:00)', familia: '6x1', entrada: '06:00', saida: '15:00', entrada_sabado: '04:00', saida_sabado: '13:00', paridade: '' },
  { id_turno: '6x1_07_16_sab_08_14', nome: '6x1 07:00-16:00 (Sab 08:00-14:00)', familia: '6x1', entrada: '07:00', saida: '16:00', entrada_sabado: '08:00', saida_sabado: '14:00', paridade: '' },
  { id_turno: '6x1_08_17_sab_08_14', nome: '6x1 08:00-17:00 (Sab 08:00-14:00)', familia: '6x1', entrada: '08:00', saida: '17:00', entrada_sabado: '08:00', saida_sabado: '14:00', paridade: '' },
  { id_turno: '6x1_10_19_sab_08_14', nome: '6x1 10:00-19:00 (Sab 08:00-14:00)', familia: '6x1', entrada: '10:00', saida: '19:00', entrada_sabado: '08:00', saida_sabado: '14:00', paridade: '' },
]

function doGet(e) {
  const action = String((e && e.parameter && e.parameter.action) || 'ping').toLowerCase()
  const token = String((e && e.parameter && e.parameter.token) || '')

  try {
    if (action !== 'ping') validarSessao_(token)

    if (action === 'ping') return jsonResponse_({ ok: true, message: 'API online' })
    if (action === 'bootstrap') return jsonResponse_({ ok: true, data: getBootstrapData_() })

    if (action === 'recentrecords') {
      const company = String((e && e.parameter && e.parameter.company) || '').trim()
      const limit = Number((e && e.parameter && e.parameter.limit) || 10)
      return jsonResponse_({ ok: true, data: { records: getRecentRecords_(company, limit) } })
    }

    return jsonResponse_({ ok: false, error: 'action invalida' })
  } catch (err) {
    logAudit_('doGet', { action: action }, false, err.message)
    return jsonResponse_({ ok: false, error: err.message })
  }
}

function doPost(e) {
  try {
    const body = parseBody_(e)
    const action = String(body.action || '').toLowerCase()
    const token = String(body.token || '')

    if (action === 'login') {
      return jsonResponse_({ ok: true, data: fazerLogin_(body.payload || {}) })
    }

    validarSessao_(token)

    if (action === 'createlaunch') {
      return jsonResponse_({ ok: true, data: createLaunch_(body.payload || {}) })
    }

    if (action === 'createlookupitem') {
      return jsonResponse_({ ok: true, data: createLookupItem_(body.payload || {}) })
    }

    if (action === 'updatelaunch') {
      return jsonResponse_({ ok: true, data: updateLaunch_(body.payload || {}) })
    }

    return jsonResponse_({ ok: false, error: 'action invalida' })
  } catch (err) {
    logAudit_('doPost', null, false, err.message)
    return jsonResponse_({ ok: false, error: err.message })
  }
}

function setupScaleWorkbook() {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  ss.setSpreadsheetTimeZone(TZ)

  Object.keys(CABECALHOS).forEach(function(sheetName) {
    const headers = CABECALHOS[sheetName]
    const sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName)
    sheet.clear()
    sheet.getRange(1, 1, 1, headers.length).setValues([headers])
    sheet.setFrozenRows(1)
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight('bold')
      .setBackground('#e2e8f0')
      .setHorizontalAlignment('center')
  })

  aplicarValidacoes_()
}

function popularTurnosPadrao() {
  const existentes = toMap_(lerAbaCanonica_('turnos'), 'id_turno')
  const nowIso = new Date().toISOString()

  const novos = TURNOS_PADRAO
    .filter(function(turno) { return !existentes[turno.id_turno] })
    .map(function(turno) {
      return {
        id_turno: turno.id_turno,
        nome: turno.nome,
        familia: turno.familia,
        entrada: turno.entrada,
        saida: turno.saida,
        entrada_sabado: turno.entrada_sabado,
        saida_sabado: turno.saida_sabado,
        paridade: turno.paridade,
        ativo: 'TRUE',
        criado_em: nowIso,
        atualizado_em: nowIso,
      }
    })

  appendObjetosCanonicos_('turnos', novos)
  return { inseridos: novos.length }
}

function criarUsuarioInicial() {
  const sheet = getSheetOrThrow_('usuarios')
  const values = sheet.getDataRange().getValues()
  if (values.length > 1) return { created: false, reason: 'ja_existe_usuario' }

  sheet.getRange(2, 1, 1, 5).setValues([[
    'admin',
    '123456',
    'Administrador',
    'admin',
    'TRUE',
  ]])

  return { created: true, usuario: 'admin' }
}

function getBootstrapData_() {
  return {
    funcionarios: lerAbaCanonica_('funcionarios').filter(function(r) { return isAtivo_(r.ativo) }),
    postos: lerAbaCanonica_('postos').filter(function(r) { return isAtivo_(r.ativo) }),
    turnos: lerAbaCanonica_('turnos').filter(function(r) { return isAtivo_(r.ativo) }),
  }
}

function createLookupItem_(payload) {
  const type = String(payload.type || '').toLowerCase()
  const data = payload.data || {}
  const nowIso = new Date().toISOString()

  if (type === 'employee') {
    const id = nextUniqueId_('funcionarios', 'id_funcionario', toId_(data.name || 'funcionario'))
    const categoria = String(data.category || 'vigilante')

    const row = {
      id_funcionario: id,
      nome: String(data.name || ''),
      categoria: categoria,
      cargo: String(data.role || (categoria === 'limpeza' ? 'Limpeza' : 'Vigilante')),
      cpf: String(data.cpf || ''),
      data_inicio: String(data.startDate || ''),
      empresa: String(data.company || ''),
      ativo: 'TRUE',
      criado_em: nowIso,
      atualizado_em: nowIso,
    }

    appendObjetoCanonico_('funcionarios', row)
    logAudit_('createLookupItem.employee', row, true, id)
    return { item: row }
  }

  if (type === 'post') {
    const id = nextUniqueId_('postos', 'id_posto', toId_(data.name || 'posto'))

    const row = {
      id_posto: id,
      nome: String(data.name || ''),
      empresa: String(data.company || ''),
      ativo: 'TRUE',
      criado_em: nowIso,
      atualizado_em: nowIso,
    }

    appendObjetoCanonico_('postos', row)
    logAudit_('createLookupItem.post', row, true, id)
    return { item: row }
  }

  if (type === 'shift') {
    const id = nextUniqueId_('turnos', 'id_turno', toId_(data.name || 'turno'))

    const row = {
      id_turno: id,
      nome: String(data.name || ''),
      familia: String(data.family || ''),
      entrada: String(data.start || ''),
      saida: String(data.end || ''),
      entrada_sabado: String(data.sabStart || ''),
      saida_sabado: String(data.sabEnd || ''),
      paridade: String(data.parity || ''),
      ativo: 'TRUE',
      criado_em: nowIso,
      atualizado_em: nowIso,
    }

    appendObjetoCanonico_('turnos', row)
    logAudit_('createLookupItem.shift', row, true, id)
    return { item: row }
  }

  throw new Error('Tipo de lookup invalido.')
}

function createLaunch_(payload) {
  const nowIso = new Date().toISOString()
  const launchId = Utilities.getUuid()
  const batchId = String(payload.launchType || '') === 'fixo' ? Utilities.getUuid() : ''

  let driveFileId = ''
  if (payload.attachment && payload.attachment.base64) {
    driveFileId = saveAttachmentToDrive_(
      payload.attachment,
      payload.employeeId || 'sem-funcionario',
      payload.company || '',
      payload.eventualDate || payload.startDate || '',
    )
  }

  appendObjetoCanonico_('lancamentos', {
    id_lancamento: launchId,
    id_lote: batchId,
    empresa: String(payload.company || ''),
    id_funcionario: String(payload.employeeId || ''),
    id_posto: String(payload.postId || ''),
    id_turno: String(payload.shiftId || ''),
    tipo_lancamento: String(payload.launchType || ''),
    motivo_eventual: String(payload.eventualReason || ''),
    data_eventual: String(payload.eventualDate || ''),
    data_inicio: String(payload.startDate || ''),
    dias_lote: payload.batchDays ? Number(payload.batchDays) : '',
    hora_extra: Number(payload.extraHours || 0),
    desconto_almoco: Number(payload.lunchDiscount || 0),
    nome_arquivo: payload.attachment ? String(payload.attachment.name || '') : '',
    mime_arquivo: payload.attachment ? String(payload.attachment.mimeType || '') : '',
    id_arquivo_drive: driveFileId,
    criado_em: nowIso,
  })

  let dailyRows = []

  if (String(payload.launchType || '') === 'fixo') {
    const entries = Array.isArray(payload.scheduleEntries) ? payload.scheduleEntries : []
    dailyRows = entries.map(function(entry) {
      return {
        id_escala: Utilities.getUuid(),
        id_lote: batchId,
        id_lancamento: launchId,
        data: String(entry.date || ''),
        status: String(entry.status || 'TRABALHO'),
        inicio: String(entry.start || ''),
        fim: String(entry.end || ''),
        id_funcionario: String(payload.employeeId || ''),
        id_posto: String(payload.postId || ''),
        id_turno: String(payload.shiftId || ''),
        empresa: String(payload.company || ''),
        origem: 'fixo',
        criado_em: nowIso,
      }
    })
  } else {
    const reason = String(payload.eventualReason || '')
    const isFalta = reason.indexOf('falta') === 0

    dailyRows = [{
      id_escala: Utilities.getUuid(),
      id_lote: '',
      id_lancamento: launchId,
      data: String(payload.eventualDate || nowIso.slice(0, 10)),
      status: isFalta ? 'FALTA' : 'TRABALHO',
      inicio: '',
      fim: '',
      id_funcionario: String(payload.employeeId || ''),
      id_posto: String(payload.postId || ''),
      id_turno: String(payload.shiftId || ''),
      empresa: String(payload.company || ''),
      origem: 'eventual',
      criado_em: nowIso,
    }]
  }

  appendObjetosCanonicos_('escala_diaria', dailyRows)
  logAudit_('createLaunch', payload, true, launchId)

  return { launchId: launchId, batchId: batchId, rowsInserted: dailyRows.length }
}

function updateLaunch_(payload) {
  const launchId = String(payload.launchId || '').trim()
  const data = payload.data || {}

  if (!launchId) throw new Error('launchId obrigatorio.')

  updateRowByField_('lancamentos', ['id_lancamento', 'launchId'], launchId, {
    hora_extra: data.hora_extra !== undefined ? data.hora_extra : data.extraHours,
    desconto_almoco: data.desconto_almoco !== undefined ? data.desconto_almoco : data.lunchDiscount,
    motivo_eventual: data.motivo_eventual !== undefined ? data.motivo_eventual : data.eventualReason,
    data_eventual: data.data_eventual !== undefined ? data.data_eventual : data.eventualDate,
  })

  logAudit_('updateLaunch', payload, true, launchId)
  return { launchId: launchId, updated: true }
}

function getRecentRecords_(company, limit) {
  const launches = lerAbaCanonica_('lancamentos')
  const daily = lerAbaCanonica_('escala_diaria')
  const funcionarios = lerAbaCanonica_('funcionarios')
  const postos = lerAbaCanonica_('postos')
  const turnos = lerAbaCanonica_('turnos')

  const empById = toMap_(funcionarios, 'id_funcionario')
  const postById = toMap_(postos, 'id_posto')
  const shiftById = toMap_(turnos, 'id_turno')

  const countByLaunch = {}
  daily.forEach(function(d) {
    const id = String(d.id_lancamento || '')
    if (!id) return
    countByLaunch[id] = (countByLaunch[id] || 0) + 1
  })

  return launches
    .filter(function(l) {
      return !company || String(l.empresa || '') === company
    })
    .sort(function(a, b) {
      return new Date(b.criado_em || 0).getTime() - new Date(a.criado_em || 0).getTime()
    })
    .slice(0, Math.max(1, Number(limit || 10)))
    .map(function(l) {
      const emp = empById[String(l.id_funcionario || '')] || {}
      const post = postById[String(l.id_posto || '')] || {}
      const shift = shiftById[String(l.id_turno || '')] || {}

      return {
        id_lancamento: String(l.id_lancamento || ''),
        criado_em: String(l.criado_em || ''),
        empresa: String(l.empresa || ''),
        nome_funcionario: String(emp.nome || l.id_funcionario || 'Nao informado'),
        categoria_funcionario: String(emp.categoria || 'Nao informado'),
        nome_posto: String(post.nome || l.id_posto || 'Nao informado'),
        nome_turno: String(shift.nome || l.id_turno || 'Nao informado'),
        tipo_lancamento: String(l.tipo_lancamento || ''),
        tipo_lancamento_label: String(l.tipo_lancamento || '') === 'fixo' ? 'Turno Fixo' : 'Turno Eventual',
        motivo_eventual: String(l.motivo_eventual || ''),
        motivo_eventual_label: labelEventualReason_(String(l.motivo_eventual || '')),
        data_eventual: String(l.data_eventual || ''),
        registros_gerados: Number(countByLaunch[String(l.id_lancamento || '')] || 0),
        dias_lote: l.dias_lote ? Number(l.dias_lote) : null,
        hora_extra: Number(l.hora_extra || 0),
        desconto_almoco: Number(l.desconto_almoco || 0),
      }
    })
}

function fazerLogin_(payload) {
  const usuario = String(payload.username || '').trim()
  const senha = String(payload.password || '')

  if (!usuario || !senha) throw new Error('Login e senha obrigatorios.')

  const sheet = getSheetOrThrow_('usuarios')
  const values = sheet.getDataRange().getValues()
  if (values.length < 2) throw new Error('Sem usuarios cadastrados.')

  const headers = values[0]
  const idxUsuario = findHeaderIndex_(headers, ['usuario'])
  const idxSenha = findHeaderIndex_(headers, ['senha'])
  const idxNome = findHeaderIndex_(headers, ['nome'])
  const idxPerfil = findHeaderIndex_(headers, ['perfil'])
  const idxAtivo = findHeaderIndex_(headers, ['ativo'])

  for (let i = 1; i < values.length; i += 1) {
    const row = values[i]
    const loginOk = String(row[idxUsuario] || '').trim() === usuario
    const senhaOk = String(row[idxSenha] || '') === senha
    const ativo = idxAtivo < 0 || isAtivo_(row[idxAtivo])

    if (loginOk && senhaOk && ativo) {
      const token = Utilities.getUuid()
      const sessao = {
        usuario: usuario,
        nome: String(idxNome >= 0 ? row[idxNome] : usuario),
        perfil: String(idxPerfil >= 0 ? row[idxPerfil] : 'operador'),
      }

      CacheService.getScriptCache().put('sessao_' + token, JSON.stringify(sessao), 43200)

      return {
        token: token,
        user: sessao,
      }
    }
  }

  throw new Error('Credenciais invalidas.')
}

function validarSessao_(token) {
  if (!token) throw new Error('Nao autenticado.')
  const raw = CacheService.getScriptCache().get('sessao_' + token)
  if (!raw) throw new Error('Sessao invalida.')
  return JSON.parse(raw)
}

function aplicarValidacoes_() {
  setValidation_('funcionarios', 'categoria', ['vigilante', 'limpeza'])
  setValidation_('funcionarios', 'empresa', ['l4_servicos', 'l4_pro_service'])
  setValidation_('funcionarios', 'ativo', ['TRUE', 'FALSE'])

  setValidation_('postos', 'empresa', ['l4_servicos', 'l4_pro_service'])
  setValidation_('postos', 'ativo', ['TRUE', 'FALSE'])

  setValidation_('turnos', 'familia', ['12x36', '5x2', '6x1'])
  setValidation_('turnos', 'paridade', ['par', 'impar', ''])
  setValidation_('turnos', 'ativo', ['TRUE', 'FALSE'])

  setValidation_('lancamentos', 'tipo_lancamento', ['fixo', 'eventual'])
  setValidation_('escala_diaria', 'status', ['TRABALHO', 'FOLGA', 'FALTA'])
  setValidation_('escala_diaria', 'origem', ['fixo', 'eventual'])
  setValidation_('usuarios', 'ativo', ['TRUE', 'FALSE'])
}

function setValidation_(sheetName, canonicalField, values) {
  const sheet = getSheetOrThrow_(sheetName)
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
  const aliases = (ALIASES[sheetName] && ALIASES[sheetName][canonicalField]) || [canonicalField]
  const colIndex = findHeaderIndex_(headers, aliases)
  if (colIndex < 0) return

  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(values, true)
    .setAllowInvalid(false)
    .build()

  const rows = Math.max(1, sheet.getMaxRows() - 1)
  sheet.getRange(2, colIndex + 1, rows, 1).setDataValidation(rule)
}

function lerAbaCanonica_(sheetName) {
  const sheet = getSheetOrThrow_(sheetName)
  const values = sheet.getDataRange().getValues()
  if (values.length < 2) return []

  const headers = values[0]
  const indexMap = buildReadIndexMap_(sheetName, headers)
  const canonHeaders = CABECALHOS[sheetName] || []

  return values.slice(1).map(function(row) {
    const obj = {}
    canonHeaders.forEach(function(field) {
      const idx = indexMap[field]
      obj[field] = idx >= 0 ? row[idx] : ''
    })
    return obj
  })
}

function appendObjetoCanonico_(sheetName, obj) {
  appendObjetosCanonicos_(sheetName, [obj])
}

function appendObjetosCanonicos_(sheetName, objects) {
  if (!objects || !objects.length) return

  const sheet = getSheetOrThrow_(sheetName)
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
  const canonicalByHeader = buildCanonicalByHeader_(sheetName, headers)

  const rows = objects.map(function(obj) {
    return headers.map(function(_, i) {
      const canonical = canonicalByHeader[i]
      const value = canonical ? obj[canonical] : ''
      return value === undefined || value === null ? '' : value
    })
  })

  sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, headers.length).setValues(rows)
}

function updateRowByField_(sheetName, fieldAliases, idValue, patch) {
  const sheet = getSheetOrThrow_(sheetName)
  const values = sheet.getDataRange().getValues()
  if (values.length < 2) throw new Error('Nenhum registro para atualizar.')

  const headers = values[0]
  const idCol = findHeaderIndex_(headers, fieldAliases)
  if (idCol < 0) throw new Error('Campo ID nao encontrado.')

  let rowIndex = -1
  for (let i = 1; i < values.length; i += 1) {
    if (String(values[i][idCol] || '').trim() === idValue) {
      rowIndex = i + 1
      break
    }
  }

  if (rowIndex < 0) throw new Error('Registro nao encontrado: ' + idValue)

  Object.keys(patch).forEach(function(key) {
    if (patch[key] === undefined) return
    const col = findHeaderIndex_(headers, [key])
    if (col < 0) return
    sheet.getRange(rowIndex, col + 1).setValue(patch[key])
  })

  return true
}

function nextUniqueId_(sheetName, idField, baseId) {
  const rows = lerAbaCanonica_(sheetName)
  const ids = new Set(rows.map(function(r) {
    return String(r[idField] || '').trim()
  }).filter(Boolean))

  if (!ids.has(baseId)) return baseId

  let n = 2
  let candidate = baseId + '-' + n
  while (ids.has(candidate)) {
    n += 1
    candidate = baseId + '-' + n
  }
  return candidate
}

function saveAttachmentToDrive_(attachment, employeeId, company, referenceDate) {
  const raw = String(attachment.base64 || '')
  const base64 = raw.indexOf(',') > -1 ? raw.split(',').pop() : raw

  const bytes = Utilities.base64Decode(base64)
  const mimeType = String(attachment.mimeType || 'application/octet-stream')
  const originalName = String(attachment.name || 'atestado')
  const extension = getFileExtension_(originalName, mimeType)

  const companyLabel = normalizeFolderName_(company || 'sem_empresa')
  const employeeLabel = normalizeFileName_(employeeId || 'sem_funcionario')
  const dateLabel = normalizeDateLabel_(referenceDate || new Date())
  const fileName = 'atestado_' + employeeLabel + '_' + dateLabel + extension

  const blob = Utilities.newBlob(bytes, mimeType, fileName)

  const rootFolder = getOrCreateRootFolder_()
  const companyFolder = getOrCreateSubfolder_(rootFolder, companyLabel)
  const file = companyFolder.createFile(blob)

  return file.getId()
}

function getOrCreateRootFolder_() {
  const props = PropertiesService.getScriptProperties()
  const existingId = props.getProperty('DRIVE_ATESTADOS_FOLDER_ID')

  if (existingId) {
    try {
      return DriveApp.getFolderById(existingId)
    } catch (e) {}
  }

  const folder = DriveApp.createFolder('atestados')
  props.setProperty('DRIVE_ATESTADOS_FOLDER_ID', folder.getId())
  return folder
}

function getOrCreateSubfolder_(parentFolder, folderName) {
  const folders = parentFolder.getFoldersByName(folderName)
  if (folders.hasNext()) return folders.next()
  return parentFolder.createFolder(folderName)
}

function normalizeFolderName_(value) {
  const text = String(value || '').trim().toLowerCase()

  if (text === 'l4_servicos') return 'L4 Servicos'
  if (text === 'l4_pro_service') return 'L4 Pro Service'

  return text || 'Sem Empresa'
}

function normalizeFileName_(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase()
}

function normalizeDateLabel_(value) {
  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Utilities.formatDate(value, TZ, 'yyyy-MM-dd')
  }

  const text = String(value || '').trim()
  if (!text) {
    return Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd')
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text
  }

  const parsed = new Date(text)
  if (isNaN(parsed.getTime())) {
    return Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd')
  }

  return Utilities.formatDate(parsed, TZ, 'yyyy-MM-dd')
}

function getFileExtension_(fileName, mimeType) {
  const match = String(fileName || '').match(/(\.[a-zA-Z0-9]+)$/)
  if (match) return match[1].toLowerCase()

  const mimeMap = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'application/pdf': '.pdf',
  }

  return mimeMap[String(mimeType || '').toLowerCase()] || ''
}

function parseBody_(e) {
  if (!e || !e.postData || !e.postData.contents) return {}
  return JSON.parse(e.postData.contents)
}

function getSheetOrThrow_(sheetName) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName)
  if (!sheet) throw new Error('Aba nao encontrada: ' + sheetName)
  return sheet
}

function buildReadIndexMap_(sheetName, headers) {
  const aliasesByField = ALIASES[sheetName] || {}
  const fields = CABECALHOS[sheetName] || []
  const map = {}

  fields.forEach(function(field) {
    map[field] = findHeaderIndex_(headers, aliasesByField[field] || [field])
  })

  return map
}

function buildCanonicalByHeader_(sheetName, headers) {
  const aliasesByField = ALIASES[sheetName] || {}
  const lookup = {}

  Object.keys(aliasesByField).forEach(function(field) {
    aliasesByField[field].forEach(function(alias) {
      lookup[String(alias).toLowerCase()] = field
    })
  })

  return headers.map(function(h) {
    return lookup[String(h).toLowerCase()] || ''
  })
}

function findHeaderIndex_(headers, aliases) {
  const map = {}
  headers.forEach(function(h, i) {
    map[String(h).toLowerCase()] = i
  })

  for (let i = 0; i < aliases.length; i += 1) {
    const idx = map[String(aliases[i]).toLowerCase()]
    if (idx !== undefined) return idx
  }

  return -1
}

function isAtivo_(value) {
  const raw = String(value || '').toLowerCase().trim()
  return raw === 'true' || raw === '1' || raw === 'sim'
}

function labelEventualReason_(reason) {
  const map = {
    hora_extra: 'Hora Extra',
    falta_sem_atestado: 'Falta sem atestado',
    falta_com_atestado: 'Falta com atestado',
    cobertura_avulsa: 'Cobertura avulsa',
    contratado_eventual: 'Contratado eventual',
  }
  return map[reason] || ''
}

function toId_(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function toMap_(rows, key) {
  const map = {}
  rows.forEach(function(r) {
    const k = String(r[key] || '')
    if (k) map[k] = r
  })
  return map
}

function logAudit_(action, payload, success, message) {
  try {
    appendObjetoCanonico_('auditoria', {
      id_log: Utilities.getUuid(),
      acao: String(action || ''),
      payload: payload ? JSON.stringify(payload) : '',
      sucesso: success ? 'TRUE' : 'FALSE',
      mensagem: String(message || ''),
      criado_em: new Date().toISOString(),
    })
  } catch (e) {}
}

function jsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON)
}
