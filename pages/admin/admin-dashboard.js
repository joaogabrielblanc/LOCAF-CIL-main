// admin-dashboard.js — Lógica completa do painel admin

// ── Guard ─────────────────────────────────────────────
const sess = AdminAPI.getSession();
if (!sess || sess.tipo !== 'admin') { location.href = 'login.html'; throw new Error('redirect'); }
document.getElementById('sUser').textContent = sess.nome + ' · admin';

// ── Dados e Estado de Paginação ───────────────────────
let _clientes  = [];
let _afiliados = [];
let _cacambas  = [];
let _pedidos   = [];
let _pagePedidos = 1;
let _limitPedidos = 10;
let _statusPedidos = '';
let _ordemPedidos  = 'asc';
let _totalPaginasPedidos = 1;
let _totalPedidos = 0;

// ── Checagem de Conexão da API ──────────────────────────
async function atualizarStatusApi() {
  const pill = document.getElementById('apiStatusPill');
  const txt = document.getElementById('apiStatusText');
  if (!pill || !txt) return;

  try {
    const st = await AdminAPI.checkStatus();
    if (st.online && st.bancoConectado) {
      pill.className = 'api-status-pill online';
      txt.textContent = 'PostgreSQL: Online';
    } else if (st.online) {
      pill.className = 'api-status-pill warn';
      txt.textContent = 'API Online (Sem DB)';
    } else {
      pill.className = 'api-status-pill offline';
      txt.textContent = 'Modo LocalStorage';
    }
  } catch {
    pill.className = 'api-status-pill offline';
    txt.textContent = 'Modo LocalStorage';
  }
}

// ── Toast ─────────────────────────────────────────────
function toast(msg, err = false) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.style.background = err ? '#c0392b' : '#1a2e1d';
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2600);
}

// ── Navegação ─────────────────────────────────────────
function nav(btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  const id = btn.dataset.page;
  const targetPage = document.getElementById('page-' + id);
  if (targetPage) targetPage.classList.add('active');
  btn.classList.add('active');
  if (id === 'overview')  carregarOverview();
  if (id === 'clientes')  carregarClientes();
  if (id === 'afiliados') carregarAfiliados();
  if (id === 'cacambas')  carregarCacambas();
  if (id === 'pedidos')   carregarPedidos();
  if (id === 'banco')     carregarDb('clientes');
}

// ── Helper de Formatação de Data ─────────────────────
function formatData(dataStr) {
  if (!dataStr) return '—';
  try {
    const d = new Date(dataStr);
    if (isNaN(d.getTime())) return dataStr;
    return d.toLocaleDateString('pt-BR');
  } catch {
    return dataStr;
  }
}

// ── VISÃO GERAL ───────────────────────────────────────
async function carregarOverview() {
  const [sr, cr, ar] = await Promise.all([
    AdminAPI.stats(), AdminAPI.getClientes(), AdminAPI.getAfiliados()
  ]);

  if (sr && sr.sucesso && sr.stats) {
    const s = sr.stats;
    document.getElementById('statsRow').innerHTML = `
      <div class="stat-card" style="cursor:pointer;" onclick="document.querySelector('[data-page=clientes]').click()"><div class="stat-ic ic-b"><i class="fas fa-users"></i></div><div><div class="stat-lbl">Clientes</div><div class="stat-val">${s.clientes || 0}</div></div></div>
      <div class="stat-card" style="cursor:pointer;" onclick="document.querySelector('[data-page=afiliados]').click()"><div class="stat-ic ic-g"><i class="fas fa-building"></i></div><div><div class="stat-lbl">Empresas</div><div class="stat-val">${s.afiliados || 0}</div></div></div>
      <div class="stat-card" style="cursor:pointer;" onclick="document.querySelector('[data-page=cacambas]').click()"><div class="stat-ic ic-o"><i class="fas fa-dumpster"></i></div><div><div class="stat-lbl">Caçambas</div><div class="stat-val">${s.cacambas || 0}</div></div></div>
      <div class="stat-card" style="cursor:pointer;" onclick="document.querySelector('[data-page=pedidos]').click()"><div class="stat-ic ic-p"><i class="fas fa-clipboard-list"></i></div><div><div class="stat-lbl">Pedidos</div><div class="stat-val">${s.pedidos || 0}</div></div></div>
      <div class="stat-card"><div class="stat-ic ic-r"><i class="fas fa-dollar-sign"></i></div><div><div class="stat-lbl">Receita Total</div><div class="stat-val">R$ ${(s.receita||0).toLocaleString('pt-BR')}</div></div></div>
    `;
  }

  if (cr && cr.sucesso) {
    const lista = [...(cr.clientes || [])].reverse().slice(0, 5);
    document.getElementById('ultClientes').innerHTML = lista.length
      ? lista.map(c => `<div class="mini-item">
          <div class="mini-av">${((c.nome || 'C')[0] || 'C').toUpperCase()}</div>
          <div class="mini-info"><div class="n">${c.nome || '—'}</div><div class="s">${c.email || '—'}</div></div>
          <div class="mini-date">${formatData(c.criado_em)}</div>
        </div>`).join('')
      : '<p style="color:#bbb;font-size:13px;padding:10px 0;">Nenhum cliente.</p>';
  }

  if (ar && ar.sucesso) {
    const lista = [...(ar.afiliados || [])].reverse().slice(0, 5);
    document.getElementById('ultAfiliados').innerHTML = lista.length
      ? lista.map(a => `<div class="mini-item">
          <div class="mini-av"><i class="fas fa-building" style="font-size:13px;"></i></div>
          <div class="mini-info"><div class="n">${a.empresa || '—'}</div><div class="s">${a.cidade||''}${a.estado?' - '+a.estado:''}</div></div>
          <div class="mini-date">${formatData(a.criado_em)}</div>
        </div>`).join('')
      : '<p style="color:#bbb;font-size:13px;padding:10px 0;">Nenhuma empresa.</p>';
  }
}

// ── CLIENTES ─────────────────────────────────────────
async function carregarClientes() {
  const r = await AdminAPI.getClientes();
  if (!r.sucesso) { toast(r.erro || 'Erro ao carregar clientes', true); return; }
  _clientes = r.clientes || [];
  document.getElementById('countClientes').textContent = r.total || _clientes.length;
  renderClientes(_clientes);
}

function renderClientes(lista) {
  document.getElementById('tbClientes').innerHTML = (lista && lista.length)
    ? lista.map(c => `<tr>
        <td><strong>${c.nome || '—'}</strong></td>
        <td>${c.email || '—'}</td>
        <td>${c.telefone || '—'}</td>
        <td>${c.cep || '—'}</td>
        <td><span class="badge ativo">${c.pedidos||0}</span></td>
        <td>${formatData(c.criado_em)}</td>
        <td><span class="badge ${c.ativo!==false?'ativo':'inativo'}">${c.ativo!==false?'Ativo':'Inativo'}</span></td>
        <td><div class="actions">
          <button class="btn-ed" onclick="abrirEdicao('cliente','${c.id}')"><i class="fas fa-edit"></i> Editar</button>
          <button class="btn-del" onclick="confirmarDel('cliente','${c.id}','${(c.nome || 'Cliente').replace(/'/g, "\\'")}')"><i class="fas fa-trash"></i></button>
        </div></td>
      </tr>`).join('')
    : '<tr><td colspan="8" style="text-align:center;color:#bbb;padding:28px;">Nenhum cliente encontrado.</td></tr>';
}

function filtrarClientes() {
  const q = document.getElementById('searchClientes').value.toLowerCase();
  renderClientes(_clientes.filter(c =>
    (c.nome || '').toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q)
  ));
}

// ── AFILIADOS ────────────────────────────────────────
async function carregarAfiliados() {
  const r = await AdminAPI.getAfiliados();
  if (!r.sucesso) { toast(r.erro || 'Erro ao carregar empresas', true); return; }
  _afiliados = r.afiliados || [];
  document.getElementById('countAfiliados').textContent = r.total || _afiliados.length;
  renderAfiliados(_afiliados);
}

function renderAfiliados(lista) {
  document.getElementById('tbAfiliados').innerHTML = (lista && lista.length)
    ? lista.map(a => `<tr>
        <td><strong>${a.empresa || '—'}</strong></td>
        <td style="font-size:12px;">${a.cnpj || '—'}</td>
        <td>${a.email || '—'}</td>
        <td>${a.cidade||''}${a.estado?' - '+a.estado:''}</td>
        <td>${a.cacambas||0}</td>
        <td>${a.pedidos||0}</td>
        <td>${formatData(a.criado_em)}</td>
        <td><span class="badge ${a.ativo!==false?'ativo':'inativo'}">${a.ativo!==false?'Ativo':'Inativo'}</span></td>
        <td><div class="actions">
          <button class="btn-ed" onclick="abrirEdicao('afiliado','${a.id}')"><i class="fas fa-edit"></i> Editar</button>
          <button class="btn-del" onclick="confirmarDel('afiliado','${a.id}','${(a.empresa || 'Empresa').replace(/'/g, "\\'")}')"><i class="fas fa-trash"></i></button>
        </div></td>
      </tr>`).join('')
    : '<tr><td colspan="9" style="text-align:center;color:#bbb;padding:28px;">Nenhuma empresa encontrada.</td></tr>';
}

function filtrarAfiliados() {
  const q = document.getElementById('searchAfiliados').value.toLowerCase();
  renderAfiliados(_afiliados.filter(a =>
    (a.empresa || '').toLowerCase().includes(q) || (a.email || '').toLowerCase().includes(q)
  ));
}

// ── CAÇAMBAS (PostgreSQL Neon) ───────────────────────
async function carregarCacambas() {
  const r = await AdminAPI.getCacambas();
  if (!r.sucesso) { toast(r.erro || 'Erro ao carregar caçambas', true); return; }
  _cacambas = r.cacambas || [];
  const elCount = document.getElementById('countCacambas');
  if (elCount) elCount.textContent = r.total || _cacambas.length;
  renderCacambas(_cacambas);
}

function renderCacambas(lista) {
  const elTb = document.getElementById('tbCacambas');
  if (!elTb) return;
  elTb.innerHTML = (lista && lista.length)
    ? lista.map(c => `<tr>
        <td><strong>${c.nome || 'Caçamba'}</strong></td>
        <td><span class="badge" style="background:#e8f4fd;color:#0366d6;font-weight:700;">${c.tipo || 'obra'}</span></td>
        <td>${c.capacidade || '—'}</td>
        <td>${c.dimensoes || '—'}</td>
        <td>${c.peso_max || '—'}</td>
        <td><strong>R$ ${(c.preco || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></td>
        <td>${c.empresa || 'Empresa Parceira'}</td>
        <td>${c.cidade || '—'}</td>
        <td><span class="badge ${c.disponivel !== false ? 'ativo' : 'inativo'}">${c.disponivel !== false ? 'Disponível' : 'Indisponível'}</span></td>
      </tr>`).join('')
    : '<tr><td colspan="9" style="text-align:center;color:#bbb;padding:28px;">Nenhuma caçamba encontrada.</td></tr>';
}

function filtrarCacambas() {
  const q = (document.getElementById('searchCacambas')?.value || '').toLowerCase();
  renderCacambas(_cacambas.filter(c =>
    (c.nome || '').toLowerCase().includes(q) ||
    (c.tipo || '').toLowerCase().includes(q) ||
    (c.empresa || '').toLowerCase().includes(q) ||
    (c.cidade || '').toLowerCase().includes(q)
  ));
}

// ── PEDIDOS (Consulta Complexa + Paginação via API) ──
async function carregarPedidos(page = _pagePedidos, limit = _limitPedidos, status = _statusPedidos, ordem = _ordemPedidos) {
  _pagePedidos = page;
  _limitPedidos = limit;
  _statusPedidos = status;
  _ordemPedidos = ordem;

  const r = await AdminAPI.getPedidos(_pagePedidos, _limitPedidos, _statusPedidos, _ordemPedidos);
  if (!r.sucesso) { toast(r.erro || 'Erro ao carregar pedidos', true); return; }

  _pedidos = r.pedidos || [];
  _totalPedidos = r.total || 0;
  _totalPaginasPedidos = r.totalPaginas || 1;

  document.getElementById('countPedidos').textContent = _totalPedidos;
  document.getElementById('lblPagAtual').textContent = _pagePedidos;
  document.getElementById('lblPagTotal').textContent = _totalPaginasPedidos;
  document.getElementById('lblTotalRegistros').textContent = _totalPedidos;

  // Atualizar ícone de ordenação no cabeçalho da tabela
  const ic = document.getElementById('icOrdemPedidos');
  if (ic) {
    ic.className = (_ordemPedidos === 'asc') ? 'fas fa-sort-numeric-down' : 'fas fa-sort-numeric-up-alt';
  }

  // Botões de anterior / próxima
  const btnAnt = document.getElementById('btnPagAnt');
  const btnProx = document.getElementById('btnPagProx');
  if (btnAnt) btnAnt.disabled = (_pagePedidos <= 1);
  if (btnProx) btnProx.disabled = (_pagePedidos >= _totalPaginasPedidos);

  renderPaginacaoNumeros();
  renderPedidos(_pedidos);
}

function alternarOrdemPedidos() {
  _ordemPedidos = (_ordemPedidos === 'asc') ? 'desc' : 'asc';
  _pagePedidos = 1;
  carregarPedidos(1, _limitPedidos, _statusPedidos, _ordemPedidos);
  toast(`Ordem da numeração: ${_ordemPedidos === 'asc' ? 'Crescente (1, 2, 3...)' : 'Decrescente (35, 34, 33...)'}`);
}

function renderPaginacaoNumeros() {
  const cont = document.getElementById('pagNumeros');
  if (!cont) return;
  cont.innerHTML = '';

  for (let i = 1; i <= _totalPaginasPedidos; i++) {
    if (i === 1 || i === _totalPaginasPedidos || (i >= _pagePedidos - 1 && i <= _pagePedidos + 1)) {
      const btn = document.createElement('button');
      btn.className = `btn-pag-num ${i === _pagePedidos ? 'active' : ''}`;
      btn.textContent = i;
      btn.onclick = () => trocarPaginaAbs(i);
      cont.appendChild(btn);
    } else if (i === _pagePedidos - 2 || i === _pagePedidos + 2) {
      const span = document.createElement('span');
      span.className = 'pag-ellipsis';
      span.textContent = '…';
      cont.appendChild(span);
    }
  }
}

function trocarPagina(delta) {
  const nova = _pagePedidos + delta;
  if (nova >= 1 && nova <= _totalPaginasPedidos) {
    carregarPedidos(nova, _limitPedidos, _statusPedidos);
  }
}

function trocarPaginaAbs(num) {
  if (num >= 1 && num <= _totalPaginasPedidos) {
    carregarPedidos(num, _limitPedidos, _statusPedidos);
  }
}

function alterarLimite(novoLimite) {
  _limitPedidos = parseInt(novoLimite, 10);
  _pagePedidos = 1;
  carregarPedidos(1, _limitPedidos, _statusPedidos);
}

function renderPedidos(lista) {
  document.getElementById('tbPedidos').innerHTML = lista.length
    ? lista.map(p => `<tr>
        <td style="font-family:monospace;font-size:11px;">#${String(p.id).padStart(3, '0')}</td>
        <td><strong>${p.nomeCliente || '—'}</strong><div style="font-size:11px;color:#777;">${p.telefoneCliente || ''}</div></td>
        <td>${p.nomeAfiliado || '—'}</td>
        <td style="font-size:12px;">${p.nomeCacamba || '—'} <span style="font-size:10px;color:#666;">(${p.tipoCacamba || 'obra'})</span></td>
        <td>${p.data || '—'}</td>
        <td><strong>R$ ${(p.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></td>
        <td><span class="badge ${p.status || ''}">${p.status || '—'}</span></td>
      </tr>`).join('')
    : '<tr><td colspan="7" style="text-align:center;color:#bbb;padding:28px;">Nenhum pedido encontrado no banco.</td></tr>';
}

function filtrarPedidos() {
  const q  = document.getElementById('searchPedidos').value.toLowerCase();
  const st = document.getElementById('filtroStatusPedido').value;

  // Se for busca textual, filtra a lista local
  if (q) {
    renderPedidos(_pedidos.filter(p => {
      const textOk = (p.nomeCliente || '').toLowerCase().includes(q) ||
                     (p.nomeAfiliado || '').toLowerCase().includes(q);
      const stOk   = !st || p.status === st;
      return textOk && stOk;
    }));
  } else {
    // Se mudou apenas o status ou limpou o texto, consulta a API com o novo filtro e reseta pra página 1
    if (st !== _statusPedidos) {
      _statusPedidos = st;
      _pagePedidos = 1;
      carregarPedidos(1, _limitPedidos, _statusPedidos);
    } else {
      renderPedidos(_pedidos);
    }
  }
}

// ── DB VIEWER (Visualizador RAW da API) ───────────────
let _dbData = {};
async function carregarDb(aba) {
  document.getElementById('dbViewer').textContent = 'Consultando banco de dados...';
  const dados = await AdminAPI.raw(aba);
  _dbData[aba] = dados;
  document.getElementById('dbViewer').textContent = JSON.stringify(dados, null, 2);
  const total = Array.isArray(dados) ? dados.length : Object.keys(dados || {}).length;
  const fonte = AdminAPI.isApiMode ? 'PostgreSQL Neon' : 'LocalStorage';
  document.getElementById('dbTabTitle').textContent = `${total} registro(s) — ${aba} (${fonte})`;
}

function setDbTab(aba, btn) {
  document.querySelectorAll('.db-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  carregarDb(aba);
}

// ── MODAL EDIÇÃO ─────────────────────────────────────
async function abrirEdicao(tipo, id) {
  const r = tipo === 'cliente'
    ? await AdminAPI.getCliente(id)
    : await AdminAPI.getAfiliado(id);

  if (!r.sucesso) { toast(r.erro, true); return; }

  const d = r.cliente || r.afiliado;
  document.getElementById('editId').value   = id;
  document.getElementById('editTipo').value = tipo;

  if (tipo === 'cliente') {
    document.getElementById('modalTitulo').textContent = `Editar Cliente — ${d.nome}`;
    document.getElementById('modalBody').innerHTML = `
      <div class="row2">
        <div class="mfield"><label>Nome *</label><input id="eNome" value="${d.nome||''}"></div>
        <div class="mfield"><label>E-mail *</label><input id="eEmail" type="email" value="${d.email||''}"></div>
      </div>
      <div class="row2">
        <div class="mfield"><label>Telefone</label><input id="eTel" value="${d.telefone||''}"></div>
        <div class="mfield"><label>CEP</label><input id="eCep" value="${d.cep||''}"></div>
      </div>
      <div class="mfield"><label>Endereço</label><input id="eEnd" value="${d.endereco||''}"></div>
      <div class="mfield"><label>Nova Senha <span style="color:#999;font-weight:400;">(deixe vazio para manter)</span></label>
        <input id="eSenha" type="password" placeholder="••••••••">
        <div class="hint-senha">Mínimo 6 caracteres</div>
      </div>
      <div class="mfield"><label>Status</label>
        <select id="eAtivo">
          <option value="true"  ${d.ativo!==false?'selected':''}>Ativo</option>
          <option value="false" ${d.ativo===false?'selected':''}>Inativo</option>
        </select>
      </div>`;
  } else {
    document.getElementById('modalTitulo').textContent = `Editar Empresa — ${d.empresa}`;
    document.getElementById('modalBody').innerHTML = `
      <div class="row2">
        <div class="mfield"><label>Empresa *</label><input id="eEmpresa" value="${d.empresa||''}"></div>
        <div class="mfield"><label>CNPJ</label><input id="eCnpj" value="${d.cnpj||''}"></div>
      </div>
      <div class="row2">
        <div class="mfield"><label>E-mail *</label><input id="eEmail" type="email" value="${d.email||''}"></div>
        <div class="mfield"><label>Telefone</label><input id="eTel" value="${d.telefone||''}"></div>
      </div>
      <div class="row2">
        <div class="mfield"><label>Cidade</label><input id="eCidade" value="${d.cidade||''}"></div>
        <div class="mfield"><label>Estado</label><input id="eEstado" value="${d.estado||''}" maxlength="2"></div>
      </div>
      <div class="mfield"><label>Nova Senha <span style="color:#999;font-weight:400;">(deixe vazio para manter)</span></label>
        <input id="eSenha" type="password" placeholder="••••••••">
        <div class="hint-senha">Mínimo 6 caracteres</div>
      </div>
      <div class="mfield"><label>Status</label>
        <select id="eAtivo">
          <option value="true"  ${d.ativo!==false?'selected':''}>Ativo</option>
          <option value="false" ${d.ativo===false?'selected':''}>Inativo</option>
        </select>
      </div>`;
  }

  document.getElementById('modalSuccess').style.display = 'none';
  document.getElementById('modalEdit').classList.add('open');
}

async function salvar() {
  const id   = document.getElementById('editId').value;
  const tipo = document.getElementById('editTipo').value;
  const senha = document.getElementById('eSenha')?.value;

  let dados = {};
  if (tipo === 'cliente') {
    dados = {
      nome:     document.getElementById('eNome').value.trim(),
      email:    document.getElementById('eEmail').value.trim(),
      telefone: document.getElementById('eTel').value.trim(),
      cep:      document.getElementById('eCep').value.trim(),
      endereco: document.getElementById('eEnd').value.trim(),
      ativo:    document.getElementById('eAtivo').value === 'true'
    };
  } else {
    dados = {
      empresa:  document.getElementById('eEmpresa').value.trim(),
      cnpj:     document.getElementById('eCnpj').value.trim(),
      email:    document.getElementById('eEmail').value.trim(),
      telefone: document.getElementById('eTel').value.trim(),
      cidade:   document.getElementById('eCidade').value.trim(),
      estado:   document.getElementById('eEstado').value.trim().toUpperCase(),
      ativo:    document.getElementById('eAtivo').value === 'true'
    };
  }
  if (senha && senha.length >= 6) dados.senha = senha;
  if (senha && senha.length > 0 && senha.length < 6) { toast('Senha deve ter pelo menos 6 caracteres.', true); return; }

  const r = tipo === 'cliente'
    ? await AdminAPI.updateCliente(id, dados)
    : await AdminAPI.updateAfiliado(id, dados);

  if (r.sucesso) {
    const ms = document.getElementById('modalSuccess');
    ms.textContent = `✅ ${tipo === 'cliente' ? 'Cliente' : 'Empresa'} atualizado com sucesso!`;
    ms.style.display = 'block';
    toast(`✅ ${tipo === 'cliente' ? 'Cliente' : 'Empresa'} atualizado!`);
    setTimeout(() => { fecharModal(); if (tipo === 'cliente') carregarClientes(); else carregarAfiliados(); }, 1200);
  } else {
    toast(r.erro || 'Erro ao salvar.', true);
  }
}

function fecharModal() { document.getElementById('modalEdit').classList.remove('open'); }
document.getElementById('modalEdit').addEventListener('click', e => { if (e.target === document.getElementById('modalEdit')) fecharModal(); });

// ── MODAL DELETE ─────────────────────────────────────
let _delId = null, _delTipo = null;

function confirmarDel(tipo, id, nome) {
  _delId   = id;
  _delTipo = tipo;
  document.getElementById('delTitulo').textContent = `Excluir ${tipo === 'cliente' ? 'cliente' : 'empresa'}?`;
  document.getElementById('delMsg').textContent    = `"${nome}" será removido permanentemente do banco de dados. Esta ação não pode ser desfeita.`;
  document.getElementById('btnConfDel').onclick    = executarDel;
  document.getElementById('modalDel').classList.add('open');
}

async function executarDel() {
  const r = _delTipo === 'cliente'
    ? await AdminAPI.deleteCliente(_delId)
    : await AdminAPI.deleteAfiliado(_delId);

  fecharDel();
  if (r.sucesso) {
    toast(`🗑 ${_delTipo === 'cliente' ? 'Cliente' : 'Empresa'} excluído do banco de dados.`);
    if (_delTipo === 'cliente') carregarClientes(); else carregarAfiliados();
  } else {
    toast(r.erro || 'Erro ao excluir.', true);
  }
}

function fecharDel() { document.getElementById('modalDel').classList.remove('open'); }
// ── Init ─────────────────────────────────────────────
(async function init() {
  await atualizarStatusApi();
  await carregarOverview();
})();

